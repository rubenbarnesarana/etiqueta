import { Card, CardContent, Box, Slider, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { useDesigner } from "./DesignerContext";
import DesignerItem from "./DesignerItem";
import Guides from "./Guides";

import type { DesignerElement } from "./DesignerTypes";

interface Props {
  addText: boolean;
  insertField: string;
}

export default function Canvas({
  addText,
  insertField
}: Props) {

  const {
    elements,
    setElements,
    setSelected
  } = useDesigner();

  const [zoom, setZoom] = useState(100);

  const [verticalGuide] = useState<number | null>(260);
  const [horizontalGuide] = useState<number | null>(170);

  useEffect(() => {

    if (!addText) return;

    const item: DesignerElement = {

      id: Date.now(),

      type: "text",

      text: "Nuevo texto",

      x: 50,

      y: 50,

      width: 120,

      height: 30,

      rotation: 0,

      fontSize: 16,

      fontWeight: 400,

      color: "#000000",

      locked: false,

      visible: true

    };

    setElements(prev => [...prev, item]);

  }, [addText, setElements]);

  useEffect(() => {

    if (insertField === "") return;

    const nombres: Record<string, string> = {

      SKU: "SKU",

      DESCRIPTION: "Descripción",

      BARCODE: "Código Barras",

      QR: "Código QR",

      DATE: "Fecha",

      LOT: "Lote",

      COIL: "Bobina",

      ROLLS: "Total Rollos",

      LOGO: "Logo"

    };

    const type: DesignerElement["type"] =

      insertField === "LOGO"

        ? "logo"

        : insertField === "BARCODE"

        ? "barcode"

        : insertField === "QR"

        ? "qr"

        : "field";

    const item: DesignerElement = {

      id: Date.now(),

      type,

      field: insertField,

      text: nombres[insertField] ?? insertField,

      x: 50,

      y: 50,

      width:

        type === "barcode"

          ? 220

          : type === "qr"

          ? 90

          : 140,

      height:

        type === "barcode"

          ? 70

          : type === "qr"

          ? 90

          : 30,

      rotation: 0,

      fontSize: 16,

      fontWeight: 400,

      color: "#000000",

      locked: false,

      visible: true

    };

    setElements(prev => [...prev, item]);

  }, [insertField, setElements]);

  return (

    <Card>

      <CardContent>

        <Box mb={2}>

          <Typography>

            Zoom {zoom}%

          </Typography>

          <Slider

            min={50}

            max={200}

            step={10}

            value={zoom}

            onChange={(_, v) => setZoom(v as number)}

          />

        </Box>

        <Box display="flex" justifyContent="center">

          <Box sx={{ display: "flex" }}>

            <Box

              sx={{

                width: 25,

                height: 340,

                background: "#f2f2f2",

                borderRight: "1px solid #cccccc",

                position: "relative"

              }}

            >

              {Array.from({ length: 17 }).map((_, i) => (

                <Box

                  key={i}

                  sx={{

                    position: "absolute",

                    top: i * 20,

                    right: 0,

                    width: 8,

                    height: 1,

                    background: "#777"

                  }}

                />

              ))}

            </Box>

            <Box>

              <Box

                sx={{

                  height: 25,

                  width: 520,

                  background: "#f2f2f2",

                  borderBottom: "1px solid #cccccc",

                  position: "relative"

                }}

              >

                {Array.from({ length: 27 }).map((_, i) => (

                  <Box

                    key={i}

                    sx={{

                      position: "absolute",

                      left: i * 20,

                      bottom: 0,

                      width: 1,

                      height: 8,

                      background: "#777"

                    }}

                  />

                ))}

              </Box>

              <Box

                onClick={() => setSelected(null)}

                sx={{

                  position: "relative",

                  width: 520,

                  height: 340,

                  background: "#fff",

                  overflow: "hidden",

                  border: "2px solid #0B7A3B",

                  transform: `scale(${zoom / 100})`,

                  transformOrigin: "top left",

                  backgroundImage: `
linear-gradient(#eeeeee 1px,transparent 1px),
linear-gradient(90deg,#eeeeee 1px,transparent 1px)
`,

                  backgroundSize: "10px 10px"

                }}

              >

                <Guides

                  vertical={verticalGuide}

                  horizontal={horizontalGuide}

                />

                {elements

                  .filter(e => e.visible)

                  .map(e => (

                    <DesignerItem

                      key={e.id}

                      element={e}

                    />

                  ))}

              </Box>

            </Box>

          </Box>

        </Box>

      </CardContent>

    </Card>

  );

}