import {
  toPng
} from "html-to-image";


//==================================================
// OPCIONES DE GENERACIÓN
//==================================================

export interface LabelImageOptions {

  widthMm: number;

  heightMm: number;

  dpi?: number;

}


//==================================================
// CONVERTIR ETIQUETA HTML A PNG
//==================================================
//
// Recibe el elemento HTML que representa físicamente
// la etiqueta y genera un PNG listo para QZ Tray.
//
// IMPORTANTE:
//
// - NO imprime.
// - NO modifica órdenes.
// - NO modifica contadores.
// - NO registra historial.
//
//==================================================

export async function renderLabelToPng(

  element: HTMLElement,

  options: LabelImageOptions

): Promise<string> {


  //------------------------------------------------
  // VALIDAR ELEMENTO
  //------------------------------------------------

  if (
    !element
  ) {

    throw new Error(
      "No se ha encontrado la etiqueta para generar la imagen."
    );

  }


  //------------------------------------------------
  // VALIDAR DIMENSIONES
  //------------------------------------------------

  if (
    !Number.isFinite(
      options.widthMm
    ) ||
    !Number.isFinite(
      options.heightMm
    ) ||
    options.widthMm <= 0 ||
    options.heightMm <= 0
  ) {

    throw new Error(
      "Las dimensiones de la etiqueta no son válidas."
    );

  }


  //------------------------------------------------
  // DPI
  //------------------------------------------------
  //
  // Las Toshiba que estamos utilizando trabajan
  // inicialmente a 203 dpi.
  //
  // CSS utiliza una referencia de 96 dpi.
  //
  // Por eso:
  //
  // pixelRatio = DPI impresora / 96
  //
  //------------------------------------------------

  const dpi =
    options.dpi ??
    203;


  const pixelRatio =
    dpi /
    96;


  //------------------------------------------------
  // ESPERAR FUENTES
  //------------------------------------------------

  if (
    document.fonts?.ready
  ) {

    await document.fonts.ready;

  }


  //------------------------------------------------
  // ESPERAR IMÁGENES
  //------------------------------------------------

  const images =
    Array.from(
      element.querySelectorAll(
        "img"
      )
    );


  await Promise.all(

    images.map(

      async image => {


        if (
          image.complete
        ) {

          try {

            await image.decode();

          }
          catch {

            // La imagen ya puede estar disponible aunque
            // decode() no esté soportado o falle.

          }


          return;

        }


        await new Promise<void>(
          resolve => {


            const finish =
              () => {

                image.removeEventListener(
                  "load",
                  finish
                );

                image.removeEventListener(
                  "error",
                  finish
                );

                resolve();

              };


            image.addEventListener(
              "load",
              finish,
              {
                once: true
              }
            );


            image.addEventListener(
              "error",
              finish,
              {
                once: true
              }
            );

          }
        );

      }

    )

  );


  //------------------------------------------------
  // ESPERAR RENDERIZADO
  //------------------------------------------------
  //
  // LabelPreview genera elementos como QR y barcode.
  // Esperamos dos frames para que React y el navegador
  // hayan terminado de pintar esos elementos.
  //
  //------------------------------------------------

  await new Promise<void>(
    resolve => {

      requestAnimationFrame(
        () => {

          requestAnimationFrame(
            () => {

              resolve();

            }
          );

        }
      );

    }
  );


  //------------------------------------------------
  // GENERAR PNG
  //------------------------------------------------
  //
  // LabelPreview se muestra escalado en pantalla.
  //
  // Al clonar el nodo eliminamos esa transformación
  // para obtener la etiqueta a tamaño físico completo.
  //
  //------------------------------------------------

  const imageDataUrl =
    await toPng(
      element,
      {

        pixelRatio,

        cacheBust:
          true,

        backgroundColor:
          "#FFFFFF",

        style: {

          transform:
            "none",

          transformOrigin:
            "top left"

        }

      }
    );


  //------------------------------------------------
  // VALIDAR RESULTADO
  //------------------------------------------------

  if (
    !imageDataUrl ||
    !imageDataUrl.startsWith(
      "data:image/png"
    )
  ) {

    throw new Error(
      "No se ha podido generar la imagen PNG de la etiqueta."
    );

  }


  return imageDataUrl;

}