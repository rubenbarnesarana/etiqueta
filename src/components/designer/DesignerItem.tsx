import { Box, Typography } from "@mui/material";
import { MouseEvent as ReactMouseEvent } from "react";

import type { DesignerElement } from "./DesignerTypes";
import { useDesigner } from "./DesignerContext";
import { snap } from "./Snap";

interface Props {
  element: DesignerElement;
}

export default function DesignerItem({ element }: Props) {

  const {
    elements,
    setElements,
    selected,
    setSelected
  } = useDesigner();

  function startMove(e: ReactMouseEvent<HTMLDivElement>) {

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
        ...elements.filter(el => el.id !== element.id).map(el => el.x)
      ];

      const targetsY = [
        0,
        170,
        340,
        ...elements.filter(el => el.id !== element.id).map(el => el.y)
      ];

      const x = snap(initialX + dx, targetsX);
      const y = snap(initialY + dy, targetsY);

      setElements(prev =>
        prev.map(el =>
          el.id === element.id
            ? { ...el, x, y }
            : el
        )
      );

    }

    function up() {

      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);

    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

  }

  function startResize(e: ReactMouseEvent<HTMLDivElement>) {

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
                width: Math.max(30, initialWidth + dx),
                height: Math.max(20, initialHeight + dy)
              }
            : el
        )
      );

    }

    function up() {

      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", up);

    }

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", up);

  }

  function renderContent() {

    //------------------------------------
    // TEXTO
    //------------------------------------

    if (element.type === "text") {

      return (

        <Typography
          sx={{
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            color: element.color,
            whiteSpace: "nowrap"
          }}
        >
          {element.text}
        </Typography>

      );

    }

    //------------------------------------
    // CODIGO DE BARRAS
    //------------------------------------

    if (element.type === "barcode") {

      return (

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
        >

          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: 28,
              letterSpacing: -2,
              lineHeight: 1
            }}
          >

            ||||||||||||||||||||||||||||||||||

          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              mt: 0.5
            }}
          >

            {element.text}

          </Typography>

        </Box>

      );

    }

    //------------------------------------
    // QR
    //------------------------------------

    if (element.type === "qr") {

      return (

        <Box
          sx={{
            width: 70,
            height: 70,
            bgcolor: "#000",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11
          }}
        >

          QR

        </Box>

      );

    }

    //------------------------------------
    // LOGO
    //------------------------------------

    if (element.type === "logo") {

      return (

        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "#e8e8e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >

          LOGO

        </Box>

      );

    }

    //------------------------------------
    // CAMPOS
    //------------------------------------

    return (

      <Typography
        sx={{
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          color: element.color,
          whiteSpace: "nowrap"
        }}
      >

        {element.text}

      </Typography>

    );

  }

  return (

    <Box

      onMouseDown={startMove}

      onClick={() => setSelected(element.id)}

      sx={{

        position: "absolute",

        left: element.x,

        top: element.y,

        width: element.width,

        height: element.height,

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        cursor: "move",

        userSelect: "none",

        background: "#fff",

        transform: `rotate(${element.rotation}deg)`,

        border:

          selected === element.id

            ? "2px solid #1976d2"

            : "1px dashed transparent"

      }}

    >

      {renderContent()}

      {selected === element.id && (

        <Box

          onMouseDown={startResize}

          sx={{

            position: "absolute",

            right: -5,

            bottom: -5,

            width: 10,

            height: 10,

            bgcolor: "#1976d2",

            cursor: "nwse-resize"

          }}

        />

      )}

    </Box>

  );

}