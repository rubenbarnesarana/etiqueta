import {

  Box,

  Typography,

  TextField

} from "@mui/material";

import {

  MouseEvent as ReactMouseEvent,

  useState

} from "react";

import Barcode from "react-barcode";

import type {

  DesignerElement

} from "./DesignerTypes";

import {

  useDesigner

} from "./DesignerContext";

import {

  snap

} from "./Snap";

interface Props {

  element: DesignerElement;

}

export default function DesignerItem({

  element

}: Props) {

  const {

    elements,

    setElements,

    selected,

    setSelected,

    labelData

  } = useDesigner();

  const [

    editing,

    setEditing

  ] = useState(false);

  if (!element.visible) {

    return null;

  }

  function getValue() {

    if (!element.binding) {

      return element.text;

    }

    return (

      labelData[

        element.binding as keyof typeof labelData

      ] ?? ""

    );

  }

  function updateText(

    value: string

  ) {

    setElements(prev =>

      prev.map(el =>

        el.id === element.id

          ? {

              ...el,

              text: value

            }

          : el

      )

    );

  }  //-------------------------------------------------
  // MOVER
  //-------------------------------------------------

  function startMove(

    e: ReactMouseEvent<HTMLDivElement>

  ) {

    if (element.locked) return;

    e.preventDefault();

    e.stopPropagation();

    setSelected(element.id);

    const startX = e.clientX;

    const startY = e.clientY;

    const initialX = element.x;

    const initialY = element.y;

    function move(ev: MouseEvent) {

      const dx = ev.clientX - startX;

      const dy = ev.clientY - startY;

      const targetsX = [

        0,

        260,

        520,

        ...elements

          .filter(

            el => el.id !== element.id

          )

          .map(el => el.x)

      ];

      const targetsY = [

        0,

        170,

        340,

        ...elements

          .filter(

            el => el.id !== element.id

          )

          .map(el => el.y)

      ];

      const x = snap(

        initialX + dx,

        targetsX

      );

      const y = snap(

        initialY + dy,

        targetsY

      );

      setElements(prev =>

        prev.map(el =>

          el.id === element.id

            ? {

                ...el,

                x,

                y

              }

            : el

        )

      );

    }

    function up() {

      window.removeEventListener(

        "mousemove",

        move

      );

      window.removeEventListener(

        "mouseup",

        up

      );

    }

    window.addEventListener(

      "mousemove",

      move

    );

    window.addEventListener(

      "mouseup",

      up

    );

  }  //-------------------------------------------------
  // REDIMENSIONAR
  //-------------------------------------------------

  function startResize(

    e: ReactMouseEvent<HTMLDivElement>

  ) {

    if (element.locked) return;

    e.preventDefault();

    e.stopPropagation();

    setSelected(element.id);

    const startX = e.clientX;

    const startY = e.clientY;

    const initialWidth = element.width;

    const initialHeight = element.height;

    function resize(ev: MouseEvent) {

      const dx = ev.clientX - startX;

      const dy = ev.clientY - startY;

      setElements(prev =>

        prev.map(el =>

          el.id === element.id

            ? {

                ...el,

                width: Math.max(

                  30,

                  initialWidth + dx

                ),

                height: Math.max(

                  20,

                  initialHeight + dy

                )

              }

            : el

        )

      );

    }

    function up() {

      window.removeEventListener(

        "mousemove",

        resize

      );

      window.removeEventListener(

        "mouseup",

        up

      );

    }

    window.addEventListener(

      "mousemove",

      resize

    );

    window.addEventListener(

      "mouseup",

      up

    );

  }

  //-------------------------------------------------
  // CONTENIDO
  //-------------------------------------------------

  function renderContent() {

    const value = getValue();

    if (editing) {

      return (

        <TextField

          autoFocus

          size="small"

          value={value}

          onChange={(e) =>

            updateText(

              e.target.value

            )

          }

          onBlur={() =>

            setEditing(false)

          }

          onKeyDown={(e) => {

            if (e.key === "Enter") {

              setEditing(false);

            }

          }}

        />

      );

    }    //-------------------------------------------------
    // CÓDIGO DE BARRAS
    //-------------------------------------------------

    if (element.type === "barcode") {

      return (

        <Barcode

          value={value || "0"}

          format={

            (element.barcodeFormat as any) ||

            "CODE128"

          }

          height={

            element.barcodeHeight ?? 45

          }

          width={

            element.barcodeWidth ?? 1.5

          }

          displayValue={

            element.barcodeDisplayValue ?? true

          }

        />

      );

    }

    //-------------------------------------------------
    // QR
    //-------------------------------------------------

    if (element.type === "qr") {

      return (

        <Box

          sx={{

            width: "100%",

            height: "100%",

            border: "1px dashed #999",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            fontSize: 12,

            color: "#666"

          }}

        >

          QR

        </Box>

      );

    }

    //-------------------------------------------------
    // LOGO
    //-------------------------------------------------

    if (element.type === "logo") {

      return (

        <Box

          sx={{

            width: "100%",

            height: "100%",

            border: "1px dashed #999",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            fontSize: 12,

            color: "#666"

          }}

        >

          LOGO

        </Box>

      );

    }

    //-------------------------------------------------
    // TEXTO / CAMPO
    //-------------------------------------------------

    return (

      <Typography

        sx={{

          fontSize: element.fontSize,

          fontWeight: element.fontWeight,

          color: element.color,

          width: "100%",

          height: "100%",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          textAlign: "center",

          overflow: "hidden",

          whiteSpace: "nowrap",

          userSelect: "none"

        }}

      >

        {value}

      </Typography>

    );

  }  //-------------------------------------------------
  // RENDER
  //-------------------------------------------------

  return (

    <Box

      onMouseDown={startMove}

      onDoubleClick={() => {

        if (

          element.type === "text" ||

          element.type === "field"

        ) {

          setEditing(true);

        }

      }}

      sx={{

        position: "absolute",

        left: element.x,

        top: element.y,

        width: element.width,

        height: element.height,

        transform: `rotate(${element.rotation}deg)`,

        border:

          selected === element.id

            ? "2px solid #0B7A3B"

            : "1px dashed transparent",

        cursor:

          element.locked

            ? "default"

            : "move",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background: "transparent",

        boxSizing: "border-box"

      }}

    >

      {renderContent()}

      {

        !element.locked &&

        selected === element.id && (

          <>

            <Box

              onMouseDown={startResize}

              sx={{

                position: "absolute",

                right: -5,

                bottom: -5,

                width: 10,

                height: 10,

                background: "#0B7A3B",

                borderRadius: "50%",

                cursor: "nwse-resize"

              }}

            />            <Box

              onMouseDown={startResize}

              sx={{

                position: "absolute",

                left: -5,

                top: -5,

                width: 10,

                height: 10,

                background: "#0B7A3B",

                borderRadius: "50%",

                cursor: "nwse-resize"

              }}

            />

            <Box

              onMouseDown={startResize}

              sx={{

                position: "absolute",

                right: -5,

                top: -5,

                width: 10,

                height: 10,

                background: "#0B7A3B",

                borderRadius: "50%",

                cursor: "nesw-resize"

              }}

            />

            <Box

              onMouseDown={startResize}

              sx={{

                position: "absolute",

                left: -5,

                bottom: -5,

                width: 10,

                height: 10,

                background: "#0B7A3B",

                borderRadius: "50%",

                cursor: "nesw-resize"

              }}

            />

          </>

        )

      }

     </Box>

  );

}