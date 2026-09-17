import { useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { useDesigner } from "./DesignerContext";

interface CanvasProps {
  addText: boolean;
  insertField: string;
  zoom: number;
  backgroundImage?: string;
  labelFormat?: "FORMATO_1" | "FORMATO_2";
}

const FORMATS = {
  FORMATO_1: {
    width: 80,
    height: 285
  },
  FORMATO_2: {
    width: 110,
    height: 240
  }
};

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
    useRef<HTMLDivElement>(null);

  const format =
    FORMATS[labelFormat];

  const labelWidth =
    format.width;

  const labelHeight =
    format.height;


  /*
   * ==================================================
   * IMAGEN DE FONDO
   * ==================================================
   *
   * Ya NO forzamos AMNON.
   *
   * Cada plantilla decide qué imagen utiliza:
   *
   * /templates/amnon-formato1.png
   * /templates/blind-pipe-formato1.png
   * /templates/microtube-formato1.png
   * /templates/naan-pc-formato1.png
   * /templates/naan-pc-max-formato1.png
   * /templates/tifdrip-plus-formato1.png
   * /templates/topdrip-formato1.png
   * /templates/turbo-excel-formato1.png
   */

  const templateImage =
    backgroundImage || "";


  /*
   * ==================================================
   * OBTENER VALOR DEL ELEMENTO
   * ==================================================
   */

  function getElementValue(
    element: any
  ): string {

    if (element.binding) {

      const key =
        element.binding
          .replace("${", "")
          .replace("}", "");

      return (
        labelData[
          key as keyof typeof labelData
        ] ?? ""
      );
    }

    if (element.field) {

      return (
        labelData[
          element.field as keyof typeof labelData
        ] ?? ""
      );
    }

    return (
      element.value ??
      element.text ??
      ""
    );
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

    const newElement: any = {

      id: Date.now(),

      type,

      field,

      text:
        type === "text"
          ? "Texto"
          : field ?? "",

      value:
        type === "text"
          ? "Texto"
          : "",

      x: 10,

      y: 10,

      width:
        type === "barcode"
          ? 55
          : 35,

      height:
        type === "barcode"
          ? 25
          : 15,

      rotation: 0,

      fontSize: 12,

      fontWeight: 400,

      color: "#000000",

      locked: false,

      visible: true
    };


    if (type === "barcode") {

      newElement.barcodeFormat =
        "CODE128";

      newElement.barcodeHeight =
        30;

      newElement.barcodeWidth =
        2;

      newElement.barcodeDisplayValue =
        true;

      newElement.field =
        "BARCODE";
    }


    setElements(prev => [
      ...prev,
      newElement
    ]);


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

    createElement("text");

  }, [addText]);


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
      insertField.toUpperCase();


    if (field === "BARCODE") {

      createElement(
        "barcode",
        "BARCODE"
      );

      return;
    }


    if (field === "QR") {

      createElement(
        "qr",
        "QR"
      );

      return;
    }


    if (field === "LOGO") {

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

  }, [insertField]);


  /*
   * ==================================================
   * CÓDIGO DE BARRAS
   * ==================================================
   */

  function Barcode({
    value,
    element
  }: {
    value: string;
    element: any;
  }) {

    const ref =
      useRef<SVGSVGElement>(null);


    useEffect(() => {

      if (!ref.current) {
        return;
      }


      try {

        JsBarcode(
          ref.current,
          value || "123456789",
          {
            format:
              element.barcodeFormat ||
              "CODE128",

            displayValue:
              element.barcodeDisplayValue !==
              false,

            height:
              element.barcodeHeight ||
              30,

            width:
              element.barcodeWidth ||
              2,

            margin: 0
          }
        );

      } catch (error) {

        console.error(
          "Error generando código de barras:",
          error
        );
      }

    }, [
      value,
      element
    ]);


    return (
      <svg
        ref={ref}
        style={{
          width: "100%",
          height: "100%"
        }}
      />
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
      useRef<HTMLCanvasElement>(null);


    useEffect(() => {

      if (!ref.current) {
        return;
      }


      QRCode.toCanvas(
        ref.current,
        value || "123456789",
        {
          margin: 0,
          width: 100
        }
      );

    }, [value]);


    return (
      <canvas
        ref={ref}
        style={{
          width: "100%",
          height: "100%"
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
    event: React.MouseEvent,
    id: number
  ) {

    event.stopPropagation();


    const element =
      elements.find(
        item =>
          item.id === id
      );


    if (
      !element ||
      element.locked
    ) {
      return;
    }


    setSelected(id);


    const startX =
      event.clientX;

    const startY =
      event.clientY;

    const originalX =
      element.x;

    const originalY =
      element.y;


    function handleMove(
      moveEvent: MouseEvent
    ) {

      const deltaX =
        (moveEvent.clientX -
          startX) /
        (zoom / 100);

      const deltaY =
        (moveEvent.clientY -
          startY) /
        (zoom / 100);


      setElements(prev =>
        prev.map(item => {

          if (
            item.id !== id
          ) {
            return item;
          }


          return {

            ...item,

            x: Math.max(
              0,
              Math.min(
                labelWidth -
                  item.width,

                originalX +
                  deltaX
              )
            ),

            y: Math.max(
              0,
              Math.min(
                labelHeight -
                  item.height,

                originalY +
                  deltaY
              )
            )
          };
        })
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
    event: React.MouseEvent,
    element: any
  ) {

    event.stopPropagation();


    if (
      element.locked ||
      element.type === "barcode" ||
      element.type === "qr" ||
      element.type === "logo"
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


    if (value === null) {
      return;
    }


    setElements(prev =>
      prev.map(item =>
        item.id === element.id
          ? {
              ...item,
              text: value,
              value
            }
          : item
      )
    );
  }


  /*
   * ==================================================
   * CANVAS
   * ==================================================
   */

  return (

    <Box
      sx={{
        width: "100%",
        overflow: "auto"
      }}
    >

      <Paper
        ref={canvasRef}

        elevation={3}

        onClick={() =>
          setSelected(null)
        }

        sx={{

          position: "relative",

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
                (zoom / 100 - 1)
            )}mm`,

          backgroundColor:
            "#ffffff",

          overflow:
            "hidden",

          border:
            "1px solid #bdbdbd"
        }}
      >


        {/* ==================================================
            FONDO DE LA PLANTILLA
           ================================================== */}

        {templateImage && (

          <img
            src={templateImage}

            alt="Plantilla"

            draggable={false}

            onLoad={(event) => {

              const image =
                event.currentTarget;

              console.log(
                "PLANTILLA OK:",
                templateImage
              );

              console.log(
                "naturalWidth:",
                image.naturalWidth
              );

              console.log(
                "naturalHeight:",
                image.naturalHeight
              );
            }}

            onError={() => {

              console.error(
                "ERROR CARGANDO PLANTILLA:",
                templateImage
              );

            }}

            style={{

              position:
                "absolute",

              top: 0,

              left: 0,

              width:
                "100%",

              height:
                "100%",

              objectFit:
                "fill",

              display:
                "block",

              margin: 0,

              padding: 0,

              border: 0,

              zIndex: 0,

              pointerEvents:
                "none",

              userSelect:
                "none"
            }}
          />

        )}


        {/* ==================================================
            ELEMENTOS DINÁMICOS
           ================================================== */}

        {elements
          .filter(
            element =>
              element.visible !==
              false
          )
          .map(element => {

            const value =
              getElementValue(
                element
              );

            const isSelected =
              selected ===
              element.id;


            return (

              <Box
                key={
                  element.id
                }

                onMouseDown={event =>
                  handleMouseDown(
                    event,
                    element.id
                  )
                }

                onDoubleClick={event =>
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

                  zIndex: 2,

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
                    "hidden"
                }}
              >


                {element.type ===
                  "barcode" && (

                  <Barcode
                    value={value}
                    element={
                      element
                    }
                  />

                )}


                {element.type ===
                  "qr" && (

                  <QR
                    value={value}
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
                    sx={{

                      width:
                        "100%",

                      height:
                        "100%",

                      fontSize:
                        `${element.fontSize}px`,

                      fontWeight:
                        element.fontWeight ||
                        400,

                      color:
                        element.color ||
                        "#000000",

                      lineHeight:
                        1.1,

                      whiteSpace:
                        "pre-wrap",

                      overflow:
                        "hidden",

                      userSelect:
                        "none"
                    }}
                  >

                    {value}

                  </Typography>

                )}

              </Box>

            );
          })}

      </Paper>

    </Box>
  );
}