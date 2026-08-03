import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";

import Canvas from "../../components/designer/Canvas";
import PropertyPanel from "../../components/designer/PropertyPanel";
import DesignerToolbar from "../../components/designer/DesignerToolbar";

import { useDesigner } from "../../components/designer/DesignerContext";

import {
  addTemplate,
  updateTemplate,
  findTemplate,
  getCurrentTemplate,
  clearCurrentTemplate
} from "../../services/TemplateStorage";

export default function TemplateDesigner() {

  const {

    elements,

    setElements,

    selected,

    setSelected,

    labelData,

    setLabelData

  } = useDesigner();

  const [

    templateId,

    setTemplateId

  ] = useState<number | null>(null);

  const [

    addText,

    setAddText

  ] = useState(false);

  const [

    insertField,

    setInsertField

  ] = useState("");

  const [

    zoom,

    setZoom

  ] = useState(100);

  useEffect(() => {

    const id = getCurrentTemplate();

    if (!id) {

      setTemplateId(null);

      setElements([]);

      return;

    }

    const template = findTemplate(id);

    if (template) {

      setTemplateId(template.id);

      setElements(template.elements);

    }

    clearCurrentTemplate();

  }, [setElements]);

  function saveTemplate() {

    if (templateId) {

      const template = findTemplate(templateId);

      if (!template) return;

      updateTemplate({

        ...template,

        elements

      });

      alert("Plantilla actualizada.");

      return;

    }

    const name = prompt("Nombre plantilla");

    if (!name) return;

    const id = Date.now();

    addTemplate({

      id,

      name,

      elements

    });

    setTemplateId(id);

    alert("Plantilla guardada.");

  }

  function triggerText() {

    setAddText(true);

    setTimeout(() => {

      setAddText(false);

    }, 100);

  }

  function triggerField(field: string) {

    setInsertField(field);

    setTimeout(() => {

      setInsertField("");

    }, 100);

  }

  function duplicateSelected() {

    if (selected == null) return;

    const element =
      elements.find(e => e.id === selected);

    if (!element) return;

    const copy = {

      ...element,

      id: Date.now(),

      x: element.x + 15,

      y: element.y + 15

    };

    setElements(prev => [

      ...prev,

      copy

    ]);

    setSelected(copy.id);

  }

  function deleteSelected() {

    if (selected == null) return;

    setElements(prev =>

      prev.filter(

        e => e.id !== selected

      )

    );

    setSelected(null);

  }

  function updateLabel(

    field: keyof typeof labelData,

    value: string

  ) {

    setLabelData(prev => ({

      ...prev,

      [field]: value

    }));

  }

  return (

    <Box p={2}>      <Box

        display="flex"

        justifyContent="space-between"

        alignItems="center"

        mb={2}

      >

        <Typography

          variant="h4"

          fontWeight="bold"

        >

          Diseñador de Plantillas

        </Typography>

        <Button

          variant="contained"

          color="success"

          startIcon={<SaveIcon />}

          onClick={saveTemplate}

        >

          Guardar

        </Button>

      </Box>

      <DesignerToolbar

        onSave={saveTemplate}

        onText={triggerText}

        onSKU={() => triggerField("SKU")}

        onDescription={() =>

          triggerField("DESCRIPTION")

        }

        onBarcode={() =>

          triggerField("BARCODE")

        }

        onQR={() =>

          triggerField("QR")

        }

        onLogo={() =>

          triggerField("LOGO")

        }

        onDuplicate={duplicateSelected}

        onDelete={deleteSelected}

        onUndo={() => {}}

        onRedo={() => {}}

        onZoomIn={() =>

          setZoom(z =>

            Math.min(200, z + 10)

          )

        }

        onZoomOut={() =>

          setZoom(z =>

            Math.max(50, z - 10)

          )

        }

        canDelete={selected !== null}

      />

      <Paper

        sx={{

          p:2,

          mb:2

        }}

      >

        <Typography

          variant="h6"

          mb={2}

        >

          Datos de prueba

        </Typography>

        <Stack

          direction="row"

          spacing={2}

          flexWrap="wrap"

        >

          <TextField

            label="SKU"

            value={labelData.SKU}

            onChange={(e)=>

              updateLabel(

                "SKU",

                e.target.value

              )

            }

          />

          <TextField

            label="Descripción"

            value={labelData.DESCRIPTION}

            onChange={(e)=>

              updateLabel(

                "DESCRIPTION",

                e.target.value

              )

            }

          />

          <TextField

            label="Fecha"

            value={labelData.DATE}

            onChange={(e)=>

              updateLabel(

                "DATE",

                e.target.value

              )

            }

          />          <TextField

            label="Lote"

            value={labelData.LOT}

            onChange={(e)=>

              updateLabel(

                "LOT",

                e.target.value

              )

            }

          />

          <TextField

            label="Bobina"

            value={labelData.COIL}

            onChange={(e)=>

              updateLabel(

                "COIL",

                e.target.value

              )

            }

          />

          <TextField

            label="Rollos"

            value={labelData.ROLLS}

            onChange={(e)=>

              updateLabel(

                "ROLLS",

                e.target.value

              )

            }

          />

        </Stack>

      </Paper>

      <Box

        display="flex"

        gap={2}

        alignItems="flex-start"

      >

        <Box

          flex={1}

        >

          <Canvas

            addText={addText}

            insertField={insertField}

            zoom={zoom}

          />

        </Box>

        <Box

          width={340}

        >

          <PropertyPanel />

        </Box>

      </Box>    </Box>

  );

}