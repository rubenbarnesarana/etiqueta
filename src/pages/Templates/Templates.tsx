import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useNavigate } from "react-router-dom";

import type { Template } from "../../services/TemplateStorage";

import {
  getTemplates,
  saveTemplates,
  deleteTemplate,
  setCurrentTemplate
} from "../../services/TemplateStorage";

export default function Templates() {

  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  function loadTemplates() {
    setTemplates([...getTemplates()]);
  }

  function newTemplate() {
    setCurrentTemplate(0);
    navigate("/templates/designer");
  }

  function editTemplate(template: Template) {
    setCurrentTemplate(template.id);
    navigate("/templates/designer");
  }

  function duplicateTemplate(template: Template) {

    const templates = getTemplates();

    templates.push({
      ...template,
      id: Date.now(),
      name: template.name + " (Copia)"
    });

    saveTemplates(templates);

    loadTemplates();

  }

  function removeTemplate(id: number) {

    if (!window.confirm("¿Eliminar esta plantilla?")) return;

    deleteTemplate(id);

    setTemplates(getTemplates());

  }

  return (

    <Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >

        <Typography
          variant="h4"
          fontWeight="bold"
        >
          Plantillas
        </Typography>

        <Button
          variant="contained"
          color="success"
          onClick={newTemplate}
        >
          Nueva plantilla
        </Button>

      </Stack>

      <Stack spacing={2}>

        {templates.map((template) => (

          <Card key={template.id}>

            <CardContent>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >

                <Box>

                  <Typography variant="h6">
                    {template.name}
                  </Typography>

                  <Typography color="text.secondary">
                    {template.elements.length} elementos
                  </Typography>

                </Box>

                <Stack direction="row">

                  <IconButton
                    color="primary"
                    onClick={() => editTemplate(template)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="success"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <ContentCopyIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => removeTemplate(template.id)}
                  >
                    <DeleteIcon />
                  </IconButton>

                </Stack>

              </Stack>

            </CardContent>

          </Card>

        ))}

        {templates.length === 0 && (

          <Typography align="center">

            No existen plantillas.

          </Typography>

        )}

      </Stack>

    </Box>

  );

}