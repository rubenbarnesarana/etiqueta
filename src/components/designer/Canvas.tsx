import {
  useEffect,
  useRef
} from "react";

import {
  Box,
  Paper,
  Typography
} from "@mui/material";

import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

import {
  useDesigner
} from "./DesignerContext";


interface CanvasProps {
  addText: boolean;
  insertField: string;
  zoom: number;
  backgroundImage?: string;
  labelFormat?: "FORMATO_1" | "FORMATO_2";
}


/*
 * ==================================================
 * FORMATOS FÍSICOS
 * ==================================================
 */

const FORMATS = {

  FORMATO_1: {
    width: 80,
    height: 285
  },

  FORMATO_2: {
    width: 240,
    height: 110
  }

};


/*
 * ==================================================
 * DEFAULTS FORMATO 1
 * ==================================================
 */

const FORMAT_1_DEFAULTS: Record<
  string,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    fontSize?: number;
    fontWeight?: number;
  }
> = {

  UPPER_TEXT: {
    x: 5,
    y: 32,
    width: 70,
    height: 48,
    rotation: 180,
    fontSize: 14,
    fontWeight: 600
  },

  BARCODE: {
    x: 8,
    y: 166,
    width: 64,
    height: 22
  },

  ORDER: {
    x: 6,
    y: 190,
    width: 22,
    height: 10,
    fontSize: 10,
    fontWeight: 600
  },

  LOT: {
    x: 29,
    y: 190,
    width: 22,
    height: 10,
    fontSize: 10,
    fontWeight: 600
  },

  COIL: {
    x: 52,
    y: 190,
    width: 22,
    height: 10,
    fontSize: 10,
    fontWeight: 600
  },

  SKU: {
    x: 8,
    y: 184,
    width: 64,
    height: 8,
    fontSize: 11,
    fontWeight: 600
  },

  DESCRIPTION: {
    x: 5,
    y: 207,
    width: 70,
    height: 12,
    fontSize: 13,
    fontWeight: 600
  },

  QR: {
    x: 45,
    y: 232,
    width: 24,
    height: 24
  }

};


/*
 * ==================================================
 * DEFAULTS FORMATO 2
 * BOBINAS - 240 x 110 mm
 * ==================================================
 */

const FORMAT_2_DEFAULTS: Record<
  string,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    fontSize?: number;
    fontWeight?: number;
  }
> = {

  /*
   * Descripción original del SKU
   */

  COIL_DESCRIPTION: {
    x: 7,
    y: 9,
    width: 108,
    height: 10,
    rotation: 0,
    fontSize: 14,
    fontWeight: 700
  },


  /*
   * Bloque técnico
   */

  COIL_TECHNICAL: {
    x: 7,
    y: 20,
    width: 108,
    height: 36,
    rotation: 0,
    fontSize: 12,
    fontWeight: 600
  },


  /*
   * Texto inferior izquierdo
   */

  COIL_LEGAL: {
    x: 7,
    y: 57,
    width: 62,
    height: 15,
    rotation: 0,
    fontSize: 6,
    fontWeight: 400
  },


  /*
   * MADE IN SPAIN / QI02
   */

  COIL_ORIGIN: {
    x: 69,
    y: 62,
    width: 46,
    height: 8,
    rotation: 0,
    fontSize: 7,
    fontWeight: 600
  },


  ORDER: {
    x: 7,
    y: 80,
    width: 39,
    height: 14,
    rotation: 0,
    fontSize: 12,
    fontWeight: 700
  },

  LOT: {
    x: 48,
    y: 80,
    width: 34,
    height: 14,
    rotation: 0,
    fontSize: 12,
    fontWeight: 700
  },

  COIL: {
    x: 84,
    y: 80,
    width: 31,
    height: 14,
    rotation: 0,
    fontSize: 13,
    fontWeight: 700
  },

  BARCODE: {
    x: 143,
    y: 69,
    width: 70,
    height: 25,
    rotation: 0
  },

  SKU: {
    x: 143,
    y: 94,
    width: 70,
    height: 8,
    rotation: 0,
    fontSize: 11,
    fontWeight: 600
  },

  QR: {
    x: 190,
    y: 70,
    width: 25,
    height: 25,
    rotation: 0
  }

};


/*
 * ==================================================
 * TABLA CODE 128
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


  const codes: number[] =
    [];


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


export default function Canvas({
  addText,
  insertField,
  zoom,
  backgroundImage,
  labelFormat = "FORMATO_1"
}: CanvasProps) {

  const {

    elements,
    setElements,

    selected,
    setSelected,

    labelData

  } = useDesigner();


  const canvasRef =
    useRef<HTMLDivElement>(
      null
    );


  const format =
    FORMATS[
      labelFormat
    ];


  const labelWidth =
    format.width;


  const labelHeight =
    format.height;


  const templateImage =
    backgroundImage ||
    "";


  /*
   * ==================================================
   * OBTENER VALOR
   * ==================================================
   */

  function getElementValue(
    element: any
  ): string {

    if (
      element.binding
    ) {

      const key =
        element.binding
          .replace(
            "${",
            ""
          )
          .replace(
            "}",
            ""
          );


      return String(
        labelData[
          key as keyof typeof labelData
        ] ??
        ""
      );

    }


    if (
      element.field
    ) {

      return String(
        labelData[
          element.field as keyof typeof labelData
        ] ??
        ""
      );

    }


    return String(
      element.value ??
      element.text ??
      ""
    );

  }


  /*
   * ==================================================
   * DEFAULTS
   * ==================================================
   */

  function getFieldDefaults(
    field?: string
  ) {

    if (!field) {
      return null;
    }


    if (
      labelFormat ===
      "FORMATO_1"
    ) {

      return (
        FORMAT_1_DEFAULTS[
          field
        ] ??
        null
      );

    }


    if (
      labelFormat ===
      "FORMATO_2"
    ) {

      return (
        FORMAT_2_DEFAULTS[
          field
        ] ??
        null
      );

    }


    return null;

  }


  /*
   * ==================================================
   * CREAR ELEMENTO
   * ==================================================
   */

  function createElement(
    type:
      | "text"
      | "field"
      | "barcode"
      | "qr"
      | "logo",

    field?: string
  ) {

    const normalizedField =
      field
        ? field.toUpperCase()
        : undefined;


    const defaults =
      getFieldDefaults(
        normalizedField
      );


    const isUpperText =
      normalizedField ===
      "UPPER_TEXT";


    const isBarcode =
      type ===
      "barcode";


    const isQR =
      type ===
      "qr";


    const newElement: any = {

      id:
        Date.now(),

      type,

      field:
        normalizedField,

      text:
        type ===
        "text"
          ? "Texto"
          : normalizedField ??
            "",

      value:
        type ===
        "text"
          ? "Texto"
          : "",

      binding:
        normalizedField
          ? `\${${normalizedField}}`
          : undefined,

      x:
        defaults?.x ??
        10,

      y:
        defaults?.y ??
        10,

      width:
        defaults?.width ??
        (
          isBarcode
            ? 55
            : isQR
              ? 25
              : 35
        ),

      height:
        defaults?.height ??
        (
          isBarcode
            ? 25
            : isQR
              ? 25
              : 15
        ),

      rotation:
        defaults?.rotation ??
        (
          isUpperText &&
          labelFormat ===
          "FORMATO_1"
            ? 180
            : 0
        ),

      fontSize:
        defaults?.fontSize ??
        (
          isUpperText
            ? 14
            : 12
        ),

      fontWeight:
        defaults?.fontWeight ??
        (
          isUpperText
            ? 600
            : 400
        ),

      color:
        "#000000",

      locked:
        false,

      visible:
        true

    };


    if (
      type ===
      "barcode"
    ) {

      newElement.barcodeFormat =
        "CODE128";

      newElement.barcodeHeight =
        76;

      newElement.barcodeWidth =
        2;

      newElement.barcodeDisplayValue =
        true;

      newElement.field =
        "BARCODE";

      newElement.binding =
        "${BARCODE}";

    }


    if (
      type ===
      "qr"
    ) {

      newElement.field =
        "QR";

      newElement.binding =
        "${QR}";

    }


    setElements(
      prev => [
        ...prev,
        newElement
      ]
    );


    setSelected(
      newElement.id
    );

  }


  /*
   * ==================================================
   * AÑADIR TEXTO
   * ==================================================
   */

  useEffect(() => {

    if (!addText) {
      return;
    }


    createElement(
      "text"
    );

  }, [
    addText
  ]);


  /*
   * ==================================================
   * INSERTAR CAMPO
   * ==================================================
   */

  useEffect(() => {

    if (!insertField) {
      return;
    }


    const field =
      insertField
        .toUpperCase();


    if (
      field ===
      "BARCODE"
    ) {

      createElement(
        "barcode",
        "BARCODE"
      );

      return;

    }


    if (
      field ===
      "QR"
    ) {

      createElement(
        "qr",
        "QR"
      );

      return;

    }


    if (
      field ===
      "LOGO"
    ) {

      createElement(
        "logo",
        "LOGO"
      );

      return;

    }


    createElement(
      "field",
      field
    );

  }, [
    insertField
  ]);


  /*
   * ==================================================
   * BARCODE
   * ==================================================
   */

  function Barcode({
    value
  }: {
    value: string;
    element: any;
  }) {

    const svgRef =
      useRef<SVGSVGElement>(
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


      while (
        svg.firstChild
      ) {

        svg.removeChild(
          svg.firstChild
        );

      }


      const modules =
        buildTecItCode128(
          barcodeValue
        );


      if (
        modules
      ) {

        const namespace =
          "http://www.w3.org/2000/svg";


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


        svg.setAttribute(
          "viewBox",
          `0 0 ${totalWidth} ${totalHeight}`
        );


        svg.setAttribute(
          "preserveAspectRatio",
          "xMidYMid meet"
        );


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

  function QR({
    value
  }: {
    value: string;
  }) {

    const ref =
      useRef<HTMLCanvasElement>(
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
   * MOVER ELEMENTOS
   * ==================================================
   */

  function handleMouseDown(
    event:
      React.MouseEvent,
    id:
      number
  ) {

    event.stopPropagation();


    const element =
      elements.find(
        item =>
          item.id ===
          id
      );


    if (
      !element ||
      element.locked
    ) {
      return;
    }


    setSelected(
      id
    );


    const startX =
      event.clientX;


    const startY =
      event.clientY;


    const originalX =
      element.x;


    const originalY =
      element.y;


    function handleMove(
      moveEvent:
        MouseEvent
    ) {

      const deltaX =
        (
          moveEvent.clientX -
          startX
        ) /
        (
          zoom /
          100
        );


      const deltaY =
        (
          moveEvent.clientY -
          startY
        ) /
        (
          zoom /
          100
        );


      setElements(
        prev =>
          prev.map(
            item => {

              if (
                item.id !==
                id
              ) {
                return item;
              }


              return {

                ...item,

                x:
                  Math.max(
                    0,
                    Math.min(
                      labelWidth -
                      item.width,

                      originalX +
                      deltaX
                    )
                  ),

                y:
                  Math.max(
                    0,
                    Math.min(
                      labelHeight -
                      item.height,

                      originalY +
                      deltaY
                    )
                  )

              };

            }
          )
      );

    }


    function handleUp() {

      window.removeEventListener(
        "mousemove",
        handleMove
      );


      window.removeEventListener(
        "mouseup",
        handleUp
      );

    }


    window.addEventListener(
      "mousemove",
      handleMove
    );


    window.addEventListener(
      "mouseup",
      handleUp
    );

  }


  /*
   * ==================================================
   * EDITAR TEXTO
   * ==================================================
   */

  function handleDoubleClick(
    event:
      React.MouseEvent,
    element:
      any
  ) {

    event.stopPropagation();


    if (
      element.locked ||
      element.type ===
        "barcode" ||
      element.type ===
        "qr" ||
      element.type ===
        "logo"
    ) {
      return;
    }


    if (
      element.type ===
      "field"
    ) {
      return;
    }


    const value =
      window.prompt(
        "Texto",
        element.text ||
        element.value ||
        ""
      );


    if (
      value ===
      null
    ) {
      return;
    }


    setElements(
      prev =>
        prev.map(
          item =>
            item.id ===
            element.id
              ? {
                  ...item,
                  text:
                    value,
                  value
                }
              : item
        )
    );

  }


  /*
   * ==================================================
   * ALINEACIÓN
   * ==================================================
   */

  function getTextAlign(
    element: any
  ):
    | "left"
    | "center"
    | "right" {

    const field =
      String(
        element.field ??
        ""
      ).toUpperCase();


    /*
     * FORMATO 1
     */

    if (
      field ===
        "UPPER_TEXT" ||
      field ===
        "DESCRIPTION"
    ) {

      return "center";

    }


    /*
     * FORMATO 2
     *
     * Descripción y bloque técnico
     * centrados dentro del cuadro grande.
     */

    if (
      field ===
        "COIL_DESCRIPTION" ||
      field ===
        "COIL_TECHNICAL"
    ) {

      return "center";

    }


    /*
     * MADE IN SPAIN / QI02
     */

    if (
      field ===
      "COIL_ORIGIN"
    ) {

      return "center";

    }


    /*
     * ORDER / LOT / COIL / SKU
     */

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


    /*
     * COIL_LEGAL queda alineado
     * a la izquierda.
     */

    return "left";

  }


  /*
   * ==================================================
   * CANVAS
   * ==================================================
   */

  return (

    <Box
      sx={{
        width:
          "100%",

        overflow:
          "auto"
      }}
    >

      <Paper
        ref={
          canvasRef
        }

        elevation={
          3
        }

        onClick={() =>
          setSelected(
            null
          )
        }

        sx={{

          position:
            "relative",

          width:
            `${labelWidth}mm`,

          height:
            `${labelHeight}mm`,

          minWidth:
            `${labelWidth}mm`,

          minHeight:
            `${labelHeight}mm`,

          transform:
            `scale(${zoom / 100})`,

          transformOrigin:
            "top left",

          mb:
            `${Math.max(
              0,
              labelHeight *
              (
                zoom /
                100 -
                1
              )
            )}mm`,

          backgroundColor:
            "#ffffff",

          overflow:
            "hidden",

          border:
            "1px solid #bdbdbd"

        }}
      >


        {templateImage && (

          <img
            src={
              templateImage
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


              const isSelected =
                selected ===
                element.id;


              const textAlign =
                getTextAlign(
                  element
                );


              const field =
                String(
                  element.field ??
                  ""
                ).toUpperCase();


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


              return (

                <Box
                  key={
                    element.id
                  }

                  onMouseDown={
                    event =>
                      handleMouseDown(
                        event,
                        element.id
                      )
                  }

                  onDoubleClick={
                    event =>
                      handleDoubleClick(
                        event,
                        element
                      )
                  }

                  sx={{

                    position:
                      "absolute",

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

                    cursor:
                      element.locked
                        ? "default"
                        : "move",

                    border:
                      isSelected
                        ? "1px dashed #1976d2"
                        : "1px solid transparent",

                    boxSizing:
                      "border-box",

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
                          : "flex-start"

                  }}
                >


                  {element.type ===
                    "barcode" && (

                    <Barcode
                      value={
                        value
                      }

                      element={
                        element
                      }
                    />

                  )}


                  {element.type ===
                    "qr" && (

                    <QR
                      value={
                        value
                      }
                    />

                  )}


                  {element.type ===
                    "logo" && (

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

                  )}


                  {(element.type ===
                    "text" ||
                    element.type ===
                    "field") && (

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

                  )}

                </Box>

              );

            }
          )}

      </Paper>

    </Box>

  );

}