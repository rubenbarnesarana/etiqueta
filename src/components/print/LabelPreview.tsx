import { Box, Typography } from "@mui/material";

import type {
  DesignerElement
} from "../designer/DesignerTypes";

interface LabelData {
  SKU?: string;
  DESCRIPTION?: string;
  BARCODE?: string;
  QR?: string;
  DATE?: string;
  LOT?: string;
  COIL?: string;
  ROLLS?: string;
}

interface Props {

  elements: DesignerElement[];

  backgroundImage?: string;

  labelFormat?:
    | "FORMATO_1"
    | "FORMATO_2";

  labelData?: LabelData;

}


export default function LabelPreview({
  elements,
  backgroundImage,
  labelFormat = "FORMATO_1",
  labelData
}: Props) {


  //--------------------------------------------------
  // DIMENSIONES
  //--------------------------------------------------

  const format =
    labelFormat === "FORMATO_2"

      ? {
          width: 110,
          height: 240
        }

      : {
          width: 80,
          height: 285
        };


  //--------------------------------------------------
  // ESCALA DE PREVISUALIZACIÓN
  //--------------------------------------------------

  const previewWidth =
    520;

  const scale =
    previewWidth /
    format.width;

  const previewHeight =
    format.height *
    scale;


  //--------------------------------------------------
  // OBTENER VALOR DEL ELEMENTO
  //--------------------------------------------------

  function getElementValue(
    element: DesignerElement
  ): string {

    //------------------------------------------------
    // Si ya viene preparado desde TemplateEngine
    //------------------------------------------------

    if (
      element.text &&
      !element.text.includes("{")
    ) {

      return element.text;

    }


    //------------------------------------------------
    // Binding
    //------------------------------------------------

    if (
      element.binding &&
      labelData
    ) {

      const field =
        element.binding
          .replace("${", "")
          .replace("}", "")
          .trim() as keyof LabelData;


      if (
        labelData[field] !==
        undefined
      ) {

        return String(
          labelData[field]
        );

      }

    }


    //------------------------------------------------
    // Field
    //------------------------------------------------

    if (
      element.field &&
      labelData
    ) {

      const field =
        element.field
          .replace("${", "")
          .replace("}", "")
          .trim() as keyof LabelData;


      if (
        labelData[field] !==
        undefined
      ) {

        return String(
          labelData[field]
        );

      }

    }


    //------------------------------------------------
    // Placeholders
    //------------------------------------------------

    if (
      element.text &&
      labelData
    ) {

      return element.text

        .replaceAll(
          "{SKU}",
          labelData.SKU ?? ""
        )

        .replaceAll(
          "{DESCRIPTION}",
          labelData.DESCRIPTION ?? ""
        )

        .replaceAll(
          "{BARCODE}",
          labelData.BARCODE ?? ""
        )

        .replaceAll(
          "{QR}",
          labelData.QR ?? ""
        )

        .replaceAll(
          "{DATE}",
          labelData.DATE ?? ""
        )

        .replaceAll(
          "{LOT}",
          labelData.LOT ?? ""
        )

        .replaceAll(
          "{COIL}",
          labelData.COIL ?? ""
        )

        .replaceAll(
          "{ROLLS}",
          labelData.ROLLS ?? ""
        );

    }


    return element.text ?? "";

  }


  //--------------------------------------------------
  // RENDER
  //--------------------------------------------------

  return (

    <Box
      sx={{
        width: previewWidth,
        height: previewHeight,
        overflow: "hidden",
        border: "1px solid #000",
        backgroundColor: "#fff",
        position: "relative",
        margin: "0 auto"
      }}
    >

      {/* ============================================
          ETIQUETA REAL
          ============================================ */}

      <Box
        sx={{
          position: "absolute",

          left: 0,
          top: 0,

          width:
            `${format.width}mm`,

          height:
            `${format.height}mm`,

          transform:
            `scale(${scale})`,

          transformOrigin:
            "top left",

          backgroundColor:
            "#fff",

          backgroundImage:
            backgroundImage
              ? `url("${backgroundImage}")`
              : "none",

          backgroundSize:
            "100% 100%",

          backgroundPosition:
            "center",

          backgroundRepeat:
            "no-repeat",

          overflow:
            "hidden"
        }}
      >


        {/* ==========================================
            ELEMENTOS DINÁMICOS
            ========================================== */}

        {elements.map(
          element => {

            if (
              element.visible === false
            ) {

              return null;

            }


            const value =
              getElementValue(
                element
              );


            //------------------------------------------------
            // POSICIÓN
            //------------------------------------------------

            const style = {

              position:
                "absolute" as const,

              left:
                element.x,

              top:
                element.y,

              width:
                element.width,

              height:
                element.height,

              transform:
                `rotate(${element.rotation}deg)`,

              transformOrigin:
                "center center",

              overflow:
                "hidden",

              color:
                element.color,

              fontSize:
                element.fontSize,

              fontWeight:
                element.fontWeight,

              lineHeight:
                1.1,

              whiteSpace:
                "pre-wrap" as const,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "flex-start",

              pointerEvents:
                "none" as const

            };


            //------------------------------------------------
            // TEXTO / CAMPO
            //------------------------------------------------

            if (
              element.type === "text" ||
              element.type === "field"
            ) {

              return (

                <Box
                  key={
                    element.id
                  }
                  sx={
                    style
                  }
                >

                  <Typography
                    sx={{
                      fontSize:
                        element.fontSize,

                      fontWeight:
                        element.fontWeight,

                      color:
                        element.color,

                      lineHeight:
                        1.1,

                      width:
                        "100%",

                      overflow:
                        "hidden",

                      whiteSpace:
                        "pre-wrap"
                    }}
                  >

                    {value}

                  </Typography>

                </Box>

              );

            }


            //------------------------------------------------
            // CÓDIGO DE BARRAS
            //------------------------------------------------

            if (
              element.type ===
              "barcode"
            ) {

              return (

                <Box
                  key={
                    element.id
                  }
                  sx={{
                    ...style,

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    backgroundColor:
                      "transparent"
                  }}
                >

                  {/* REPRESENTACIÓN VISUAL */}
                  <Box
                    sx={{
                      width:
                        "90%",

                      height:
                        "65%",

                      display:
                        "flex",

                      alignItems:
                        "stretch",

                      justifyContent:
                        "space-between",

                      overflow:
                        "hidden"
                    }}
                  >

                    {Array.from({
                      length: 42
                    }).map(
                      (_, index) => (

                        <Box
                          key={
                            index
                          }
                          sx={{
                            width:
                              index % 3 === 0
                                ? 2
                                : index % 5 === 0
                                  ? 1
                                  : 3,

                            backgroundColor:
                              "#000"
                          }}
                        />

                      )
                    )}

                  </Box>


                  {/* VALOR */}

                  {element.barcodeDisplayValue !==
                    false && (

                    <Typography
                      sx={{
                        fontSize:
                          10,

                        color:
                          "#000",

                        lineHeight:
                          1,

                        mt:
                          0.5
                      }}
                    >

                      {value}

                    </Typography>

                  )}

                </Box>

              );

            }


            //------------------------------------------------
            // QR
            //------------------------------------------------

            if (
              element.type ===
              "qr"
            ) {

              return (

                <Box
                  key={
                    element.id
                  }
                  sx={{
                    ...style,

                    justifyContent:
                      "center",

                    alignItems:
                      "center"
                  }}
                >

                  <Box
                    sx={{
                      width:
                        "80%",

                      height:
                        "80%",

                      border:
                        "3px solid #000",

                      display:
                        "grid",

                      gridTemplateColumns:
                        "repeat(7, 1fr)",

                      gridTemplateRows:
                        "repeat(7, 1fr)",

                      gap:
                        "1px",

                      padding:
                        "3px",

                      backgroundColor:
                        "#fff"
                    }}
                  >

                    {Array.from({
                      length: 49
                    }).map(
                      (_, index) => (

                        <Box
                          key={
                            index
                          }
                          sx={{
                            backgroundColor:
                              (
                                index * 17 +
                                value.length * 7
                              ) %
                              3 ===
                              0
                                ? "#000"
                                : "#fff"
                          }}
                        />

                      )
                    )}

                  </Box>

                </Box>

              );

            }


            //------------------------------------------------
            // LOGO
            //------------------------------------------------

            if (
              element.type ===
              "logo"
            ) {

              return (

                <Box
                  key={
                    element.id
                  }
                  sx={{
                    ...style,

                    justifyContent:
                      "center"
                  }}
                >

                  <Box
                    component="img"
                    src="/rivulis-logo.png"
                    alt="Rivulis"
                    sx={{
                      maxWidth:
                        "100%",

                      maxHeight:
                        "100%",

                      objectFit:
                        "contain"
                    }}
                  />

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