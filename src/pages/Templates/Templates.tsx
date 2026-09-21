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
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import {
  useEffect,
  useState
} from "react";

import Canvas from "../../components/designer/Canvas";
import PropertyPanel from "../../components/designer/PropertyPanel";
import DesignerToolbar from "../../components/designer/DesignerToolbar";

import {
  getTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setCurrentTemplate,
  getCurrentTemplate,
  clearCurrentTemplate,
  applyAmnonFormat1Layout,
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
    selected,
    setSelected,
    labelData,
    setLabelData
  } = useDesigner();


  /*
   * ==================================================
   * PLANTILLAS
   * ==================================================
   */

  const [
    templates,
    setTemplates
  ] = useState<Template[]>([]);


  const [
    selectedTemplateId,
    setSelectedTemplateId
  ] =
    useState<number | "">("");


  /*
   * ==================================================
   * DISEÑADOR
   * ==================================================
   */

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


  /*
   * ==================================================
   * DIÁLOGO NUEVA PLANTILLA
   * ==================================================
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
  ] =
    useState<LabelFormat>(
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
        Number(
          template.id
        ) ===
        Number(
          selectedTemplateId
        )
    ) ??
    null;


  const isAmnon =
    selectedTemplate?.name
      .trim()
      .toUpperCase() ===
    "AMNON";


  /*
   * ==================================================
   * CARGAR PLANTILLAS
   * ==================================================
   */

  useEffect(() => {

    const loaded =
      getTemplates();


    setTemplates(
      loaded
    );


    const current =
      getCurrentTemplate();


    if (
      current !== null &&
      loaded.some(
        template =>
          Number(
            template.id
          ) ===
          Number(
            current
          )
      )
    ) {

      setSelectedTemplateId(
        current
      );


      const template =
        loaded.find(
          item =>
            Number(
              item.id
            ) ===
            Number(
              current
            )
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
          Number(
            item.id
          ) ===
          Number(
            id
          )
      );


    if (!template) {
      return;
    }


    setSelectedTemplateId(
      id
    );


    setCurrentTemplate(
      id
    );


    setSelected(
      null
    );


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
   * GUARDAR PLANTILLA
   * ==================================================
   */

  function saveCurrentTemplate() {

    if (
      !selectedTemplate
    ) {
      return;
    }


    const updatedTemplate:
      Template = {

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
   * APLICAR DISEÑO OFICIAL AMNON
   * ==================================================
   */

  function applyAmnonLayout() {

    if (
      !selectedTemplate
    ) {
      return;
    }


    if (
      selectedTemplate.name
        .trim()
        .toUpperCase() !==
      "AMNON"
    ) {

      alert(
        "Este diseño solo se puede aplicar a la plantilla AMNON."
      );

      return;
    }


    const confirmed =
      window.confirm(
        "Se sustituirán los elementos dinámicos actuales de AMNON por la distribución automática.\n\nEl fondo de la plantilla se mantendrá como AMNON Formato 1.\n\n¿Continuar?"
      );


    if (
      !confirmed
    ) {
      return;
    }


    const updated =
      applyAmnonFormat1Layout(
        selectedTemplate.id
      );


    if (
      !updated
    ) {

      alert(
        "No se ha podido aplicar el diseño AMNON."
      );

      return;
    }


    setElements(
      updated.elements.map(
        element => ({
          ...element
        })
      )
    );


    setSelected(
      null
    );


    const refreshed =
      getTemplates();


    setTemplates(
      refreshed
    );


    setSelectedTemplateId(
      updated.id
    );


    setCurrentTemplate(
      updated.id
    );


    alert(
      "Diseño AMNON aplicado correctamente."
    );
  }


  /*
   * ==================================================
   * ELIMINAR PLANTILLA
   * ==================================================
   */

  function removeCurrentTemplate() {

    if (
      !selectedTemplate
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar la plantilla "${selectedTemplate.name}"?\n\nEsta acción no se puede deshacer.`
      );


    if (
      !confirmed
    ) {
      return;
    }


    deleteTemplate(
      selectedTemplate.id
    );


    clearCurrentTemplate();


    const updated =
      getTemplates();


    setTemplates(
      updated
    );


    setSelectedTemplateId(
      ""
    );


    setElements([]);


    setSelected(
      null
    );
  }


  /*
   * ==================================================
   * ABRIR NUEVA PLANTILLA
   * ==================================================
   */

  function openNewTemplateDialog() {

    setNewTemplateName(
      ""
    );


    setNewTemplateFormat(
      "FORMATO_1"
    );


    setNewTemplateImage(
      ""
    );


    setNewTemplateOpen(
      true
    );
  }


  /*
   * ==================================================
   * CREAR NUEVA PLANTILLA
   * ==================================================
   */

  function createNewTemplate() {

    const name =
      newTemplateName
        .trim();


    if (
      !name
    ) {

      alert(
        "Debes indicar un nombre para la plantilla."
      );

      return;
    }


    const duplicate =
      templates.some(
        template =>
          template.name
            .trim()
            .toUpperCase() ===
          name.toUpperCase()
      );


    if (
      duplicate
    ) {

      alert(
        "Ya existe una plantilla con ese nombre."
      );

      return;
    }


    let image =
      newTemplateImage
        .trim();


    if (
      image &&
      !image.startsWith(
        "/"
      )
    ) {

      image =
        `/templates/${image}`;

    }


    const newTemplate:
      Template = {

      id:
        Date.now(),

      name,

      labelFormat:
        newTemplateFormat,

      backgroundImage:
        image ||
        undefined,

      elements: []

    };


    addTemplate(
      newTemplate
    );


    const updated =
      getTemplates();


    setTemplates(
      updated
    );


    setSelectedTemplateId(
      newTemplate.id
    );


    setCurrentTemplate(
      newTemplate.id
    );


    setElements([]);


    setSelected(
      null
    );


    setNewTemplateOpen(
      false
    );
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


        if (
          existing
        ) {

          updateTemplate({

            ...existing,

            labelFormat:
              "FORMATO_1",

            backgroundImage:
              rollTemplate.image

          });

        } else {

          const newTemplate:
            Template = {

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


    setTemplates(
      updated
    );


    const amnon =
      updated.find(
        template =>
          template.name
            .trim()
            .toUpperCase() ===
          "AMNON"
      );


    if (
      amnon
    ) {

      setSelectedTemplateId(
        amnon.id
      );


      setCurrentTemplate(
        amnon.id
      );


      setSelected(
        null
      );


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
   * AÑADIR TEXTO LIBRE
   * ==================================================
   */

  function triggerText() {

    setAddText(
      true
    );


    window.setTimeout(
      () => {

        setAddText(
          false
        );

      },
      100
    );
  }


  /*
   * ==================================================
   * INSERTAR CAMPO
   * ==================================================
   */

  function triggerField(
    field: string
  ) {

    setInsertField(
      ""
    );


    window.setTimeout(
      () => {

        setInsertField(
          field
        );


        window.setTimeout(
          () => {

            setInsertField(
              ""
            );

          },
          100
        );

      },
      0
    );
  }


  /*
   * ==================================================
   * DUPLICAR
   * ==================================================
   */

  function duplicateSelected() {

    if (
      selected ===
      null
    ) {
      return;
    }


    const element =
      elements.find(
        item =>
          item.id ===
          selected
      );


    if (
      !element
    ) {
      return;
    }


    const copy = {

      ...element,

      id:
        Date.now(),

      x:
        element.x +
        5,

      y:
        element.y +
        5

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

    if (
      selected ===
      null
    ) {
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


    setSelected(
      null
    );
  }


  /*
   * ==================================================
   * DATOS DE PRUEBA
   * ==================================================
   */

  function updateLabel(
    field:
      keyof typeof labelData,
    value:
      string
  ) {

    setLabelData(
      prev => ({

        ...prev,

        [field]:
          value

      })
    );
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
          GESTIÓN
         ================================================== */}

      <Card
        sx={{
          mb: 3
        }}
      >

        <CardContent>

          <Stack
            spacing={
              2
            }
          >

            <Typography
              variant="h6"
              fontWeight="bold"
            >
              Plantilla
            </Typography>


            <Stack
              direction={{
                xs:
                  "column",

                md:
                  "row"
              }}
              spacing={
                2
              }
              flexWrap="wrap"
              useFlexGap
            >

              <TextField
                select
                label="Seleccionar plantilla"
                value={
                  selectedTemplateId
                }
                onChange={(
                  event
                ) => {

                  const value =
                    Number(
                      event.target.value
                    );


                  handleSelectTemplate(
                    value
                  );

                }}
                sx={{
                  minWidth:
                    280
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


              {isAmnon && (

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={
                    <AutoFixHighIcon />
                  }
                  onClick={
                    applyAmnonLayout
                  }
                >
                  Aplicar diseño AMNON
                </Button>

              )}


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


            <Stack
              direction={{
                xs:
                  "column",

                md:
                  "row"
              }}
              spacing={
                2
              }
              alignItems={{
                xs:
                  "stretch",

                md:
                  "center"
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


            {selectedTemplate && (

              <Typography
                variant="body2"
                color="text.secondary"
              >

                Formato:{" "}

                <strong>
                  {
                    selectedTemplate.labelFormat
                  }
                </strong>

                {" · "}

                Fondo:{" "}

                <strong>
                  {
                    selectedTemplate.backgroundImage ||
                    "Sin fondo"
                  }
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
              spacing={
                2
              }
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "ORDER",
                      event.target.value
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "SKU",
                      event.target.value
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
                  label="Descripción inferior"
                  value={
                    labelData.DESCRIPTION
                  }
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "DESCRIPTION",
                      event.target.value
                    )
                  }
                  fullWidth
                />

              </Grid>


              <Grid
                size={{
                  xs: 12
                }}
              >

                <TextField
                  label="Texto superior (180°)"
                  value={
                    labelData.UPPER_TEXT
                  }
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "UPPER_TEXT",
                      event.target.value
                    )
                  }
                  multiline
                  minRows={
                    5
                  }
                  fullWidth
                  helperText="Dato de prueba. En Producción se genera automáticamente según la plantilla y las características del SKU."
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "BARCODE",
                      event.target.value
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "QR",
                      event.target.value
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "DATE",
                      event.target.value
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "LOT",
                      event.target.value
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "COIL",
                      event.target.value
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
                  onChange={(
                    event
                  ) =>
                    updateLabel(
                      "ROLLS",
                      event.target.value
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
          DISEÑADOR
         ================================================== */}

      {selectedTemplate && (

        <>

          <Card
            sx={{
              mb: 2
            }}
          >

            <CardContent>

              <Stack
                spacing={
                  1
                }
              >

                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  Diseñador
                </Typography>


                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Los elementos dinámicos se colocan sobre la imagen base de la etiqueta.
                </Typography>


                <DesignerToolbar

                  onSave={
                    saveCurrentTemplate
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

                  onUpperText={() =>
                    triggerField(
                      "UPPER_TEXT"
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
                      current =>
                        Math.min(
                          200,
                          current +
                          10
                        )
                    )
                  }

                  onZoomOut={() =>
                    setZoom(
                      current =>
                        Math.max(
                          50,
                          current -
                          10
                        )
                    )
                  }

                  canDelete={
                    selected !==
                    null
                  }

                />


                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Zoom: {zoom}%
                </Typography>

              </Stack>

            </CardContent>

          </Card>


          <Grid
            container
            spacing={
              2
            }
          >

            <Grid
              size={{
                xs: 12,
                lg: 8
              }}
            >

              <Card>

                <CardContent>

                  <Box
                    sx={{
                      overflow:
                        "auto",

                      backgroundColor:
                        "#eeeeee",

                      p:
                        2
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
                        selectedTemplate.backgroundImage
                      }

                      labelFormat={
                        selectedTemplate.labelFormat
                      }
                    />

                  </Box>

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

        </>

      )}


      {/* ==================================================
          NUEVA PLANTILLA
         ================================================== */}

      <Dialog
        open={
          newTemplateOpen
        }
        onClose={() =>
          setNewTemplateOpen(
            false
          )
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Nueva plantilla
        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={
              2
            }
            sx={{
              mt: 1
            }}
          >

            <TextField
              label="Nombre de la plantilla"
              value={
                newTemplateName
              }
              onChange={(
                event
              ) =>
                setNewTemplateName(
                  event.target.value
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
              onChange={(
                event
              ) =>
                setNewTemplateFormat(
                  event.target.value as
                    LabelFormat
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
              onChange={(
                event
              ) =>
                setNewTemplateImage(
                  event.target.value
                )
              }
              placeholder="ejemplo-formato1.png"
              helperText="La imagen debe estar guardada en public/templates."
              fullWidth
            />

          </Stack>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setNewTemplateOpen(
                false
              )
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