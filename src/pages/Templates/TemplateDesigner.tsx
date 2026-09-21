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
  clearCurrentTemplate,
  type LabelFormat
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
    useState<LabelFormat>("FORMATO_1");

  const [backgroundImage, setBackgroundImage] =
    useState("");


  /*
   * ==================================================
   * CARGAR LISTA DE PLANTILLAS
   * ==================================================
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
   * ==================================================
   * CARGAR PLANTILLA ACTUAL
   * ==================================================
   */

  useEffect(() => {

    const currentId =
      getCurrentTemplate();


    if (currentId === null) {

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
        template.elements.map(
          element => ({
            ...element
          })
        )
      );


      setSelected(null);


      setBackgroundImage(
        template.backgroundImage || ""
      );


      setLabelFormat(
        template.labelFormat
      );
    }


    /*
     * Solo usamos currentTemplate
     * para abrir inicialmente la plantilla.
     */

    clearCurrentTemplate();

  }, [
    setElements,
    setSelected
  ]);


  /*
   * ==================================================
   * CAMBIAR PLANTILLA
   * ==================================================
   */

  function handleTemplateChange(
    value: string
  ) {

    if (!value) {

      setTemplateId(null);

      setElements([]);

      setSelected(null);

      setBackgroundImage("");

      setLabelFormat(
        "FORMATO_1"
      );

      return;
    }


    const id =
      Number(value);


    const template =
      findTemplate(id);


    if (!template) {
      return;
    }


    setTemplateId(
      template.id
    );


    setElements(
      template.elements.map(
        element => ({
          ...element
        })
      )
    );


    setSelected(null);


    setBackgroundImage(
      template.backgroundImage || ""
    );


    setLabelFormat(
      template.labelFormat
    );
  }


  /*
   * ==================================================
   * CAMBIAR FORMATO
   * ==================================================
   */

  function handleFormatChange(
    value: LabelFormat
  ) {

    setLabelFormat(
      value
    );
  }


  /*
   * ==================================================
   * CAMBIAR FONDO
   * ==================================================
   */

  function handleBackgroundChange(
    value: string
  ) {

    setBackgroundImage(
      value
    );
  }


  /*
   * ==================================================
   * GUARDAR PLANTILLA
   * ==================================================
   */

  function saveTemplate() {

    /*
     * ACTUALIZAR PLANTILLA EXISTENTE
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

        elements:
          elements.map(
            element => ({
              ...element
            })
          ),

        backgroundImage:
          backgroundImage || undefined,

        labelFormat

      });


      refreshTemplates();


      alert(
        `Plantilla "${template.name}" actualizada.`
      );


      return;
    }


    /*
     * CREAR PLANTILLA NUEVA
     */

    const name =
      window.prompt(
        "Nombre de la plantilla:"
      );


    if (!name) {
      return;
    }


    const cleanName =
      name.trim();


    if (!cleanName) {
      return;
    }


    /*
     * EVITAR DUPLICADOS
     */

    const existing =
      getTemplates().find(
        template =>
          template.name
            .trim()
            .toUpperCase() ===
          cleanName
            .toUpperCase()
      );


    if (existing) {

      alert(
        "Ya existe una plantilla con ese nombre."
      );

      return;
    }


    const id =
      Date.now();


    addTemplate({

      id,

      name:
        cleanName,

      elements:
        elements.map(
          element => ({
            ...element
          })
        ),

      backgroundImage:
        backgroundImage || undefined,

      labelFormat

    });


    setTemplateId(
      id
    );


    refreshTemplates();


    alert(
      `Plantilla "${cleanName}" guardada.`
    );
  }


  /*
   * ==================================================
   * AÑADIR TEXTO LIBRE
   * ==================================================
   */

  function triggerText() {

    setAddText(true);


    window.setTimeout(
      () => {

        setAddText(false);

      },
      100
    );
  }


  /*
   * ==================================================
   * INSERTAR CAMPO DINÁMICO
   * ==================================================
   */

  function triggerField(
    field: string
  ) {

    /*
     * Primero lo vaciamos para permitir
     * insertar dos veces seguidas
     * el mismo tipo de campo.
     */

    setInsertField("");


    window.setTimeout(
      () => {

        setInsertField(
          field
        );


        window.setTimeout(
          () => {

            setInsertField("");

          },
          100
        );

      },
      0
    );
  }


  /*
   * ==================================================
   * DUPLICAR ELEMENTO
   * ==================================================
   */

  function duplicateSelected() {

    if (selected === null) {
      return;
    }


    const element =
      elements.find(
        item =>
          item.id === selected
      );


    if (!element) {
      return;
    }


    const copy = {

      ...element,

      id:
        Date.now(),

      x:
        element.x + 5,

      y:
        element.y + 5
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
   * ==================================================
   * ELIMINAR ELEMENTO
   * ==================================================
   */

  function deleteSelected() {

    if (selected === null) {
      return;
    }


    setElements(
      prev =>
        prev.filter(
          element =>
            element.id !==
            selected
        )
    );


    setSelected(null);
  }


  /*
   * ==================================================
   * ACTUALIZAR DATOS DE PRUEBA
   * ==================================================
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
   * ==================================================
   * PLANTILLA SELECCIONADA
   * ==================================================
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
   * ==================================================
   * TAMAÑO REAL
   * ==================================================
   */

  const formatWidth =
    labelFormat === "FORMATO_1"
      ? 80
      : 110;

  const formatHeight =
    labelFormat === "FORMATO_1"
      ? 285
      : 240;


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box p={2}>

      {/* ==================================================
          CABECERA
         ================================================== */}

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

      </Box>


      {/* ==================================================
          CONFIGURACIÓN
         ================================================== */}

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
          flexWrap="wrap"
          useFlexGap
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
                  key={
                    template.id
                  }
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
                  LabelFormat
              )
            }
            sx={{
              minWidth: 240
            }}
          >

            <MenuItem
              value="FORMATO_1"
            >
              Formato 1 — 80 × 285 mm
            </MenuItem>

            <MenuItem
              value="FORMATO_2"
            >
              Formato 2 — 110 × 240 mm
            </MenuItem>

          </TextField>


          {/* FONDO */}

          <TextField
            label="Fondo de plantilla"
            value={
              backgroundImage
            }
            onChange={(event) =>
              handleBackgroundChange(
                event.target.value
              )
            }
            placeholder="/templates/amnon-formato1.png"
            sx={{
              minWidth: 340
            }}
          />

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
            useFlexGap
          >

            <Typography
              color="text.secondary"
            >
              Formato:{" "}

              <b>
                {formatWidth} × {formatHeight} mm
              </b>
            </Typography>


            <Typography
              color="text.secondary"
            >
              Plantilla:{" "}

              <b>
                {
                  selectedTemplate?.name ||
                  "Nueva plantilla"
                }
              </b>
            </Typography>


            <Typography
              color="text.secondary"
            >
              Fondo:{" "}

              <b>
                {
                  backgroundImage
                    ? backgroundImage
                        .split("/")
                        .pop()
                    : "Ninguno"
                }
              </b>
            </Typography>

          </Stack>

        </Box>

      </Paper>


      {/* ==================================================
          HERRAMIENTAS
         ================================================== */}

      <DesignerToolbar

        onSave={
          saveTemplate
        }

        onText={
          triggerText
        }

        onOrder={() =>
          triggerField(
            "ORDER"
          )
        }

        onLot={() =>
          triggerField(
            "LOT"
          )
        }

        onCoil={() =>
          triggerField(
            "COIL"
          )
        }

        onSKU={() =>
          triggerField(
            "SKU"
          )
        }

        onDescription={() =>
          triggerField(
            "DESCRIPTION"
          )
        }

        onBarcode={() =>
          triggerField(
            "BARCODE"
          )
        }

        onQR={() =>
          triggerField(
            "QR"
          )
        }

        onLogo={() =>
          triggerField(
            "LOGO"
          )
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
            value =>
              Math.min(
                200,
                value + 10
              )
          )
        }

        onZoomOut={() =>
          setZoom(
            value =>
              Math.max(
                50,
                value - 10
              )
          )
        }

        canDelete={
          selected !== null
        }

      />


      {/* ==================================================
          DATOS DE PRUEBA
         ================================================== */}

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
          Datos de prueba
        </Typography>


        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          useFlexGap
        >

          <TextField
            label="Orden SAP"
            value={
              labelData.ORDER
            }
            onChange={(event) =>
              updateLabel(
                "ORDER",
                event.target.value
              )
            }
          />


          <TextField
            label="SKU"
            value={
              labelData.SKU
            }
            onChange={(event) =>
              updateLabel(
                "SKU",
                event.target.value
              )
            }
          />


          <TextField
            label="Descripción"
            value={
              labelData.DESCRIPTION
            }
            onChange={(event) =>
              updateLabel(
                "DESCRIPTION",
                event.target.value
              )
            }
          />


          <TextField
            label="Código de barras"
            value={
              labelData.BARCODE
            }
            onChange={(event) =>
              updateLabel(
                "BARCODE",
                event.target.value
              )
            }
          />


          <TextField
            label="QR"
            value={
              labelData.QR
            }
            onChange={(event) =>
              updateLabel(
                "QR",
                event.target.value
              )
            }
          />


          <TextField
            label="Fecha"
            value={
              labelData.DATE
            }
            onChange={(event) =>
              updateLabel(
                "DATE",
                event.target.value
              )
            }
          />


          <TextField
            label="Lote"
            value={
              labelData.LOT
            }
            onChange={(event) =>
              updateLabel(
                "LOT",
                event.target.value
              )
            }
          />


          <TextField
            label="Bobina"
            value={
              labelData.COIL
            }
            onChange={(event) =>
              updateLabel(
                "COIL",
                event.target.value
              )
            }
          />


          <TextField
            label="Rollos"
            value={
              labelData.ROLLS
            }
            onChange={(event) =>
              updateLabel(
                "ROLLS",
                event.target.value
              )
            }
          />

        </Stack>

      </Paper>


      {/* ==================================================
          DISEÑADOR
         ================================================== */}

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
            Área de diseño:{" "}
            {formatWidth} × {formatHeight} mm
            {" · "}
            Zoom {zoom}%
          </Typography>


          <Paper
            sx={{
              p: 2,

              overflow: "auto",

              backgroundColor:
                "#eeeeee"
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
              labelFormat={
                labelFormat
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