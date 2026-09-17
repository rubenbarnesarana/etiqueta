import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem
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
  getTemplates,
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

  const [templateId, setTemplateId] =
    useState<number | null>(null);

  const [addText, setAddText] =
    useState(false);

  const [insertField, setInsertField] =
    useState("");

  const [zoom, setZoom] =
    useState(100);

  const [templates, setTemplates] =
    useState<ReturnType<typeof getTemplates>>([]);

  const [labelFormat, setLabelFormat] =
    useState<"FORMATO_1" | "FORMATO_2">("FORMATO_1");

  const [backgroundImage, setBackgroundImage] =
    useState("");


  /*
   * FONDOS AUTOMÁTICOS
   */

  function getBackgroundForTemplate(
    templateName: string
  ): string {

    const name =
      templateName
        .toLowerCase()
        .trim();

    if (name.includes("naan pc")) {
      return "/templates/naan-pc-formato1.png";
    }

    if (name.includes("amnon")) {
      return "/templates/amnon-formato1.png";
    }

    return "";
  }


  /*
   * CARGAR PLANTILLAS
   */

  function refreshTemplates() {

    setTemplates(
      getTemplates()
    );

  }

  useEffect(() => {

    refreshTemplates();

  }, []);


  /*
   * CARGAR PLANTILLA ACTUAL
   */

  useEffect(() => {

    const currentId =
      getCurrentTemplate();

    if (!currentId) {

      setTemplateId(null);
      setElements([]);
      setSelected(null);
      setBackgroundImage("");

      return;

    }

    const template =
      findTemplate(currentId);

    if (template) {

      setTemplateId(
        template.id
      );

      setElements(
        template.elements ?? []
      );

      const savedBackground =
        (template as any).backgroundImage;

      setBackgroundImage(
        savedBackground ||
        getBackgroundForTemplate(
          template.name
        )
      );

      setLabelFormat(
        (template as any).labelFormat ||
        "FORMATO_1"
      );

    }

    clearCurrentTemplate();

  }, [setElements, setSelected]);


  /*
   * CAMBIAR PLANTILLA
   */

  function handleTemplateChange(
    value: string
  ) {

    if (!value) {

      setTemplateId(null);
      setElements([]);
      setSelected(null);
      setBackgroundImage("");

      return;

    }

    const id =
      Number(value);

    const template =
      findTemplate(id);

    if (!template) return;

    setTemplateId(
      template.id
    );

    setElements(
      template.elements ?? []
    );

    setSelected(null);

    const savedBackground =
      (template as any).backgroundImage;

    setBackgroundImage(
      savedBackground ||
      getBackgroundForTemplate(
        template.name
      )
    );

    setLabelFormat(
      (template as any).labelFormat ||
      "FORMATO_1"
    );

  }


  /*
   * CAMBIAR FORMATO
   */

  function handleFormatChange(
    value: "FORMATO_1" | "FORMATO_2"
  ) {

    setLabelFormat(value);

    if (value === "FORMATO_2") {

      setBackgroundImage("");

      return;

    }

    if (templateId !== null) {

      const template =
        findTemplate(
          templateId
        );

      if (template) {

        const savedBackground =
          (template as any).backgroundImage;

        setBackgroundImage(
          savedBackground ||
          getBackgroundForTemplate(
            template.name
          )
        );

      }

    }

  }


  /*
   * CAMBIAR FONDO
   */

  function handleBackgroundChange(
    value: string
  ) {

    setBackgroundImage(
      value
    );

  }


  /*
   * GUARDAR PLANTILLA
   */

  function saveTemplate() {

    /*
     * ACTUALIZAR
     */

    if (templateId !== null) {

      const template =
        findTemplate(
          templateId
        );

      if (!template) {

        alert(
          "No se ha encontrado la plantilla."
        );

        return;

      }

      updateTemplate({

        ...template,

        elements,

        backgroundImage,

        labelFormat

      } as any);

      refreshTemplates();

      alert(
        `Plantilla "${template.name}" actualizada.`
      );

      return;

    }


    /*
     * CREAR NUEVA
     */

    const name =
      prompt(
        "Nombre de la plantilla:"
      );

    if (!name) return;

    const cleanName =
      name.trim();

    if (!cleanName) return;


    /*
     * EVITAR DUPLICADOS
     */

    const existing =
      getTemplates().find(
        template =>
          template.name
            .toLowerCase()
            .trim() ===
          cleanName
            .toLowerCase()
            .trim()
      );

    if (existing) {

      alert(
        "Ya existe una plantilla con ese nombre."
      );

      return;

    }


    const id =
      Date.now();


    /*
     * FONDO AUTOMÁTICO
     */

    const automaticBackground =
      backgroundImage ||
      getBackgroundForTemplate(
        cleanName
      );


    addTemplate({

      id,

      name: cleanName,

      elements,

      backgroundImage:
        automaticBackground,

      labelFormat

    } as any);


    setTemplateId(
      id
    );

    setBackgroundImage(
      automaticBackground
    );

    refreshTemplates();

    alert(
      `Plantilla "${cleanName}" guardada.`
    );

  }


  /*
   * CREAR AMNON DIRECTAMENTE
   *
   * Esto nos permite hacer la prueba
   * sin tener que crearla manualmente.
   */

  function createAmnonTemplate() {

    const existing =
      getTemplates().find(
        template =>
          template.name
            .toLowerCase()
            .trim() === "amnon"
      );

    if (existing) {

      setTemplateId(
        existing.id
      );

      setElements(
        existing.elements ?? []
      );

      setBackgroundImage(
        (existing as any).backgroundImage ||
        "/templates/amnon-formato1.png"
      );

      setLabelFormat(
        "FORMATO_1"
      );

      refreshTemplates();

      alert(
        "La plantilla AMNON ya existe y ha sido cargada."
      );

      return;

    }


    const id =
      Date.now();


    addTemplate({

      id,

      name: "AMNON",

      elements: [],

      backgroundImage:
        "/templates/amnon-formato1.png",

      labelFormat:
        "FORMATO_1"

    } as any);


    setTemplateId(
      id
    );

    setElements([]);

    setSelected(null);

    setBackgroundImage(
      "/templates/amnon-formato1.png"
    );

    setLabelFormat(
      "FORMATO_1"
    );

    refreshTemplates();

    alert(
      "Plantilla AMNON creada."
    );

  }


  /*
   * AÑADIR TEXTO
   */

  function triggerText() {

    setAddText(true);

    setTimeout(() => {

      setAddText(false);

    }, 100);

  }


  /*
   * INSERTAR CAMPO
   */

  function triggerField(
    field: string
  ) {

    setInsertField(
      field
    );

    setTimeout(() => {

      setInsertField("");

    }, 100);

  }


  /*
   * DUPLICAR
   */

  function duplicateSelected() {

    if (selected == null) return;

    const element =
      elements.find(
        e =>
          e.id === selected
      );

    if (!element) return;

    const copy = {

      ...element,

      id: Date.now(),

      x: element.x + 15,

      y: element.y + 15

    };

    setElements(
      prev => [
        ...prev,
        copy
      ]
    );

    setSelected(
      copy.id
    );

  }


  /*
   * ELIMINAR
   */

  function deleteSelected() {

    if (selected == null) return;

    setElements(
      prev =>
        prev.filter(
          e =>
            e.id !== selected
        )
    );

    setSelected(null);

  }


  /*
   * DATOS DE PRUEBA
   */

  function updateLabel(
    field:
      keyof typeof labelData,
    value: string
  ) {

    setLabelData(
      prev => ({
        ...prev,
        [field]: value
      })
    );

  }


  /*
   * PLANTILLA SELECCIONADA
   */

  const selectedTemplate =
    templateId !== null
      ? templates.find(
          template =>
            Number(template.id) ===
            Number(templateId)
        )
      : null;


  /*
   * TAMAÑO
   */

  const formatWidth =
    labelFormat === "FORMATO_1"
      ? 285
      : 240;

  const formatHeight =
    labelFormat === "FORMATO_1"
      ? 80
      : 110;


  /*
   * RENDER
   */

  return (

    <Box p={2}>

      {/* CABECERA */}

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
          Diseñador de Plantillas
        </Typography>

        <Stack
          direction="row"
          spacing={1}
        >

          <Button
            variant="outlined"
            color="success"
            onClick={
              createAmnonTemplate
            }
          >
            Crear AMNON
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={
              <SaveIcon />
            }
            onClick={
              saveTemplate
            }
          >
            Guardar
          </Button>

        </Stack>

      </Box>


      {/* CONFIGURACIÓN */}

      <Paper
        sx={{
          p: 2,
          mb: 2
        }}
      >

        <Typography
          variant="h6"
          mb={2}
          fontWeight="bold"
        >
          Configuración de plantilla
        </Typography>


        <Stack
          direction={{
            xs: "column",
            md: "row"
          }}
          spacing={2}
        >

          {/* PLANTILLA */}

          <TextField
            select
            label="Plantilla"
            value={
              templateId !== null
                ? String(templateId)
                : ""
            }
            onChange={(event) =>
              handleTemplateChange(
                event.target.value
              )
            }
            sx={{
              minWidth: 300
            }}
          >

            <MenuItem value="">
              Seleccionar plantilla
            </MenuItem>

            {templates.map(
              template => (

                <MenuItem
                  key={template.id}
                  value={
                    String(
                      template.id
                    )
                  }
                >
                  {template.name}
                </MenuItem>

              )
            )}

          </TextField>


          {/* FORMATO */}

          <TextField
            select
            label="Formato"
            value={
              labelFormat
            }
            onChange={(event) =>
              handleFormatChange(
                event.target.value as
                  | "FORMATO_1"
                  | "FORMATO_2"
              )
            }
            sx={{
              minWidth: 230
            }}
          >

            <MenuItem value="FORMATO_1">
              Formato 1 — 285 × 80 mm
            </MenuItem>

            <MenuItem value="FORMATO_2">
              Formato 2 — 240 × 110 mm
            </MenuItem>

          </TextField>


          {/* FONDO */}

          <TextField
            select
            label="Fondo de plantilla"
            value={
              backgroundImage
            }
            onChange={(event) =>
              handleBackgroundChange(
                event.target.value
              )
            }
            sx={{
              minWidth: 300
            }}
          >

            <MenuItem value="">
              Sin fondo
            </MenuItem>

            <MenuItem
              value="/templates/naan-pc-formato1.png"
            >
              NAAN PC — Formato 1
            </MenuItem>

            <MenuItem
              value="/templates/amnon-formato1.png"
            >
              AMNON — Formato 1
            </MenuItem>

          </TextField>

        </Stack>


        {/* INFORMACIÓN */}

        <Box
          mt={2}
          p={1.5}
          sx={{
            backgroundColor:
              "rgba(0,0,0,0.04)",
            borderRadius: 1
          }}
        >

          <Stack
            direction="row"
            spacing={3}
            flexWrap="wrap"
          >

            <Typography color="text.secondary">
              Formato:
              {" "}
              <b>
                {formatWidth} × {formatHeight} mm
              </b>
            </Typography>

            <Typography color="text.secondary">
              Plantilla:
              {" "}
              <b>
                {
                  selectedTemplate?.name ||
                  "Nueva plantilla"
                }
              </b>
            </Typography>

            <Typography color="text.secondary">
              Fondo:
              {" "}
              <b>
                {backgroundImage
                  ? backgroundImage
                      .split("/")
                      .pop()
                  : "Ninguno"}
              </b>
            </Typography>

          </Stack>

        </Box>

      </Paper>


      {/* HERRAMIENTAS */}

      <DesignerToolbar

        onSave={
          saveTemplate
        }

        onText={
          triggerText
        }

        onSKU={() =>
          triggerField("SKU")
        }

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

        onDuplicate={
          duplicateSelected
        }

        onDelete={
          deleteSelected
        }

        onUndo={() => {}}

        onRedo={() => {}}

        onZoomIn={() =>
          setZoom(
            z =>
              Math.min(
                200,
                z + 10
              )
          )
        }

        onZoomOut={() =>
          setZoom(
            z =>
              Math.max(
                50,
                z - 10
              )
          )
        }

        canDelete={
          selected !== null
        }

      />


      {/* DATOS DE PRUEBA */}

      <Paper
        sx={{
          p: 2,
          mb: 2
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
          useFlexGap
        >

          <TextField
            label="SKU"
            value={
              labelData.SKU
            }
            onChange={(e) =>
              updateLabel(
                "SKU",
                e.target.value
              )
            }
          />

          <TextField
            label="Descripción"
            value={
              labelData.DESCRIPTION
            }
            onChange={(e) =>
              updateLabel(
                "DESCRIPTION",
                e.target.value
              )
            }
          />

          <TextField
            label="Fecha"
            value={
              labelData.DATE
            }
            onChange={(e) =>
              updateLabel(
                "DATE",
                e.target.value
              )
            }
          />

          <TextField
            label="Lote"
            value={
              labelData.LOT
            }
            onChange={(e) =>
              updateLabel(
                "LOT",
                e.target.value
              )
            }
          />

          <TextField
            label="Bobina"
            value={
              labelData.COIL
            }
            onChange={(e) =>
              updateLabel(
                "COIL",
                e.target.value
              )
            }
          />

          <TextField
            label="Rollos"
            value={
              labelData.ROLLS
            }
            onChange={(e) =>
              updateLabel(
                "ROLLS",
                e.target.value
              )
            }
          />

        </Stack>

      </Paper>


      {/* DISEÑADOR */}

      <Box
        display="flex"
        gap={2}
        alignItems="flex-start"
      >

        {/* CANVAS */}

        <Box
          flex={1}
          sx={{
            minWidth: 0
          }}
        >

          <Typography
            variant="body2"
            color="text.secondary"
            mb={1}
          >
            Área de diseño:
            {" "}
            {formatWidth} × {formatHeight} mm
          </Typography>

          <Paper
            sx={{
              p: 2,
              overflow: "auto",
              backgroundColor: "#eeeeee"
            }}
          >

            <Canvas
              addText={
                addText
              }
              insertField={
                insertField
              }
              zoom={
                zoom
              }
              backgroundImage={
                backgroundImage
              }
            />

          </Paper>

        </Box>


        {/* PROPIEDADES */}

        <Box
          width={340}
          flexShrink={0}
        >

          <PropertyPanel />

        </Box>

      </Box>

    </Box>

  );

}