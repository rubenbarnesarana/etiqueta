import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Menu,
  MenuItem,
  Typography,
  Button
} from "@mui/material";

import Canvas from "../../components/designer/Canvas";
import PropertyPanel from "../../components/designer/PropertyPanel";

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
    setElements
  } = useDesigner();

  const [anchorInsert, setAnchorInsert] =
    useState<null | HTMLElement>(null);

  const [addText, setAddText] = useState(false);

  const [insertField, setInsertField] =
    useState("");

  const [templateId, setTemplateId] =
    useState<number | null>(null);

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

      alert("Plantilla actualizada correctamente.");

      return;

    }

    const name = prompt("Nombre de la plantilla");

    if (!name) return;

    addTemplate({

      id: Date.now(),

      name,

      elements

    });

    alert("Plantilla guardada correctamente.");

  }

  function triggerText() {

    setAddText(true);

    setTimeout(() => setAddText(false), 100);

    setAnchorInsert(null);

  }

  function triggerField(field: string) {

    setInsertField(field);

    setTimeout(() => setInsertField(""), 100);

    setAnchorInsert(null);

  }

  return (

    <Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >

        <Typography
          variant="h4"
          fontWeight="bold"
        >

          🏷️ Diseñador de Plantillas

        </Typography>

        <Button
          variant="contained"
          color="success"
          onClick={saveTemplate}
        >

          Guardar plantilla

        </Button>

      </Box>

      <Paper
        sx={{
          display: "flex",
          gap: 4,
          p: 2,
          mb: 3,
          background: "#f5f5f5"
        }}
      >

        <Typography>Archivo</Typography>

        <Typography>Editar</Typography>

        <Typography
          sx={{ cursor: "pointer" }}
          onClick={(e) =>
            setAnchorInsert(e.currentTarget)
          }
        >

          Insertar

        </Typography>

        <Typography>Ver</Typography>

      </Paper>

      <Menu
        anchorEl={anchorInsert}
        open={Boolean(anchorInsert)}
        onClose={() => setAnchorInsert(null)}
      >

        <MenuItem onClick={triggerText}>
          🔤 Texto
        </MenuItem>

        <MenuItem onClick={() => triggerField("LOGO")}>
          🖼 Logo
        </MenuItem>

        <MenuItem onClick={() => triggerField("SKU")}>
          📦 SKU
        </MenuItem>

        <MenuItem onClick={() => triggerField("DESCRIPTION")}>
          📋 Descripción
        </MenuItem>

        <MenuItem onClick={() => triggerField("BARCODE")}>
          🏷 Código Barras
        </MenuItem>

        <MenuItem onClick={() => triggerField("QR")}>
          📱 Código QR
        </MenuItem>

        <MenuItem onClick={() => triggerField("DATE")}>
          📅 Fecha
        </MenuItem>

        <MenuItem onClick={() => triggerField("LOT")}>
          🔢 Lote
        </MenuItem>

        <MenuItem onClick={() => triggerField("COIL")}>
          🧵 Bobina
        </MenuItem>

        <MenuItem onClick={() => triggerField("ROLLS")}>
          📦 Total Rollos
        </MenuItem>

      </Menu>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "flex-start"
        }}
      >

        <Box sx={{ flex: 1 }}>

          <Canvas
            addText={addText}
            insertField={insertField}
          />

        </Box>

        <Box width={280}>

          <PropertyPanel />

        </Box>

      </Box>

    </Box>

  );

}