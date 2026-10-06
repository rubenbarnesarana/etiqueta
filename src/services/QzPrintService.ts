import qz from "qz-tray";


/*
 * ==================================================
 * CLAVE DE IMPRESORA LOCAL
 * ==================================================
 */

export const LABEL_PRINTER_STORAGE_KEY =
  "labelPrinter";


/*
 * ==================================================
 * SEGURIDAD QZ TRAY
 * ==================================================
 */

let qzSecurityConfigured =
  false;


/*
 * ==================================================
 * PROMESA DE CONEXIÓN
 * ==================================================
 */

let connectionPromise:
  Promise<void> | null =
  null;


/*
 * ==================================================
 * CONFIGURAR SEGURIDAD
 * ==================================================
 */

function configureQzSecurity():
  void {

  if (
    qzSecurityConfigured
  ) {

    return;

  }


  /*
   * CERTIFICADO PÚBLICO
   */

  qz.security.setCertificatePromise(
    async () => {

      const response =
        await fetch(
          "/api/qz/certificate",
          {
            method:
              "GET",

            cache:
              "no-store"
          }
        );


      if (
        !response.ok
      ) {

        const message =
          await response.text();


        throw new Error(
          message ||
          "No se ha podido obtener el certificado de QZ Tray."
        );

      }


      return await response.text();

    }
  );


  /*
   * ALGORITMO DE FIRMA
   */

  qz.security.setSignatureAlgorithm(
    "SHA512"
  );


  /*
   * FIRMA DE PETICIONES
   */

  qz.security.setSignaturePromise(
    (
      toSign: string
    ) => {

      return async (
        resolve: (
          signature: string
        ) => void,

        reject: (
          error: unknown
        ) => void
      ) => {

        try {

          const response =
            await fetch(
              "/api/qz/sign",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "text/plain;charset=UTF-8"
                },

                body:
                  toSign,

                cache:
                  "no-store"
              }
            );


          if (
            !response.ok
          ) {

            const message =
              await response.text();


            throw new Error(
              message ||
              "No se ha podido firmar la petición de QZ Tray."
            );

          }


          const signature =
            await response.text();


          resolve(
            signature.trim()
          );

        }
        catch (
          error
        ) {

          reject(
            error
          );

        }

      };

    }
  );


  qzSecurityConfigured =
    true;

}


/*
 * ==================================================
 * ESTADO DE CONEXIÓN
 * ==================================================
 */

export function isQzConnected():
  boolean {

  return qz.websocket.isActive();

}


/*
 * ==================================================
 * CONECTAR CON QZ TRAY
 * ==================================================
 */

export async function connectQz():
  Promise<void> {

  configureQzSecurity();


  if (
    qz.websocket.isActive()
  ) {

    return;

  }


  if (
    connectionPromise
  ) {

    return connectionPromise;

  }


  connectionPromise =
    qz.websocket
      .connect()
      .then(
        () => {

          return;

        }
      )
      .finally(
        () => {

          connectionPromise =
            null;

        }
      );


  return connectionPromise;

}


/*
 * ==================================================
 * DESCONECTAR DE QZ TRAY
 * ==================================================
 */

export async function disconnectQz():
  Promise<void> {

  if (
    connectionPromise
  ) {

    try {

      await connectionPromise;

    }
    catch {

      connectionPromise =
        null;

    }

  }


  if (
    !qz.websocket.isActive()
  ) {

    return;

  }


  await qz.websocket.disconnect();

}


/*
 * ==================================================
 * OBTENER IMPRESORAS INSTALADAS
 * ==================================================
 */

export async function getInstalledPrinters():
  Promise<string[]> {

  await connectQz();


  const printers =
    await qz.printers.find();


  if (
    Array.isArray(
      printers
    )
  ) {

    return printers;

  }


  if (
    printers
  ) {

    return [
      printers
    ];

  }


  return [];

}


/*
 * ==================================================
 * OBTENER IMPRESORA PREDETERMINADA
 * ==================================================
 */

export async function getDefaultPrinter():
  Promise<string | null> {

  await connectQz();


  try {

    const printer =
      await qz.printers.getDefault();


    return (
      printer ||
      null
    );

  }
  catch {

    return null;

  }

}


/*
 * ==================================================
 * BUSCAR IMPRESORA POR NOMBRE
 * ==================================================
 */

export async function findPrinter(
  printerName: string
):
  Promise<string | null> {

  await connectQz();


  try {

    const printer =
      await qz.printers.find(
        printerName
      );


    if (
      Array.isArray(
        printer
      )
    ) {

      return (
        printer[0] ||
        null
      );

    }


    return (
      printer ||
      null
    );

  }
  catch {

    return null;

  }

}


/*
 * ==================================================
 * OBTENER IMPRESORA CONFIGURADA EN ESTE PC
 * ==================================================
 */

export function getConfiguredLabelPrinter():
  string | null {

  const printer =
    localStorage.getItem(
      LABEL_PRINTER_STORAGE_KEY
    );


  if (
    !printer?.trim()
  ) {

    return null;

  }


  return printer;

}


/*
 * ==================================================
 * PREPARAR IMAGEN BASE64
 * ==================================================
 */

function getBase64ImageData(
  imageDataUrl: string
):
  string {

  const value =
    imageDataUrl.trim();


  const commaIndex =
    value.indexOf(
      ","
    );


  if (
    value.startsWith(
      "data:"
    ) &&
    commaIndex >=
      0
  ) {

    return value.substring(
      commaIndex +
      1
    );

  }


  return value;

}


/*
 * ==================================================
 * IMPRIMIR ETIQUETA PNG
 * ==================================================
 *
 * FORMATO 1:
 *
 * 80 x 285 mm
 * orientación vertical
 *
 *
 * FORMATO 2:
 *
 * 235 x 110 mm
 * orientación horizontal
 *
 *
 * Para evitar que el driver Toshiba reduzca
 * el Formato 2, indicamos explícitamente a QZ:
 *
 * - tamaño físico
 * - orientación
 * - escala al tamaño completo
 * - márgenes 0
 *
 * ==================================================
 */

export async function printLabelImage(
  imageDataUrl: string,
  labelWidthMm: number,
  labelHeightMm: number,
  jobName = "Etiqueta Rivulis"
):
  Promise<void> {

  /*
   * VALIDAR IMAGEN
   */

  if (
    !imageDataUrl?.trim()
  ) {

    throw new Error(
      "No se ha generado la imagen de la etiqueta."
    );

  }


  /*
   * VALIDAR DIMENSIONES
   */

  if (
    !Number.isFinite(
      labelWidthMm
    ) ||
    !Number.isFinite(
      labelHeightMm
    ) ||
    labelWidthMm <=
      0 ||
    labelHeightMm <=
      0
  ) {

    throw new Error(
      "Las dimensiones de la etiqueta no son válidas."
    );

  }


  /*
   * IMPRESORA CONFIGURADA
   */

  const configuredPrinter =
    getConfiguredLabelPrinter();


  if (
    !configuredPrinter
  ) {

    throw new Error(
      "No hay ninguna impresora de etiquetas configurada en este ordenador."
    );

  }


  /*
   * CONECTAR CON QZ
   */

  await connectQz();


  /*
   * COMPROBAR IMPRESORA
   */

  const printer =
    await findPrinter(
      configuredPrinter
    );


  if (
    !printer
  ) {

    throw new Error(
      `No se ha encontrado la impresora configurada: ${configuredPrinter}`
    );

  }


  /*
   * ==================================================
   * ORIENTACIÓN
   * ==================================================
   *
   * Si el ancho es mayor que el alto,
   * se trata de una etiqueta horizontal.
   *
   * FORMATO 2:
   *
   * 235 x 110
   *
   * => landscape
   *
   * FORMATO 1:
   *
   * 80 x 285
   *
   * => portrait
   *
   * ==================================================
   */

  const isLandscape =
    labelWidthMm >
    labelHeightMm;


  const orientation:
    "portrait" |
    "landscape" =

    isLandscape
      ? "landscape"
      : "portrait";


  /*
   * ==================================================
   * CONFIGURACIÓN FÍSICA QZ
   * ==================================================
   */

  const config =
    qz.configs.create(
      printer,
      {

        /*
         * Unidades físicas.
         */
        units:
          "mm",


        /*
         * Tamaño REAL de la etiqueta.
         */
        size: {

          width:
            labelWidthMm,

          height:
            labelHeightMm

        },


        /*
         * IMPORTANTE:
         *
         * Evita que QZ dependa de la orientación
         * configurada por defecto en el driver.
         */
        orientation,


        /*
         * IMPORTANTE:
         *
         * El contenido debe ocupar el tamaño físico
         * completo de la etiqueta.
         */
        scaleContent:
          true,


        /*
         * Sin márgenes.
         */
        margins: {

          top:
            0,

          right:
            0,

          bottom:
            0,

          left:
            0

        },


        /*
         * Una etiqueta por trabajo.
         */
        copies:
          1,


        /*
         * Mantener códigos de barras definidos.
         */
        interpolation:
          "nearest-neighbor",


        /*
         * Nombre visible en la cola.
         */
        jobName

      }
    );


  /*
   * CONVERTIR DATA URL A BASE64
   */

  const base64Image =
    getBase64ImageData(
      imageDataUrl
    );


  /*
   * DATOS DE IMPRESIÓN
   */

  const data = [
    {

      type:
        "pixel",

      format:
        "image",

      flavor:
        "base64",

      data:
        base64Image

    }
  ];


  /*
   * ENVIAR A QZ TRAY
   */

  await qz.print(
    config,
    data
  );

}


/*
 * ==================================================
 * IMPRESIÓN DE PRUEBA
 * ==================================================
 */

export async function printTestPage():
  Promise<void> {

  /*
   * IMPRESORA CONFIGURADA
   */

  const configuredPrinter =
    getConfiguredLabelPrinter();


  if (
    !configuredPrinter
  ) {

    throw new Error(
      "No hay ninguna impresora de etiquetas configurada en este ordenador."
    );

  }


  /*
   * CONECTAR
   */

  await connectQz();


  /*
   * COMPROBAR IMPRESORA
   */

  const printer =
    await findPrinter(
      configuredPrinter
    );


  if (
    !printer
  ) {

    throw new Error(
      `No se ha encontrado la impresora configurada: ${configuredPrinter}`
    );

  }


  /*
   * Para la prueba dejamos que el driver utilice
   * su configuración predeterminada.
   */

  const config =
    qz.configs.create(
      printer
    );


  /*
   * CONTENIDO DE PRUEBA
   */

  const html =
    `
      <div
        style="
          width: 700px;
          padding: 40px;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
          color: #000000;
          background: #ffffff;
        "
      >

        <div
          style="
            border: 4px solid #0B7A3B;
            padding: 35px;
            text-align: center;
          "
        >

          <div
            style="
              font-size: 42px;
              font-weight: 800;
              color: #0B7A3B;
              margin-bottom: 25px;
            "
          >
            RIVULIS
          </div>


          <div
            style="
              font-size: 30px;
              font-weight: 700;
              margin-bottom: 20px;
            "
          >
            PRUEBA DE IMPRESIÓN
          </div>


          <div
            style="
              font-size: 22px;
              margin-bottom: 15px;
            "
          >
            Programa Etiquetas · QI02
          </div>


          <div
            style="
              font-size: 18px;
              margin-bottom: 30px;
            "
          >
            Comunicación mediante QZ Tray
          </div>


          <div
            style="
              border-top: 2px solid #000000;
              padding-top: 25px;
              font-size: 17px;
              text-align: left;
            "
          >

            <b>Impresora:</b>
            ${configuredPrinter}

            <br /><br />

            <b>Resultado esperado:</b>
            Si estás leyendo esta hoja, la comunicación entre
            el programa web, QZ Tray y la impresora funciona correctamente.

          </div>

        </div>

      </div>
    `;


  /*
   * DATOS DE IMPRESIÓN
   */

  const data = [
    {

      type:
        "pixel",

      format:
        "html",

      flavor:
        "plain",

      data:
        html

    }
  ];


  /*
   * ENVIAR
   */

  await qz.print(
    config,
    data
  );

}