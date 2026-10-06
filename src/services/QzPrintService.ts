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
 *
 * El certificado público y la firma se obtienen
 * desde Cloudflare Pages Functions.
 *
 * La clave privada NUNCA llega al navegador.
 * Permanece guardada como Secret en Cloudflare.
 * ==================================================
 */

let qzSecurityConfigured =
  false;


/*
 * ==================================================
 * PROMESA DE CONEXIÓN
 * ==================================================
 *
 * Evita que varias llamadas simultáneas intenten
 * abrir varias conexiones con QZ Tray a la vez.
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
   * --------------------------------------------------
   * CERTIFICADO PÚBLICO
   * --------------------------------------------------
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
   * --------------------------------------------------
   * ALGORITMO DE FIRMA
   * --------------------------------------------------
   */

  qz.security.setSignatureAlgorithm(
    "SHA512"
  );


  /*
   * --------------------------------------------------
   * FIRMA DE PETICIONES
   * --------------------------------------------------
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

  /*
   * La seguridad debe configurarse ANTES
   * de abrir la conexión con QZ Tray.
   */

  configureQzSecurity();


  /*
   * Si QZ ya está conectado,
   * no hacemos nada.
   */

  if (
    qz.websocket.isActive()
  ) {

    return;

  }


  /*
   * Si ya existe un intento de conexión,
   * todas las llamadas esperan esa misma promesa.
   */

  if (
    connectionPromise
  ) {

    return connectionPromise;

  }


  /*
   * Abrimos UNA única conexión.
   */

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

  /*
   * Si todavía hay una conexión en proceso,
   * esperamos a que termine.
   */

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


  /*
   * Dependiendo de la versión de QZ,
   * find() puede devolver una impresora
   * o una lista.
   */

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


    return printer || null;

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

      return printer[0] || null;

    }


    return printer || null;

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
 *
 * html-to-image devuelve normalmente:
 *
 * data:image/png;base64,AAAA...
 *
 * QZ Tray con flavor "base64" necesita solamente:
 *
 * AAAA...
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
    commaIndex >= 0
  ) {

    return value.substring(
      commaIndex + 1
    );

  }


  return value;

}


/*
 * ==================================================
 * IMPRIMIR ETIQUETA PNG
 * ==================================================
 *
 * FORMATO 1
 * ----------
 *
 * Diseño:
 * 80 x 285 mm
 *
 * Papel:
 * 80 x 285 mm
 *
 * Orientación:
 * portrait
 *
 *
 * FORMATO 2
 * ----------
 *
 * Diseño:
 * 235 x 110 mm
 *
 * El driver Toshiba tiene el material definido
 * como:
 *
 * 110 x 235 mm
 *
 * y orientación horizontal.
 *
 * Por eso, para QZ:
 *
 * Papel:
 * 110 x 235 mm
 *
 * Orientación:
 * landscape
 *
 * De esta forma la superficie final resultante
 * vuelve a ser:
 *
 * 235 x 110 mm
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
   * --------------------------------------------------
   * VALIDAR IMAGEN
   * --------------------------------------------------
   */

  if (
    !imageDataUrl?.trim()
  ) {

    throw new Error(
      "No se ha generado la imagen de la etiqueta."
    );

  }


  /*
   * --------------------------------------------------
   * VALIDAR DIMENSIONES
   * --------------------------------------------------
   */

  if (
    !Number.isFinite(
      labelWidthMm
    ) ||
    !Number.isFinite(
      labelHeightMm
    ) ||
    labelWidthMm <= 0 ||
    labelHeightMm <= 0
  ) {

    throw new Error(
      "Las dimensiones de la etiqueta no son válidas."
    );

  }


  /*
   * --------------------------------------------------
   * IMPRESORA CONFIGURADA
   * --------------------------------------------------
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
   * --------------------------------------------------
   * CONECTAR CON QZ
   * --------------------------------------------------
   */

  await connectQz();


  /*
   * --------------------------------------------------
   * COMPROBAR QUE LA IMPRESORA EXISTE
   * --------------------------------------------------
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
   * DETERMINAR ORIENTACIÓN
   * ==================================================
   *
   * Si el diseño es más ancho que alto,
   * estamos imprimiendo una etiqueta horizontal.
   *
   * FORMATO 2:
   *
   * 235 x 110
   *
   * => horizontal
   * ==================================================
   */

  const isLandscape =
    labelWidthMm >
    labelHeightMm;


  /*
   * ==================================================
   * TAMAÑO DE PAPEL QUE RECIBE EL DRIVER
   * ==================================================
   *
   * IMPORTANTE:
   *
   * Para etiquetas horizontales NO enviamos
   * directamente 235 x 110 como papel.
   *
   * Enviamos:
   *
   * 110 x 235
   *
   * y después usamos landscape.
   *
   * Esto coincide con la definición física
   * del material en el driver Toshiba.
   * ==================================================
   */

  const pageWidthMm =
    isLandscape
      ? labelHeightMm
      : labelWidthMm;


  const pageHeightMm =
    isLandscape
      ? labelWidthMm
      : labelHeightMm;


  const orientation:
    "portrait" |
    "landscape" =
    isLandscape
      ? "landscape"
      : "portrait";


  /*
   * ==================================================
   * CONFIGURACIÓN FÍSICA
   * ==================================================
   */

  const config =
    qz.configs.create(
      printer,
      {

        units:
          "mm",


        /*
         * FORMATO 2:
         *
         * width  = 110
         * height = 235
         */

        size: {

          width:
            pageWidthMm,

          height:
            pageHeightMm

        },


        /*
         * FORMATO 2:
         *
         * landscape
         */

        orientation,


        /*
         * Ajustar el PNG al área completa disponible.
         */

        scaleContent:
          true,


        /*
         * Ningún margen añadido por QZ.
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


        copies:
          1,


        /*
         * Conserva mejor los bordes de
         * los códigos de barras.
         */

        interpolation:
          "nearest-neighbor",


        jobName

      }
    );


  /*
   * --------------------------------------------------
   * INFORMACIÓN DE DIAGNÓSTICO
   * --------------------------------------------------
   *
   * Nos permitirá comprobar en F12 exactamente
   * qué tamaño está enviando el ordenador
   * de la línea.
   */

  console.log(
    "[QZ PRINT]",
    {
      labelWidthMm,
      labelHeightMm,
      pageWidthMm,
      pageHeightMm,
      orientation,
      scaleContent:
        true,
      printer
    }
  );


  /*
   * --------------------------------------------------
   * CONVERTIR DATA URL A BASE64
   * --------------------------------------------------
   */

  const base64Image =
    getBase64ImageData(
      imageDataUrl
    );


  /*
   * --------------------------------------------------
   * DATOS DE IMPRESIÓN
   * --------------------------------------------------
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
   * --------------------------------------------------
   * ENVIAR A QZ TRAY
   * --------------------------------------------------
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
 *
 * Esta función:
 *
 * - Utiliza la impresora configurada en este PC.
 * - Se comunica con QZ Tray.
 * - Utiliza el driver de Windows.
 * - NO modifica órdenes.
 * - NO modifica contadores.
 * - NO registra historial.
 *
 * Es únicamente una prueba física de comunicación.
 * ==================================================
 */

export async function printTestPage():
  Promise<void> {

  /*
   * --------------------------------------------------
   * IMPRESORA CONFIGURADA
   * --------------------------------------------------
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
   * --------------------------------------------------
   * CONECTAR CON QZ
   * --------------------------------------------------
   */

  await connectQz();


  /*
   * --------------------------------------------------
   * COMPROBAR QUE LA IMPRESORA EXISTE
   * --------------------------------------------------
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
   * --------------------------------------------------
   * CONFIGURACIÓN DE IMPRESIÓN
   * --------------------------------------------------
   *
   * Para la prueba usamos el driver instalado
   * en Windows tal y como está configurado.
   * --------------------------------------------------
   */

  const config =
    qz.configs.create(
      printer
    );


  /*
   * --------------------------------------------------
   * CONTENIDO DE PRUEBA
   * --------------------------------------------------
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
   * --------------------------------------------------
   * DATOS DE IMPRESIÓN
   * --------------------------------------------------
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


  await qz.print(
    config,
    data
  );

}