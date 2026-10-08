import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  Divider,
  Paper,
  Box,
  Alert
} from "@mui/material";

import {
  useEffect,
  useState
} from "react";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  findTemplate
} from "../../services/TemplateStorage";

import {
  findProduct
} from "../../services/ProductStorage";

import {
  generateUpperText,
  generateBottomDescription,
  generateCoilDescription,
  generateCoilTechnicalText,
  generateCoilLegalText,
  generateCoilOriginText
} from "../../services/LabelTextGenerator";

import {
  useDesigner
} from "../designer/DesignerContext";

import Canvas from "../designer/Canvas";


interface Props {

  open: boolean;

  order: ProductionOrder | null;

  onClose: () => void;

  onSave: (
    order: ProductionOrder
  ) => void;

}


export default function ProductionManageDialog({

  open,

  order,

  onClose,

  onSave

}: Props) {

  const {

    setElements,

    setSelected,

    setLabelData

  } = useDesigner();


  /*
   * ==================================================
   * TOTAL ROLLOS / BOBINAS
   * ==================================================
   */

  const [
    rolls,
    setRolls
  ] = useState(
    1
  );


  /*
   * ==================================================
   * ETIQUETAS IMPRESAS
   * ==================================================
   */

  const [
    printed,
    setPrinted
  ] = useState(
    0
  );


  /*
   * ==================================================
   * MARCAJE
   * ==================================================
   */

  const [
    marking,
    setMarking
  ] = useState(
    ""
  );


  /*
   * ==================================================
   * COMENTARIOS
   * ==================================================
   */

  const [
    comments,
    setComments
  ] = useState(
    ""
  );


  /*
   * ==================================================
   * VISTA PREVIA
   * ==================================================
   */

  const [
    showPreview,
    setShowPreview
  ] = useState(
    false
  );


  const [
    labelFormat,
    setLabelFormat
  ] =
    useState<
      "FORMATO_1" |
      "FORMATO_2"
    >(
      "FORMATO_1"
    );


  const [
    backgroundImage,
    setBackgroundImage
  ] =
    useState<
      string |
      undefined
    >(
      undefined
    );


  /*
   * ==================================================
   * VALORES SEGUROS
   * ==================================================
   */

  const totalRolls =
    Math.max(
      1,
      Number(
        rolls
      ) || 1
    );


  const firstCoil =
    Number(
      order?.firstCoil ??
      1
    );


  const safePrinted =
    Math.min(
      totalRolls,
      Math.max(
        0,
        Number(
          printed
        )
      )
    );


  const pending =
    Math.max(
      0,
      totalRolls -
      safePrinted
    );


  const nextCoil =
    firstCoil +
    safePrinted;


  /*
   * ==================================================
   * VALIDACIÓN TOTAL
   * ==================================================
   */

  const rollsError =
    totalRolls <
    Number(
      printed
    );


  /*
   * ==================================================
   * ABRIR ORDEN
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !order
      ) {

        return;

      }


      const product =
        findProduct(
          String(
            order.sku
          )
        );


      /*
       * Prioridad:
       *
       * 1. Marcaje ya guardado en la orden.
       * 2. Marcaje actual del producto.
       * 3. Vacío.
       */

      const initialMarking =
        String(
          order.marking ??
          ""
        ).trim()
        ||
        String(
          product?.marking ??
          ""
        ).trim();


      setMarking(
        initialMarking
      );


      setRolls(
        Math.max(
          1,
          Number(
            order.rolls ??
            1
          )
        )
      );


      setPrinted(
        Number(
          order.printed ??
          0
        )
      );


      setComments(
        String(
          order.comments ??
          ""
        )
      );


      setShowPreview(
        false
      );


      setBackgroundImage(
        undefined
      );

    },
    [
      order,
      open
    ]
  );


  /*
   * ==================================================
   * ACTUALIZAR COIL EN VISTA PREVIA
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !order ||
        !showPreview
      ) {

        return;

      }


      const currentPrinted =
        Math.min(
          totalRolls,
          Math.max(
            0,
            Number(
              printed
            )
          )
        );


      const coil =
        Number(
          order.firstCoil
        ) +
        currentPrinted;


      if (
        currentPrinted >=
        totalRolls
      ) {

        return;

      }


      if (
        coil >
        9999
      ) {

        return;

      }


      setLabelData(
        prev => ({

          ...prev,

          COIL:
            String(
              coil
            )

        })
      );

    },
    [
      printed,
      totalRolls,
      order,
      showPreview,
      setLabelData
    ]
  );


  /*
   * ==================================================
   * SIN ORDEN
   * ==================================================
   */

  if (
    !order
  ) {

    return null;

  }


  /*
   * ==================================================
   * CARGAR ETIQUETA
   * ==================================================
   */

  function loadLabel() {

    if (
      rollsError
    ) {

      return;

    }


    /*
     * PLANTILLA
     */

    const template =
      findTemplate(
        Number(
          order.templateId
        )
      );


    if (
      !template
    ) {

      alert(
        "No se ha encontrado la plantilla asignada a esta orden."
      );


      return;

    }


    /*
     * PRODUCTO
     */

    const product =
      findProduct(
        String(
          order.sku
        )
      );


    if (
      !product
    ) {

      alert(
        `No se ha encontrado el SKU ${order.sku} en Productos.\n\nDebes crear el producto antes de cargar la etiqueta.`
      );


      return;

    }


    /*
     * FORMATO 1
     */

    let upperText =
      "";


    let bottomDescription =
      "";


    /*
     * FORMATO 2
     */

    let coilDescription =
      "";


    let coilTechnical =
      "";


    let coilLegal =
      "";


    let coilOrigin =
      "";


    /*
     * GENERAR DATOS
     */

    if (
      template.labelFormat ===
      "FORMATO_2"
    ) {

      coilDescription =
        generateCoilDescription(
          product
        );


      coilTechnical =
        generateCoilTechnicalText(
          product,
          template
        );


      coilLegal =
        generateCoilLegalText();


      coilOrigin =
        generateCoilOriginText();

    }
    else {

      upperText =
        generateUpperText(
          product,
          template
        );


      bottomDescription =
        generateBottomDescription(
          product,
          template
        );

    }


    /*
     * CARGAR DISEÑO
     */

    setElements(
      template.elements.map(
        element => ({

          ...element

        })
      )
    );


    setSelected(
      null
    );


    setLabelFormat(
      template.labelFormat ??
      "FORMATO_1"
    );


    setBackgroundImage(
      template.backgroundImage
    );


    /*
     * DATOS DE ETIQUETA
     */

    setLabelData(
      prev => ({

        ...prev,

        ORDER:
          String(
            order.order
          ),

        LOT:
          String(
            order.lot ??
            ""
          ),

        COIL:
          String(
            nextCoil
          ),

        SKU:
          String(
            order.sku
          ),

        DESCRIPTION:
          bottomDescription,

        UPPER_TEXT:
          upperText,

        COIL_DESCRIPTION:
          coilDescription,

        COIL_TECHNICAL:
          coilTechnical,

        COIL_LEGAL:
          coilLegal,

        COIL_ORIGIN:
          coilOrigin,

        BARCODE:
          String(
            order.sku
          ),

        QR:
          String(
            order.sku
          ),

        ROLLS:
          String(
            totalRolls
          )

      })
    );


    setShowPreview(
      true
    );

  }


  /*
   * ==================================================
   * GUARDAR
   * ==================================================
   */

  function save() {

    const finalRolls =
      Math.max(
        1,
        Number(
          rolls
        ) || 1
      );


    const currentPrinted =
      Math.max(
        0,
        Number(
          printed
        ) || 0
      );


    if (
      finalRolls <
      currentPrinted
    ) {

      return;

    }


    const newPrinted =
      Math.min(
        finalRolls,
        currentPrinted
      );


    const newStatus:
      "ABIERTA" |
      "FINALIZADA" =

      newPrinted >=
      finalRolls

        ? "FINALIZADA"

        : "ABIERTA";


    onSave({

      ...order,

      /*
       * Marcaje guardado en la orden.
       */

      marking:
        marking.trim(),

      rolls:
        finalRolls,

      comments:
        comments.trim(),

      printed:
        newPrinted,

      status:
        newStatus,

      planningPosition:
        order.status ===
          "FINALIZADA" &&
        newStatus ===
          "ABIERTA"

          ? 0

          : order.planningPosition

    });


    onClose();

  }


  /*
   * ==================================================
   * REINICIAR
   * ==================================================
   */

  function restart() {

    setPrinted(
      0
    );


    setLabelData(
      prev => ({

        ...prev,

        ORDER:
          String(
            order.order
          ),

        LOT:
          String(
            order.lot ??
            ""
          ),

        COIL:
          String(
            firstCoil
          )

      })
    );

  }


  /*
   * ==================================================
   * SIGUIENTE ETIQUETA
   * ==================================================
   */

  function nextLabel() {

    if (
      rollsError
    ) {

      return;

    }


    if (
      safePrinted >=
      totalRolls
    ) {

      alert(
        "La orden ya está finalizada."
      );


      return;

    }


    const currentCoil =
      firstCoil +
      safePrinted;


    if (
      currentCoil >
      9999
    ) {

      alert(
        "Se ha superado el Coil Number máximo: 9999."
      );


      return;

    }


    const newPrinted =
      safePrinted +
      1;


    setPrinted(
      newPrinted
    );


    if (
      newPrinted <
      totalRolls
    ) {

      const newCoil =
        firstCoil +
        newPrinted;


      if (
        newCoil <=
        9999
      ) {

        setLabelData(
          prev => ({

            ...prev,

            COIL:
              String(
                newCoil
              )

          })
        );

      }

    }

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Dialog
      open={
        open
      }
      onClose={
        onClose
      }
      fullWidth
      maxWidth={
        showPreview

          ? "lg"

          : "sm"
      }
    >

      <DialogTitle>
        Gestionar producción
      </DialogTitle>


      <DialogContent>

        <Stack
          spacing={2}
        >

          {/* ==========================================
              DATOS DE LA ETIQUETA
              ========================================== */}

          <Paper
            variant="outlined"
            sx={{
              p: 2
            }}
          >

            <Stack
              spacing={1.5}
            >

              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Datos de la etiqueta
              </Typography>


              <Typography>

                <strong>
                  Production Order:
                </strong>{" "}

                {order.order}

              </Typography>


              <Typography>

                <strong>
                  Lot Number:
                </strong>{" "}

                {
                  order.lot ||
                  "-"
                }

              </Typography>


              <Typography>

                <strong>
                  Coil Number:
                </strong>{" "}

                {
                  pending >
                    0

                    ? nextCoil

                    : "-"
                }

              </Typography>


              <Divider />


              <Typography
                variant="body2"
              >

                <strong>
                  SKU:
                </strong>{" "}

                {order.sku}

              </Typography>


              <Typography
                variant="body2"
              >

                <strong>
                  Producto:
                </strong>{" "}

                {order.product}

              </Typography>


              <Typography
                variant="body2"
              >

                <strong>
                  Impresora:
                </strong>{" "}

                {
                  order.printer ||
                  "-"
                }

              </Typography>

            </Stack>

          </Paper>


          {/* ==========================================
              MARCAJE
              ========================================== */}

          <TextField
            label="Marcaje"
            value={
              marking
            }
            onChange={
              event =>
                setMarking(
                  event.target.value
                )
            }
            placeholder="Ej.: PC_16_115"
            helperText={
              marking.trim()

                ? "Marcaje que quedará guardado en esta orden."

                : "Si el producto tiene Marcaje configurado, se carga automáticamente al abrir la orden."
            }
            fullWidth
          />


          {/* ==========================================
              COMENTARIOS LEGACY DE ORDEN
              ========================================== */}

          <TextField
            label="Comentarios de planificación"
            value={
              comments
            }
            onChange={
              event => {

                setComments(
                  event.target.value
                );

              }
            }
            placeholder="Ej.: Palets nuevos 20 bobinas"
            multiline
            minRows={2}
            maxRows={4}
            fullWidth
            helperText="Este comentario pertenece a la orden. Los comentarios generales de la línea se gestionan desde Producción."
          />


          <Divider />


          {/* ==========================================
              PRODUCCIÓN
              ========================================== */}

          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            Producción
          </Typography>


          <TextField
            label="Total de rollos / bobinas"
            type="number"
            value={
              rolls
            }
            onChange={
              event => {

                const value =
                  Number(
                    event.target.value
                  );


                setRolls(
                  Math.max(
                    1,
                    value
                  )
                );

              }
            }
            inputProps={{
              min: 1,
              step: 1
            }}
            error={
              rollsError
            }
            helperText={
              rollsError

                ? `El total no puede ser menor que las ${printed} etiquetas ya impresas.`

                : "Puedes modificar la cantidad total que se debe fabricar."
            }
            fullWidth
          />


          <TextField
            label="Etiquetas impresas"
            type="number"
            value={
              printed
            }
            onChange={
              event => {

                const value =
                  Number(
                    event.target.value
                  );


                setPrinted(
                  Math.min(
                    totalRolls,
                    Math.max(
                      0,
                      value
                    )
                  )
                );

              }
            }
            inputProps={{
              min: 0,
              max: totalRolls,
              step: 1
            }}
            fullWidth
          />


          {
            rollsError &&
            (

              <Alert
                severity="warning"
              >
                El número total de rollos / bobinas debe ser igual o superior al número de etiquetas ya impresas.
              </Alert>

            )
          }


          <TextField
            label="Etiquetas pendientes"
            value={
              pending
            }
            disabled
            fullWidth
          />


          <TextField
            label="Siguiente Coil Number"
            value={
              pending >
                0

                ? nextCoil

                : "-"
            }
            disabled
            fullWidth
          />


          {/* ==========================================
              RESUMEN
              ========================================== */}

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "#FAFAFA"
            }}
          >

            <Stack
              spacing={0.8}
            >

              <Typography
                variant="body2"
              >
                <strong>
                  Total:
                </strong>{" "}

                {totalRolls}
              </Typography>


              <Typography
                variant="body2"
              >
                <strong>
                  Impresas:
                </strong>{" "}

                {safePrinted}
              </Typography>


              <Typography
                variant="body2"
              >
                <strong>
                  Pendientes:
                </strong>{" "}

                {pending}
              </Typography>

            </Stack>

          </Paper>


          {/* ==========================================
              CARGAR ETIQUETA
              ========================================== */}

          {
            !showPreview &&
            (

              <Button
                variant="contained"
                onClick={
                  loadLabel
                }
                disabled={
                  rollsError
                }
                fullWidth
              >
                CARGAR ETIQUETA DE ESTA ORDEN
              </Button>

            )
          }


          {/* ==========================================
              VISTA PREVIA
              ========================================== */}

          {
            showPreview &&
            (

              <>

                <Divider />


                <Typography
                  variant="h6"
                  fontWeight="bold"
                >
                  Vista previa de etiqueta
                </Typography>


                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,

                    backgroundColor: "#EEEEEE",

                    overflow: "auto"
                  }}
                >

                  <Box
                    sx={{
                      display: "flex",

                      justifyContent: "center",

                      alignItems: "flex-start",

                      minHeight:
                        labelFormat ===
                          "FORMATO_2"

                          ? "320px"

                          : "400px"
                    }}
                  >

                    <Canvas
                      addText={
                        false
                      }
                      insertField=""
                      zoom={
                        labelFormat ===
                          "FORMATO_2"

                          ? 65

                          : 70
                      }
                      backgroundImage={
                        backgroundImage
                      }
                      labelFormat={
                        labelFormat
                      }
                    />

                  </Box>

                </Paper>


                <Button
                  variant="outlined"
                  onClick={
                    () =>
                      setShowPreview(
                        false
                      )
                  }
                  fullWidth
                >
                  CERRAR VISTA PREVIA
                </Button>


                <Button
                  variant="contained"
                  color="success"
                  onClick={
                    nextLabel
                  }
                  disabled={
                    safePrinted >=
                      totalRolls
                  }
                  fullWidth
                >
                  SIGUIENTE ETIQUETA
                </Button>


                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                >
                  Cada etiqueta impresa aumenta automáticamente el Coil Number:
                  1, 2, 3... hasta 9999.
                </Typography>

              </>

            )
          }

        </Stack>

      </DialogContent>


      <DialogActions>

        <Button
          onClick={
            restart
          }
          color="warning"
        >
          REINICIAR
        </Button>


        <Button
          onClick={
            onClose
          }
        >
          CANCELAR
        </Button>


        <Button
          variant="contained"
          onClick={
            save
          }
          disabled={
            rollsError
          }
        >
          GUARDAR
        </Button>

      </DialogActions>

    </Dialog>

  );

}