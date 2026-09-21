import {
  Box,
  Typography
} from "@mui/material";

import {
  useEffect,
  useRef
} from "react";

import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

import type {
  DesignerElement
} from "../designer/DesignerTypes";


interface LabelData {

  ORDER?: string;
  SKU?: string;
  DESCRIPTION?: string;
  UPPER_TEXT?: string;

  COIL_DESCRIPTION?: string;
  COIL_TECHNICAL?: string;
  COIL_LEGAL?: string;
  COIL_ORIGIN?: string;

  BARCODE?: string;
  QR?: string;
  DATE?: string;
  LOT?: string;
  COIL?: string;
  ROLLS?: string;

}


interface Props {

  elements:
    DesignerElement[];

  backgroundImage?:
    string;

  labelFormat?:
    | "FORMATO_1"
    | "FORMATO_2";

  labelData?:
    LabelData;

}


/*
 * ==================================================
 * TABLA CODE 128
 * MISMA QUE CANVAS.TSX
 * ==================================================
 */

const CODE128_PATTERNS = [

  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",

  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",

  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",

  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",

  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",

  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",

  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",

  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",

  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",

  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",

  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112"

];


/*
 * ==================================================
 * GENERAR CODE 128
 * MISMA FUNCIÓN QUE CANVAS.TSX
 * ==================================================
 */

function buildTecItCode128(
  value: string
) {

  const numeric =
    /^\d+$/.test(
      value
    );


  if (!numeric) {

    return null;

  }


  const codes:
    number[] = [];


  if (
    value.length ===
    1
  ) {

    codes.push(
      104
    );


    codes.push(
      value.charCodeAt(
        0
      ) -
      32
    );

  } else {

    codes.push(
      105
    );


    const evenPartLength =
      value.length %
      2 ===
      0
        ? value.length
        : value.length -
          1;


    for (
      let i = 0;
      i < evenPartLength;
      i += 2
    ) {

      const pair =
        value.substring(
          i,
          i + 2
        );


      codes.push(
        Number(
          pair
        )
      );

    }


    if (
      value.length %
      2 !==
      0
    ) {

      codes.push(
        100
      );


      const lastCharacter =
        value.charAt(
          value.length -
          1
        );


      codes.push(
        lastCharacter.charCodeAt(
          0
        ) -
        32
      );

    }

  }


  let checksum =
    codes[0];


  for (
    let i = 1;
    i < codes.length;
    i++
  ) {

    checksum +=
      codes[i] *
      i;

  }


  checksum =
    checksum %
    103;


  codes.push(
    checksum
  );


  codes.push(
    106
  );


  let modules =
    "";


  for (
    const code of codes
  ) {

    const pattern =
      CODE128_PATTERNS[
        code
      ];


    if (!pattern) {

      continue;

    }


    let black =
      true;


    for (
      const character of pattern
    ) {

      const width =
        Number(
          character
        );


      modules +=
        (
          black
            ? "1"
            : "0"
        ).repeat(
          width
        );


      black =
        !black;

    }

  }


  return modules;

}


/*
 * ==================================================
 * BARCODE
 * EXACTAMENTE MISMO RENDER QUE CANVAS
 * ==================================================
 */

function BarcodePreview({
  value
}: {
  value: string;
}) {

  const svgRef =
    useRef<
      SVGSVGElement
    >(
      null
    );


  useEffect(() => {

    const svg =
      svgRef.current;


    if (!svg) {

      return;

    }


    const barcodeValue =
      String(
        value ||
        "123456789"
      ).trim();


    /*
     * Limpiar SVG
     */

    while (
      svg.firstChild
    ) {

      svg.removeChild(
        svg.firstChild
      );

    }


    /*
     * Código numérico:
     * mismo generador que Canvas.
     */

    const modules =
      buildTecItCode128(
        barcodeValue
      );


    if (
      modules
    ) {

      const namespace =
        "http://www.w3.org/2000/svg";


      /*
       * EXACTAMENTE LOS MISMOS
       * VALORES DEL CANVAS
       */

      const moduleWidth =
        2;


      const barcodeWidth =
        modules.length *
        moduleWidth;


      const barHeight =
        76;


      const textGap =
        4;


      const textSize =
        18;


      const textSpace =
        24;


      const totalWidth =
        barcodeWidth;


      const totalHeight =
        barHeight +
        textGap +
        textSpace;


      /*
       * VIEWBOX
       */

      svg.setAttribute(
        "viewBox",
        `0 0 ${totalWidth} ${totalHeight}`
      );


      svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
      );


      /*
       * FONDO
       */

      const background =
        document.createElementNS(
          namespace,
          "rect"
        );


      background.setAttribute(
        "x",
        "0"
      );


      background.setAttribute(
        "y",
        "0"
      );


      background.setAttribute(
        "width",
        String(
          totalWidth
        )
      );


      background.setAttribute(
        "height",
        String(
          totalHeight
        )
      );


      background.setAttribute(
        "fill",
        "#ffffff"
      );


      svg.appendChild(
        background
      );


      /*
       * BARRAS
       */

      let x =
        0;


      let index =
        0;


      while (
        index <
        modules.length
      ) {

        if (
          modules[
            index
          ] ===
          "0"
        ) {

          x +=
            moduleWidth;


          index++;


          continue;

        }


        let blackModules =
          0;


        while (
          index <
            modules.length &&
          modules[
            index
          ] ===
            "1"
        ) {

          blackModules++;

          index++;

        }


        const rectangle =
          document.createElementNS(
            namespace,
            "rect"
          );


        rectangle.setAttribute(
          "x",
          String(
            x
          )
        );


        rectangle.setAttribute(
          "y",
          "0"
        );


        rectangle.setAttribute(
          "width",
          String(
            blackModules *
            moduleWidth
          )
        );


        rectangle.setAttribute(
          "height",
          String(
            barHeight
          )
        );


        rectangle.setAttribute(
          "fill",
          "#000000"
        );


        svg.appendChild(
          rectangle
        );


        x +=
          blackModules *
          moduleWidth;

      }


      /*
       * NÚMERO DEL SKU
       */

      const text =
        document.createElementNS(
          namespace,
          "text"
        );


      text.setAttribute(
        "x",
        String(
          totalWidth /
          2
        )
      );


      text.setAttribute(
        "y",
        String(
          barHeight +
          textGap +
          17
        )
      );


      text.setAttribute(
        "text-anchor",
        "middle"
      );


      text.setAttribute(
        "font-family",
        "Arial, Helvetica, sans-serif"
      );


      text.setAttribute(
        "font-size",
        String(
          textSize
        )
      );


      text.setAttribute(
        "font-weight",
        "400"
      );


      text.setAttribute(
        "fill",
        "#000000"
      );


      text.textContent =
        barcodeValue;


      svg.appendChild(
        text
      );


      return;

    }


    /*
     * Si algún día existe un SKU
     * alfanumérico usamos JsBarcode.
     */

    try {

      JsBarcode(
        svg,
        barcodeValue,
        {

          format:
            "CODE128",

          displayValue:
            true,

          height:
            76,

          width:
            2,

          margin:
            0,

          marginTop:
            0,

          marginBottom:
            0,

          marginLeft:
            0,

          marginRight:
            0,

          textAlign:
            "center",

          textPosition:
            "bottom",

          textMargin:
            4,

          font:
            "Arial",

          fontSize:
            18,

          background:
            "#ffffff",

          lineColor:
            "#000000"

        }
      );

    } catch (
      error
    ) {

      console.error(
        "Error generando código de barras:",
        error
      );

    }

  }, [
    value
  ]);


  return (

    <Box
      sx={{

        width:
          "100%",

        height:
          "100%",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        overflow:
          "hidden",

        backgroundColor:
          "#ffffff"

      }}
    >

      <svg
        ref={
          svgRef
        }

        preserveAspectRatio="xMidYMid meet"

        style={{

          width:
            "100%",

          height:
            "100%",

          display:
            "block",

          overflow:
            "visible"

        }}
      />

    </Box>

  );

}


/*
 * ==================================================
 * QR
 * ==================================================
 */

function QRPreview({
  value
}: {
  value: string;
}) {

  const ref =
    useRef<
      HTMLCanvasElement
    >(
      null
    );


  useEffect(() => {

    if (
      !ref.current
    ) {

      return;

    }


    QRCode.toCanvas(
      ref.current,
      value ||
      "123456789",
      {

        margin:
          0,

        width:
          100

      }
    );

  }, [
    value
  ]);


  return (

    <canvas
      ref={
        ref
      }

      style={{

        width:
          "100%",

        height:
          "100%",

        display:
          "block"

      }}
    />

  );

}


/*
 * ==================================================
 * COMPONENTE
 * ==================================================
 */

export default function LabelPreview({
  elements,
  backgroundImage,
  labelFormat = "FORMATO_1",
  labelData
}: Props) {


  /*
   * ==================================================
   * DIMENSIONES
   * ==================================================
   */

  const format =
    labelFormat ===
    "FORMATO_2"

      ? {

          width:
            240,

          height:
            110

        }

      : {

          width:
            80,

          height:
            285

        };


  /*
   * ==================================================
   * ESCALA PREVIEW
   * ==================================================
   */

  const maxPreviewWidth =
    labelFormat ===
    "FORMATO_2"
      ? 850
      : 360;


  const maxPreviewHeight =
    labelFormat ===
    "FORMATO_2"
      ? 430
      : 650;


  const MM_TO_PX =
    96 /
    25.4;


  const realWidthPx =
    format.width *
    MM_TO_PX;


  const realHeightPx =
    format.height *
    MM_TO_PX;


  const scale =
    Math.min(

      maxPreviewWidth /
      realWidthPx,

      maxPreviewHeight /
      realHeightPx,

      1

    );


  const previewWidth =
    realWidthPx *
    scale;


  const previewHeight =
    realHeightPx *
    scale;


  /*
   * ==================================================
   * VALOR DEL ELEMENTO
   * ==================================================
   */

  function getElementValue(
    element:
      DesignerElement
  ): string {


    /*
     * BINDING
     */

    if (
      element.binding &&
      labelData
    ) {

      const field =
        element.binding
          .replace(
            "${",
            ""
          )
          .replace(
            "}",
            ""
          )
          .trim() as
          keyof LabelData;


      const value =
        labelData[
          field
        ];


      if (
        value !==
        undefined
      ) {

        return String(
          value
        );

      }

    }


    /*
     * FIELD
     */

    if (
      element.field &&
      labelData
    ) {

      const field =
        String(
          element.field
        )
          .replace(
            "${",
            ""
          )
          .replace(
            "}",
            ""
          )
          .trim() as
          keyof LabelData;


      const value =
        labelData[
          field
        ];


      if (
        value !==
        undefined
      ) {

        return String(
          value
        );

      }

    }


    /*
     * PLACEHOLDERS
     */

    if (
      element.text &&
      labelData
    ) {

      let text =
        element.text;


      const replacements:
        Record<
          string,
          string
        > = {

        ORDER:
          labelData.ORDER ??
          "",

        SKU:
          labelData.SKU ??
          "",

        DESCRIPTION:
          labelData.DESCRIPTION ??
          "",

        UPPER_TEXT:
          labelData.UPPER_TEXT ??
          "",

        COIL_DESCRIPTION:
          labelData.COIL_DESCRIPTION ??
          "",

        COIL_TECHNICAL:
          labelData.COIL_TECHNICAL ??
          "",

        COIL_LEGAL:
          labelData.COIL_LEGAL ??
          "",

        COIL_ORIGIN:
          labelData.COIL_ORIGIN ??
          "",

        BARCODE:
          labelData.BARCODE ??
          "",

        QR:
          labelData.QR ??
          "",

        DATE:
          labelData.DATE ??
          "",

        LOT:
          labelData.LOT ??
          "",

        COIL:
          labelData.COIL ??
          "",

        ROLLS:
          labelData.ROLLS ??
          ""

      };


      Object.entries(
        replacements
      ).forEach(
        ([
          key,
          value
        ]) => {

          text =
            text
              .replaceAll(
                `{${key}}`,
                value
              )
              .replaceAll(
                `\${${key}}`,
                value
              );

        }
      );


      return text;

    }


    return String(
      element.value ??
      element.text ??
      ""
    );

  }


  /*
   * ==================================================
   * ALINEACIÓN
   * EXACTAMENTE COMO CANVAS
   * ==================================================
   */

  function getTextAlign(
    element:
      DesignerElement
  ):
    | "left"
    | "center"
    | "right" {

    const field =
      String(
        element.field ??
        ""
      ).toUpperCase();


    if (
      field ===
        "UPPER_TEXT" ||
      field ===
        "DESCRIPTION"
    ) {

      return "center";

    }


    if (
      field ===
        "COIL_DESCRIPTION" ||
      field ===
        "COIL_TECHNICAL"
    ) {

      return "center";

    }


    if (
      field ===
      "COIL_ORIGIN"
    ) {

      return "center";

    }


    if (
      field ===
        "ORDER" ||
      field ===
        "LOT" ||
      field ===
        "COIL" ||
      field ===
        "SKU"
    ) {

      return "center";

    }


    return "left";

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box
      sx={{

        width:
          `${previewWidth}px`,

        height:
          `${previewHeight}px`,

        overflow:
          "hidden",

        border:
          "1px solid #bdbdbd",

        backgroundColor:
          "#ffffff",

        position:
          "relative",

        margin:
          "0 auto"

      }}
    >

      <Box
        sx={{

          position:
            "absolute",

          left:
            0,

          top:
            0,

          width:
            `${format.width}mm`,

          height:
            `${format.height}mm`,

          transform:
            `scale(${scale})`,

          transformOrigin:
            "top left",

          backgroundColor:
            "#ffffff",

          overflow:
            "hidden"

        }}
      >


        {/* FONDO */}

        {backgroundImage && (

          <img
            src={
              backgroundImage
            }

            alt="Plantilla"

            draggable={
              false
            }

            style={{

              position:
                "absolute",

              top:
                0,

              left:
                0,

              width:
                "100%",

              height:
                "100%",

              objectFit:
                "fill",

              display:
                "block",

              margin:
                0,

              padding:
                0,

              border:
                0,

              zIndex:
                0,

              pointerEvents:
                "none",

              userSelect:
                "none"

            }}
          />

        )}


        {/* ELEMENTOS */}

        {elements
          .filter(
            element =>
              element.visible !==
              false
          )
          .map(
            element => {

              const value =
                getElementValue(
                  element
                );


              const field =
                String(
                  element.field ??
                  ""
                ).toUpperCase();


              const textAlign =
                getTextAlign(
                  element
                );


              const isUpperText =
                field ===
                "UPPER_TEXT";


              const isCoilDescription =
                field ===
                "COIL_DESCRIPTION";


              const isCoilTechnical =
                field ===
                "COIL_TECHNICAL";


              const isCoilLegal =
                field ===
                "COIL_LEGAL";


              const isCoilOrigin =
                field ===
                "COIL_ORIGIN";


              const isBoxField =
                field ===
                  "ORDER" ||
                field ===
                  "LOT" ||
                field ===
                  "COIL";


              const centerVertically =
                isUpperText ||
                isCoilDescription ||
                isCoilTechnical ||
                isCoilOrigin ||
                isBoxField;


              /*
               * ==================================================
               * CONTENEDOR
               * MISMO CSS QUE CANVAS
               * ==================================================
               */

              const commonStyle = {

                position:
                  "absolute" as const,

                left:
                  `${element.x}mm`,

                top:
                  `${element.y}mm`,

                width:
                  `${element.width}mm`,

                height:
                  `${element.height}mm`,

                transform:
                  `rotate(${element.rotation || 0}deg)`,

                transformOrigin:
                  "center",

                zIndex:
                  2,

                border:
                  "1px solid transparent",

                boxSizing:
                  "border-box" as const,

                overflow:
                  "hidden",

                display:
                  "flex",

                alignItems:
                  centerVertically
                    ? "center"
                    : "flex-start",

                justifyContent:
                  textAlign ===
                  "center"
                    ? "center"
                    : textAlign ===
                        "right"
                      ? "flex-end"
                      : "flex-start",

                pointerEvents:
                  "none" as const

              };


              /*
               * ==================================================
               * BARCODE
               * ==================================================
               */

              if (
                element.type ===
                "barcode"
              ) {

                return (

                  <Box
                    key={
                      element.id
                    }

                    sx={
                      commonStyle
                    }
                  >

                    <BarcodePreview
                      value={
                        value
                      }
                    />

                  </Box>

                );

              }


              /*
               * ==================================================
               * QR
               * ==================================================
               */

              if (
                element.type ===
                "qr"
              ) {

                return (

                  <Box
                    key={
                      element.id
                    }

                    sx={
                      commonStyle
                    }
                  >

                    <QRPreview
                      value={
                        value
                      }
                    />

                  </Box>

                );

              }


              /*
               * ==================================================
               * LOGO
               * ==================================================
               */

              if (
                element.type ===
                "logo"
              ) {

                return (

                  <Box
                    key={
                      element.id
                    }

                    sx={
                      commonStyle
                    }
                  >

                    <Box
                      component="img"

                      src="/rivulis-logo.png"

                      alt="Rivulis"

                      sx={{

                        width:
                          "100%",

                        height:
                          "100%",

                        objectFit:
                          "contain"

                      }}
                    />

                  </Box>

                );

              }


              /*
               * ==================================================
               * TEXTO
               * ==================================================
               */

              if (
                element.type ===
                  "text" ||
                element.type ===
                  "field"
              ) {

                return (

                  <Box
                    key={
                      element.id
                    }

                    sx={
                      commonStyle
                    }
                  >

                    <Typography
                      component="div"

                      sx={{

                        width:
                          "100%",

                        height:
                          "100%",

                        display:
                          "flex",

                        flexDirection:
                          "column",

                        justifyContent:
                          centerVertically
                            ? "center"
                            : "flex-start",

                        textAlign,

                        fontSize:
                          `${element.fontSize}px`,

                        fontWeight:
                          element.fontWeight ||
                          400,

                        color:
                          element.color ||
                          "#000000",

                        lineHeight:
                          isUpperText
                            ? 1.25
                            : isCoilTechnical
                              ? 1.25
                              : isCoilLegal
                                ? 1.15
                                : 1.1,

                        whiteSpace:
                          "pre-wrap",

                        overflow:
                          "hidden",

                        overflowWrap:
                          "break-word",

                        wordBreak:
                          "normal",

                        userSelect:
                          "none",

                        boxSizing:
                          "border-box",

                        m:
                          0,

                        p:
                          0

                      }}
                    >

                      {value}

                    </Typography>

                  </Box>

                );

              }


              return null;

            }
          )}

      </Box>

    </Box>

  );

}