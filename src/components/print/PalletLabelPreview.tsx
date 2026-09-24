import {
  Box,
  Typography
} from "@mui/material";

import type {
  ReactNode
} from "react";


interface Props {

  description: string;

  sku: string;

  customer: string;

  quantity: number;

  productTitle?: string;

}


export default function PalletLabelPreview({

  description,

  sku,

  customer,

  quantity

}: Props) {


  /*
   * ==================================================
   * TAMAÑO REAL
   * FORMATO 2
   * 240 x 110 mm
   * ==================================================
   */

  const LABEL_WIDTH =
    240;


  const LABEL_HEIGHT =
    110;


  /*
   * ==================================================
   * DATOS FIJOS
   * ==================================================
   */

  const exporter =
    "RIVULIS IRRIGATION, S.L.U.";


  /*
   * ==================================================
   * ESTILO GENERAL DEL TEXTO
   * ==================================================
   */

  const textStyle = {

    fontFamily:
      "Arial, Helvetica, sans-serif",

    fontWeight:
      700,

    color:
      "#000000",

    lineHeight:
      1.05,

    textAlign:
      "center" as const

  };


  /*
   * ==================================================
   * CELDA
   * ==================================================
   */

  function Cell({

    x,

    y,

    width,

    height,

    children,

    fontSize = 4.7

  }: {

    x: number;

    y: number;

    width: number;

    height: number;

    children: ReactNode;

    fontSize?: number;

  }) {

    return (

      <Box
        sx={{
          position:
            "absolute",

          left:
            `${x}mm`,

          top:
            `${y}mm`,

          width:
            `${width}mm`,

          height:
            `${height}mm`,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          px:
            "2mm",

          boxSizing:
            "border-box",

          overflow:
            "hidden"
        }}
      >

        <Typography
          component="div"
          sx={{
            ...textStyle,

            fontSize:
              `${fontSize}mm`,

            width:
              "100%",

            overflowWrap:
              "anywhere"
          }}
        >

          {children}

        </Typography>

      </Box>

    );

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
          "100%",

        overflowX:
          "auto",

        overflowY:
          "hidden",

        py:
          2
      }}
    >

      <Box
        sx={{
          position:
            "relative",

          width:
            `${LABEL_WIDTH}mm`,

          height:
            `${LABEL_HEIGHT}mm`,

          mx:
            "auto",

          flexShrink:
            0,

          backgroundColor:
            "#FFFFFF",

          boxSizing:
            "border-box",

          overflow:
            "hidden"
        }}
      >

        {/* =============================================
            FONDO ORIGINAL
            ============================================= */}

        <Box
          component="img"
          src="/templates/palet/turboexcel-palet.png"
          alt="Etiqueta de palet Turbo Excel"
          sx={{
            position:
              "absolute",

            left:
              0,

            top:
              0,

            width:
              "100%",

            height:
              "100%",

            objectFit:
              "fill",

            display:
              "block",

            pointerEvents:
              "none",

            userSelect:
              "none"
          }}
        />


        {/* =============================================
            FILA 1
            DESCRIPTION / DESCRIPCIÓN
            ============================================= */}

        <Cell
          x={1}
          y={17}
          width={119}
          height={18}
          fontSize={4.7}
        >

          <Box>

            <Box
              sx={{
                mb:
                  "1.5mm"
              }}
            >

              Description:

            </Box>


            <Box>

              {description}

            </Box>

          </Box>

        </Cell>


        <Cell
          x={120}
          y={17}
          width={119}
          height={18}
          fontSize={4.7}
        >

          <Box>

            <Box
              sx={{
                mb:
                  "1.5mm"
              }}
            >

              Descripción:

            </Box>


            <Box>

              {description}

            </Box>

          </Box>

        </Cell>


        {/* =============================================
            FILA 2
            ITEM NUMBER
            ============================================= */}

        <Cell
          x={1}
          y={35}
          width={119}
          height={14}
          fontSize={4.6}
        >

          Item Number: {sku}

        </Cell>


        <Cell
          x={120}
          y={35}
          width={119}
          height={14}
          fontSize={4.6}
        >

          Número de artículo: {sku}

        </Cell>


        {/* =============================================
            FILA 3
            EXPORTER
            ============================================= */}

        <Cell
          x={1}
          y={49}
          width={119}
          height={15}
          fontSize={4.3}
        >

          Exporter: {exporter}

        </Cell>


        <Cell
          x={120}
          y={49}
          width={119}
          height={15}
          fontSize={4.3}
        >

          Exportador: {exporter}

        </Cell>


        {/* =============================================
            FILA 4
            COUNTRY
            ============================================= */}

        <Cell
          x={1}
          y={64}
          width={119}
          height={15}
          fontSize={4.6}
        >

          Country of Origin: Spain.

        </Cell>


        <Cell
          x={120}
          y={64}
          width={119}
          height={15}
          fontSize={4.6}
        >

          País de origen: España.

        </Cell>


        {/* =============================================
            FILA 5
            CUSTOMER
            ============================================= */}

        <Cell
          x={1}
          y={79}
          width={119}
          height={15}
          fontSize={4.6}
        >

          Customer: {customer || "-"}

        </Cell>


        <Cell
          x={120}
          y={79}
          width={119}
          height={15}
          fontSize={4.6}
        >

          Cliente: {customer || "-"}

        </Cell>


        {/* =============================================
            FILA 6
            QUANTITY
            ============================================= */}

        <Cell
          x={1}
          y={94}
          width={119}
          height={15}
          fontSize={4.6}
        >

          Quantity: {quantity} coils/palet.

        </Cell>


        <Cell
          x={120}
          y={94}
          width={119}
          height={15}
          fontSize={4.6}
        >

          Cantidad: {quantity} bobinas/palet.

        </Cell>

      </Box>

    </Box>

  );

}