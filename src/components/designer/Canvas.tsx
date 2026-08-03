import {
  Card,
  CardContent,
  Box,
  Slider,
  Typography
} from "@mui/material";

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

  const [verticalGuide] =
    useState<number | null>(260);

  const [horizontalGuide] =
    useState<number | null>(170);

  //-------------------------------------------------
  // NUEVO TEXTO
  //-------------------------------------------------

  useEffect(() => {

    if (!addText) return;

    const item: DesignerElement = {

      id: Date.now(),

      type: "text",

      text: "Nuevo texto",

      x: 60,

      y: 60,

      width: 140,

      height: 35,

      rotation: 0,

      fontSize: 16,

      fontWeight: 400,

      color: "#000000",

      locked: false,

      visible: true

    };

    setElements(prev => [...prev, item]);

  }, [addText, setElements]);

  //-------------------------------------------------
  // INSERTAR CAMPOS
  //-------------------------------------------------

  useEffect(() => {

    if (insertField === "") return;

    const labels: Record<string, string> = {

      SKU: "{SKU}",

      DESCRIPTION: "{DESCRIPTION}",

      BARCODE: "",

      QR: "",

      DATE: "{DATE}",

      LOT: "{LOT}",

      COIL: "{COIL}",

      ROLLS: "{ROLLS}",

      LOGO: "LOGO"

    };

    //-------------------------------------------------
    // SI INSERTAMOS SKU
    // CREAMOS SKU + CÓDIGO DE BARRAS
    //-------------------------------------------------

    if (insertField === "SKU") {

      const timestamp = Date.now();

      const skuItem: DesignerElement = {

        id: timestamp,

        type: "field",

        field: "SKU",

        binding: "SKU",

        text: "{SKU}",

        x: 60,

        y: 60,

        width: 140,

        height: 35,

        rotation: 0,

        fontSize: 16,

        fontWeight: 400,

        color: "#000000",

        locked: false,

        visible: true

      };

      const barcodeItem: DesignerElement = {

        id: timestamp + 1,

        type: "barcode",

        field: "BARCODE",

        binding: "SKU",

        text: "",

        barcodeFormat: "CODE128",

        barcodeHeight: 45,

        barcodeWidth: 1.5,

        barcodeDisplayValue: true,

        x: 60,

        y: 100,

        width: 220,

        height: 70,

        rotation: 0,

        fontSize: 12,

        fontWeight: 400,

        color: "#000000",

        locked: false,

        visible: true

      };

      setElements(prev => [

        ...prev,

        skuItem,

        barcodeItem

      ]);

      return;

    }

    //-------------------------------------------------
    // TIPO DE ELEMENTO
    //-------------------------------------------------

    let type: DesignerElement["type"] = "field";

    if (insertField === "BARCODE") {

      type = "barcode";

    }

    if (insertField === "QR") {

      type = "qr";

    }

    if (insertField === "LOGO") {

      type = "logo";

    }

    //-------------------------------------------------
    // BINDING
    //-------------------------------------------------

    let binding: string | undefined =
      insertField;

    if (insertField === "BARCODE") {

      binding = "SKU";

    }

    if (insertField === "QR") {

      binding = "SKU";

    }

    //-------------------------------------------------
    // NUEVO ELEMENTO
    //-------------------------------------------------

    const item: DesignerElement = {

      id: Date.now(),

      type,

      field: insertField,

      binding,

      text: labels[insertField] ?? "",

      x: 60,

      y: 60,

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
          : 35,

      rotation: 0,

      fontSize: 16,

      fontWeight: 400,

      color: "#000000",

      locked: false,

      visible: true

    };

    if (type === "barcode") {

      item.barcodeFormat = "CODE128";
      item.barcodeHeight = 45;
      item.barcodeWidth = 1.5;
      item.barcodeDisplayValue = true;

    }

    setElements(prev => [

      ...prev,

      item

    ]);

  }, [insertField, setElements]);

  //-------------------------------------------------
  // CANVAS
  //-------------------------------------------------

  return (

    <Card>

      <CardContent>

        {/* ZOOM */}

        <Box mb={2}>

          <Typography>

            Zoom {zoom}%

          </Typography>

          <Slider

            min={50}

            max={200}

            step={10}

            value={zoom}

            onChange={(_, value) =>

              setZoom(value as number)

            }

          />

        </Box>

        {/* CANVAS */}

        <Box

          display="flex"

          justifyContent="center"

        >

          <Box display="flex">

            {/* REGLA VERTICAL */}

            <Box

              sx={{

                width: 25,

                height: 340,

                background: "#f2f2f2",

                borderRight: "1px solid #ccc",

                position: "relative"

              }}

            >

              {Array.from({

                length: 17

              }).map((_, i) => (

                <Box

                  key={i}

                  sx={{

                    position: "absolute",

                    top: i * 20,

                    right: 0,

                    width: 8,

                    height: 1,

                    background: "#666"

                  }}

                />

              ))}

            </Box>

            <Box>

              {/* REGLA HORIZONTAL */}

              <Box

                sx={{

                  height: 25,

                  width: 520,

                  background: "#f2f2f2",

                  borderBottom: "1px solid #ccc",

                  position: "relative"

                }}

              >

                {Array.from({

                  length: 27

                }).map((_, i) => (

                  <Box

                    key={i}

                    sx={{

                      position: "absolute",

                      left: i * 20,

                      bottom: 0,

                      width: 1,

                      height: 8,

                      background: "#666"

                    }}

                  />

                ))}

              </Box>

              {/* ÁREA DE DISEÑO */}

              <Box

                onClick={() => setSelected(null)}

                sx={{

                  position: "relative",

                  width: 520,

                  height: 340,

                  overflow: "hidden",

                  background: "#fff",

                  border: "2px solid #0B7A3B",

                  transform:

                    `scale(${zoom / 100})`,

                  transformOrigin:

                    "top left",

                  backgroundImage: `

                    linear-gradient(

                      #ececec 1px,

                      transparent 1px

                    ),

                    linear-gradient(

                      90deg,

                      #ececec 1px,

                      transparent 1px

                    )

                  `,

                  backgroundSize:

                    "10px 10px"

                }}

              >

                {/* GUÍAS */}

                <Guides

                  vertical={verticalGuide}

                  horizontal={horizontalGuide}

                />

                {/* ELEMENTOS */}

                {elements

                  .filter(e => e.visible)

                  .map(element => (

                    <DesignerItem

                      key={element.id}

                      element={element}

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