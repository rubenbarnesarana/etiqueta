import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  useEffect,
  useState
} from "react";

import Canvas from "../../components/designer/Canvas";
import PropertyPanel from "../../components/designer/PropertyPanel";

import {
  getTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setCurrentTemplate,
  getCurrentTemplate,
  clearCurrentTemplate,
  type Template,
  type LabelFormat
} from "../../services/TemplateStorage";

import {
  useDesigner
} from "../../components/designer/DesignerContext";


/*
 * ==================================================
 * PLANTILLAS OFICIALES FORMATO 1 - ROLLOS
 * 80 x 285 mm
 * ==================================================
 */

const ROLL_TEMPLATES = [
  {
    name: "AMNON",
    image: "/templates/amnon-formato1.png"
  },
  {
    name: "BLIND PIPE",
    image: "/templates/lisa-formato1.png"
  },
  {
    name: "MICROTUBE",
    image: "/templates/microtuborollos-formato1.png"
  },
  {
    name: "NAAN PC",
    image: "/templates/naanpc-formato1.png"
  },
  {
    name: "NAAN PC MAX",
    image: "/templates/naanpcmax-formato1.png"
  },
  {
    name: "TIFDRIP +",
    image: "/templates/tifdrip+-formato1.png"
  },
  {
    name: "TOP DRIP",
    image: "/templates/topdrip-formato1.png"
  },
  {
    name: "TURBO EXCEL",
    image: "/templates/turboexcelrollos-formato1.png"
  }
];


export default function Templates() {

  const {
    elements,
    setElements,
    labelData,
    setLabelData,
    setSelected
  } = useDesigner();


  const [templates, setTemplates] =
    useState<Template[]>([]);

  const [
    selectedTemplateId,
    setSelectedTemplateId
  ] =
    useState<number | "">("");


  /*
   * DIÁLOGO NUEVA PLANTILLA
   */

  const [
    newTemplateOpen,
    setNewTemplateOpen
  ] = useState(false);

  const [
    newTemplateName,
    setNewTemplateName
  ] = useState("");

  const [
    newTemplateFormat,
    setNewTemplateFormat
  ] = useState<LabelFormat>(
    "FORMATO_1"
  );

  const [
    newTemplateImage,
    setNewTemplateImage
  ] = useState("");


  /*
   * ==================================================
   * PLANTILLA SELECCIONADA
   * ==================================================
   */

  const selectedTemplate =
    templates.find(
      template =>
        Number(template.id) ===
        Number(selectedTemplateId)
    ) ?? null;


  /*
   * ==================================================
   * CARGAR PLANTILLAS
   * ==================================================
   */

  useEffect(() => {

    const loaded =
      getTemplates();

    setTemplates(loaded);

    const current =
      getCurrentTemplate();

    if (
      current !== null &&
      loaded.some(
        template =>
          Number(template.id) ===
          Number(current)
      )
    ) {

      setSelectedTemplateId(
        current
      );

      const template =
        loaded.find(
          item =>
            Number(item.id) ===
            Number(current)
        );

      if (template) {

        setElements(
          template.elements.map(
            element => ({
              ...element
            })
          )
        );

      }

    }

  }, [
    setElements
  ]);


  /*
   * ==================================================
   * SELECCIONAR PLANTILLA
   * ==================================================
   */

  function handleSelectTemplate(
    id: number
  ) {

    const template =
      templates.find(
        item =>
          Number(item.id) ===
          Number(id)
      );

    if (!template) {
      return;
    }

    setSelectedTemplateId(id);

    setCurrentTemplate(id);

    setSelected(null);

    setElements(
      template.elements.map(
        element => ({
          ...element
        })
      )
    );
  }


  /*
   * ==================================================
   * GUARDAR PLANTILLA ACTUAL
   * ==================================================
   */

  function saveCurrentTemplate() {

    if (!selectedTemplate) {
      return;
    }

    const updatedTemplate: Template = {
      ...selectedTemplate,

      elements:
        elements.map(
          element => ({
            ...element
          })
        )
    };

    updateTemplate(
      updatedTemplate
    );

    setTemplates(
      getTemplates()
    );

    alert(
      `Plantilla "${selectedTemplate.name}" guardada correctamente.`
    );
  }


  /*
   * ==================================================
   * ELIMINAR PLANTILLA
   * ==================================================
   */

  function removeCurrentTemplate() {

    if (!selectedTemplate) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar la plantilla "${selectedTemplate.name}"?\n\nEsta acción no se puede deshacer.`
      );

    if (!confirmed) {
      return;
    }

    deleteTemplate(
      selectedTemplate.id
    );

    clearCurrentTemplate();

    const updated =
      getTemplates();

    setTemplates(updated);

    setSelectedTemplateId("");

    setElements([]);

    setSelected(null);
  }


  /*
   * ==================================================
   * ABRIR NUEVA PLANTILLA
   * ==================================================
   */

  function openNewTemplateDialog() {

    setNewTemplateName("");

    setNewTemplateFormat(
      "FORMATO_1"
    );

    setNewTemplateImage("");

    setNewTemplateOpen(true);
  }


  /*
   * ==================================================
   * CREAR NUEVA PLANTILLA
   * ==================================================
   */

  function createNewTemplate() {

    const name =
      newTemplateName.trim();

    if (!name) {

      alert(
        "Debes indicar un nombre para la plantilla."
      );

      return;
    }


    /*
     * Comprobar nombre duplicado
     */

    const duplicate =
      templates.some(
        template =>
          template.name
            .trim()
            .toUpperCase() ===
          name.toUpperCase()
      );

    if (duplicate) {

      alert(
        "Ya existe una plantilla con ese nombre."
      );

      return;
    }


    /*
     * Normalizamos la ruta de imagen.
     *
     * Se puede escribir:
     *
     * mi-plantilla.png
     *
     * o:
     *
     * /templates/mi-plantilla.png
     */

    let image =
      newTemplateImage.trim();

    if (
      image &&
      !image.startsWith("/")
    ) {

      image =
        `/templates/${image}`;
    }


    const newTemplate: Template = {

      id:
        Date.now(),

      name,

      labelFormat:
        newTemplateFormat,

      backgroundImage:
        image || undefined,

      elements: []

    };


    addTemplate(
      newTemplate
    );


    const updated =
      getTemplates();

    setTemplates(updated);

    setSelectedTemplateId(
      newTemplate.id
    );

    setCurrentTemplate(
      newTemplate.id
    );

    setElements([]);

    setSelected(null);

    setNewTemplateOpen(false);
  }


  /*
   * ==================================================
   * CREAR / ACTUALIZAR PLANTILLAS OFICIALES
   * ==================================================
   */

  function createAllRollTemplates() {

    let currentTemplates =
      getTemplates();


    ROLL_TEMPLATES.forEach(
      (
        rollTemplate,
        index
      ) => {

        const existing =
          currentTemplates.find(
            template =>
              template.name
                .trim()
                .toUpperCase() ===
              rollTemplate.name
                .trim()
                .toUpperCase()
          );


        /*
         * Si existe:
         * actualizamos formato y fondo,
         * pero CONSERVAMOS sus elementos.
         */

        if (existing) {

          updateTemplate({
            ...existing,

            labelFormat:
              "FORMATO_1",

            backgroundImage:
              rollTemplate.image
          });

        } else {

          /*
           * Si no existe:
           * la creamos.
           */

          const newTemplate: Template = {

            id:
              Date.now() +
              index +
              Math.floor(
                Math.random() *
                100000
              ),

            name:
              rollTemplate.name,

            labelFormat:
              "FORMATO_1",

            backgroundImage:
              rollTemplate.image,

            elements: []
          };


          addTemplate(
            newTemplate
          );
        }


        currentTemplates =
          getTemplates();
      }
    );


    const updated =
      getTemplates();

    setTemplates(updated);


    /*
     * Dejamos AMNON seleccionada.
     */

    const amnon =
      updated.find(
        template =>
          template.name
            .trim()
            .toUpperCase() ===
          "AMNON"
      );


    if (amnon) {

      setSelectedTemplateId(
        amnon.id
      );

      setCurrentTemplate(
        amnon.id
      );

      setSelected(null);

      setElements(
        amnon.elements.map(
          element => ({
            ...element
          })
        )
      );
    }
  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box>

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{
          mb: 3
        }}
      >
        Plantillas
      </Typography>


      {/* ==================================================
          GESTIÓN DE PLANTILLAS
         ================================================== */}

      <Card
        sx={{
          mb: 3
        }}
      >

        <CardContent>

          <Stack spacing={2}>

            <Typography
              variant="h6"
              fontWeight="bold"
            >
              Plantilla
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

              {/* SELECCIONAR */}

              <TextField
                select
                label="Seleccionar plantilla"
                value={
                  selectedTemplateId
                }
                onChange={(e) => {

                  const value =
                    Number(
                      e.target.value
                    );

                  handleSelectTemplate(
                    value
                  );
                }}
                sx={{
                  minWidth: 280
                }}
              >

                {templates.map(
                  template => (

                    <MenuItem
                      key={
                        template.id
                      }
                      value={
                        template.id
                      }
                    >
                      {template.name}
                    </MenuItem>

                  )
                )}

              </TextField>


              {/* NUEVA */}

              <Button
                variant="outlined"
                startIcon={
                  <AddIcon />
                }
                onClick={
                  openNewTemplateDialog
                }
              >
                Nueva plantilla
              </Button>


              {/* GUARDAR */}

              <Button
                variant="contained"
                startIcon={
                  <SaveIcon />
                }
                disabled={
                  !selectedTemplate
                }
                onClick={
                  saveCurrentTemplate
                }
              >
                Guardar plantilla
              </Button>


              {/* ELIMINAR */}

              <Button
                variant="outlined"
                color="error"
                startIcon={
                  <DeleteIcon />
                }
                disabled={
                  !selectedTemplate
                }
                onClick={
                  removeCurrentTemplate
                }
              >
                Eliminar plantilla
              </Button>

            </Stack>


            <Divider />


            {/* PLANTILLAS OFICIALES */}

            <Stack
              direction={{
                xs: "column",
                md: "row"
              }}
              spacing={2}
              alignItems={{
                xs: "stretch",
                md: "center"
              }}
            >

              <Button
                variant="text"
                startIcon={
                  <AddIcon />
                }
                onClick={
                  createAllRollTemplates
                }
              >
                Crear / actualizar plantillas de rollos
              </Button>


              <Typography
                variant="caption"
                color="text.secondary"
              >
                Mantiene las plantillas oficiales de rollos y conserva los elementos que ya hayas diseñado.
              </Typography>

            </Stack>


            {/* INFORMACIÓN */}

            {selectedTemplate && (

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Formato:{" "}

                <strong>
                  {selectedTemplate.labelFormat}
                </strong>

                {" · "}

                Fondo:{" "}

                <strong>
                  {selectedTemplate.backgroundImage ||
                    "Sin fondo"}
                </strong>
              </Typography>

            )}

          </Stack>

        </CardContent>

      </Card>


      {/* ==================================================
          DATOS DE PRUEBA
         ================================================== */}

      {selectedTemplate && (

        <Card
          sx={{
            mb: 3
          }}
        >

          <CardContent>

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                mb: 2
              }}
            >
              Datos de prueba
            </Typography>


            <Grid
              container
              spacing={2}
            >

              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="Orden SAP"
                  value={
                    labelData.ORDER
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        ORDER:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="SKU"
                  value={
                    labelData.SKU
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        SKU:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="Descripción"
                  value={
                    labelData.DESCRIPTION
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        DESCRIPTION:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="Código de barras"
                  value={
                    labelData.BARCODE
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        BARCODE:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="QR"
                  value={
                    labelData.QR
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        QR:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="Fecha"
                  value={
                    labelData.DATE
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        DATE:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="Lote"
                  value={
                    labelData.LOT
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        LOT:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="Bobina"
                  value={
                    labelData.COIL
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        COIL:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>


              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}
              >
                <TextField
                  label="Rollos"
                  value={
                    labelData.ROLLS
                  }
                  onChange={(e) =>
                    setLabelData(
                      prev => ({
                        ...prev,
                        ROLLS:
                          e.target.value
                      })
                    )
                  }
                  fullWidth
                />
              </Grid>

            </Grid>

          </CardContent>

        </Card>

      )}


      {/* ==================================================
          EDITOR
         ================================================== */}

      {selectedTemplate && (

        <Grid
          container
          spacing={2}
        >

          <Grid
            size={{
              xs: 12,
              lg: 8
            }}
          >

            <Card>

              <CardContent>

                <Canvas
                  addText={false}
                  insertField=""
                  zoom={100}
                  backgroundImage={
                    selectedTemplate.backgroundImage
                  }
                  labelFormat={
                    selectedTemplate.labelFormat
                  }
                />

              </CardContent>

            </Card>

          </Grid>


          <Grid
            size={{
              xs: 12,
              lg: 4
            }}
          >

            <PropertyPanel />

          </Grid>

        </Grid>

      )}


      {/* ==================================================
          DIÁLOGO NUEVA PLANTILLA
         ================================================== */}

      <Dialog
        open={
          newTemplateOpen
        }
        onClose={() =>
          setNewTemplateOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Nueva plantilla
        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={2}
            sx={{
              mt: 1
            }}
          >

            <TextField
              label="Nombre de la plantilla"
              value={
                newTemplateName
              }
              onChange={(e) =>
                setNewTemplateName(
                  e.target.value
                )
              }
              placeholder="Ejemplo: NUEVO PRODUCTO"
              autoFocus
              fullWidth
            />


            <TextField
              select
              label="Formato"
              value={
                newTemplateFormat
              }
              onChange={(e) =>
                setNewTemplateFormat(
                  e.target.value as LabelFormat
                )
              }
              fullWidth
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


            <TextField
              label="Imagen de fondo"
              value={
                newTemplateImage
              }
              onChange={(e) =>
                setNewTemplateImage(
                  e.target.value
                )
              }
              placeholder="ejemplo-formato1.png"
              helperText="La imagen debe estar guardada en public/templates. Puedes escribir solo el nombre del archivo."
              fullWidth
            />


            <Typography
              variant="body2"
              color="text.secondary"
            >
              Ejemplo: si guardas la imagen como
              {" "}
              <strong>
                public/templates/nuevo-producto.png
              </strong>
              , aquí puedes escribir simplemente
              {" "}
              <strong>
                nuevo-producto.png
              </strong>.
            </Typography>

          </Stack>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setNewTemplateOpen(false)
            }
          >
            Cancelar
          </Button>


          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              createNewTemplate
            }
          >
            Crear plantilla
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}