import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
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


/*
 * ==================================================
 * FORMATEAR NÚMERO
 * ==================================================
 */

function formatNumber(
  value: number
): string {

  const numeric =
    Number(
      value ?? 0
    );


  if (
    !Number.isFinite(
      numeric
    )
  ) {

    return "0";

  }


  return new Intl.NumberFormat(
    "es-ES",
    {
      maximumFractionDigits:
        2
    }
  ).format(
    numeric
  );

}


/*
 * ==================================================
 * FORMATEAR CANTIDAD
 * ==================================================
 */

function formatQuantity(
  value: number,
  unit: "M" | "UN"
): string {

  return unit ===
    "UN"

    ? `${formatNumber(
        value
      )} un`

    : `${formatNumber(
        value
      )} m`;

}


/*
 * ==================================================
 * COMPONENTE
 * ==================================================
 */

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
   * CAMPOS
   * ==================================================
   */

  const [
    customer,
    setCustomer
  ] = useState(
    ""
  );


  const [
    salesOrder,
    setSalesOrder
  ] = useState(
    ""
  );


  const [
    marking,
    setMarking
  ] = useState(
    ""
  );


  const [
    quantity,
    setQuantity
  ] = useState<number>(
    0
  );


  const [
    quantityUnit,
    setQuantityUnit
  ] = useState<
    "M" |
    "UN"
  >(
    "M"
  );


  const [
    rolls,
    setRolls
  ] = useState(
    1
  );


  const [
    printed,
    setPrinted
  ] = useState(
    0
  );


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
   * VALORES CALCULADOS
   * ==================================================
   */

  const totalRolls =
    Math.max(
      1,
      Number(
        rolls
      ) || 1
    );


  const safeQuantity =
    Math.max(
      0,
      Number(
        quantity
      ) || 0
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
        ) || 0
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
   * Total inicial de la OF.
   */

  const totalQuantity =
    totalRolls *
    safeQuantity;


  /*
   * Cantidad pendiente.
   */

  const pendingQuantity =
    pending *
    safeQuantity;


  const rollsError =
    totalRolls <
    Number(
      printed
    );


  /*
   * ==================================================
   * CARGAR ORDEN
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


      setCustomer(
        String(
          order.customer ??
          ""
        )
      );


      setSalesOrder(
        String(
          order.salesOrder ??
          ""
        )
      );


      setMarking(
        initialMarking
      );


      setQuantity(
        Number(
          order.quantity ??
          0
        )
      );


      setQuantityUnit(
        order.quantityUnit ===
          "UN"

          ? "UN"

          : "M"
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
   * ACTUALIZAR COIL EN PREVIEW
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


      if (
        currentPrinted >=
        totalRolls
      ) {

        return;

      }


      const coil =
        Number(
          order.firstCoil
        ) +
        currentPrinted;


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


    let upperText =
      "";


    let bottomDescription =
      "";


    let coilDescription =
      "";


    let coilTechnical =
      "";


    let coilLegal =
      "";


    let coilOrigin =
      "";


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
        Math.floor(
          Number(
            rolls
          ) || 1
        )
      );


    const finalQuantity =
      Number(
        quantity
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

      alert(
        `El total no puede ser menor que las ${currentPrinted} etiquetas ya impresas.`
      );


      return;

    }


    if (
      !Number.isFinite(
        finalQuantity
      ) ||
      finalQuantity <=
        0
    ) {

      alert(
        "Debes indicar los metros o unidades que contiene cada rollo / bobina."
      );


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

      customer:
        customer.trim(),

      salesOrder:
        salesOrder.trim(),

      marking:
        marking.trim(),

      quantity:
        finalQuantity,

      quantityUnit,

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
          ? "xl"
          : "lg"
      }
      PaperProps={{
        sx: {
          width:
            showPreview
              ? "96vw"
              : "1100px",

          maxWidth:
            showPreview
              ? "96vw"
              : "1100px",

          maxHeight:
            "94vh"
        }
      }}
    >

      <DialogTitle
        sx={{
          py:
            1.5,

          px:
            2.5,

          fontWeight:
            800
        }}
      >
        Gestionar producción
      </DialogTitle>


      <DialogContent
        dividers
        sx={{
          px:
            2.5,

          py:
            2,

          overflowY:
            showPreview
              ? "auto"
              : "visible"
        }}
      >

        <Grid
          container
          spacing={2}
        >

          {/* ==================================================
              COLUMNA IZQUIERDA
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                6
            }}
          >

            <Stack
              spacing={1.5}
            >

              {/* DATOS ORDEN */}

              <Paper
                variant="outlined"
                sx={{
                  p:
                    1.7
                }}
              >

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{
                    mb:
                      1
                  }}
                >
                  Datos de la orden
                </Typography>


                <Grid
                  container
                  spacing={1}
                >

                  <Grid
                    size={{
                      xs:
                        12,
                      sm:
                        6
                    }}
                  >

                    <Typography
                      variant="body2"
                    >
                      <strong>
                        Orden de fabricación:
                      </strong>
                      {" "}
                      {order.order}
                    </Typography>

                  </Grid>


                  <Grid
                    size={{
                      xs:
                        12,
                      sm:
                        6
                    }}
                  >

                    <Typography
                      variant="body2"
                    >
                      <strong>
                        SKU:
                      </strong>
                      {" "}
                      {order.sku}
                    </Typography>

                  </Grid>


                  <Grid
                    size={{
                      xs:
                        12
                    }}
                  >

                    <Typography
                      variant="body2"
                    >
                      <strong>
                        Producto:
                      </strong>
                      {" "}
                      {order.product}
                    </Typography>

                  </Grid>


                  <Grid
                    size={{
                      xs:
                        12,
                      sm:
                        6
                    }}
                  >

                    <Typography
                      variant="body2"
                    >
                      <strong>
                        Impresora:
                      </strong>
                      {" "}
                      {
                        order.printer ||
                        "-"
                      }
                    </Typography>

                  </Grid>


                  <Grid
                    size={{
                      xs:
                        12,
                      sm:
                        6
                    }}
                  >

                    <Typography
                      variant="body2"
                    >
                      <strong>
                        Siguiente Coil:
                      </strong>
                      {" "}
                      {
                        pending >
                          0

                          ? nextCoil

                          : "-"
                      }
                    </Typography>

                  </Grid>

                </Grid>

              </Paper>


              {/* CLIENTE */}

              <TextField
                label="Cliente"
                value={
                  customer
                }
                onChange={
                  event =>
                    setCustomer(
                      event.target.value
                    )
                }
                size="small"
                placeholder="Ej.: MPA"
                fullWidth
              />


              {/* PEDIDO + MARCAJE */}

              <Grid
                container
                spacing={1.5}
              >

                <Grid
                  size={{
                    xs:
                      12,
                    sm:
                      6
                  }}
                >

                  <TextField
                    label="Pedido de venta"
                    value={
                      salesOrder
                    }
                    onChange={
                      event =>
                        setSalesOrder(
                          event.target.value
                        )
                    }
                    size="small"
                    fullWidth
                  />

                </Grid>


                <Grid
                  size={{
                    xs:
                      12,
                    sm:
                      6
                  }}
                >

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
                    size="small"
                    fullWidth
                  />

                </Grid>

              </Grid>


              <Divider />


              <Typography
                variant="subtitle2"
                fontWeight={800}
              >
                Cantidad de fabricación
              </Typography>


              {/* METROS POR ROLLO + UNIDAD */}

              <Grid
                container
                spacing={1.5}
              >

                <Grid
                  size={{
                    xs:
                      12,
                    sm:
                      8
                  }}
                >

                  <TextField
                    label={
                      quantityUnit ===
                        "UN"

                        ? "Unidades por rollo / bobina"

                        : "Metros por rollo / bobina"
                    }
                    type="number"
                    value={
                      quantity
                    }
                    onChange={
                      event =>
                        setQuantity(
                          Number(
                            event.target.value
                          )
                        )
                    }
                    size="small"
                    slotProps={{
                      htmlInput: {
                        min:
                          0,

                        step:
                          1
                      }
                    }}
                    fullWidth
                  />

                </Grid>


                <Grid
                  size={{
                    xs:
                      12,
                    sm:
                      4
                  }}
                >

                  <TextField
                    select
                    label="Unidad"
                    value={
                      quantityUnit
                    }
                    onChange={
                      event =>
                        setQuantityUnit(
                          event.target.value ===
                            "UN"

                            ? "UN"

                            : "M"
                        )
                    }
                    size="small"
                    fullWidth
                  >

                    <MenuItem
                      value="M"
                    >
                      Metros
                    </MenuItem>


                    <MenuItem
                      value="UN"
                    >
                      Unidades
                    </MenuItem>

                  </TextField>

                </Grid>

              </Grid>


              {/* TOTAL ROLLOS */}

              <TextField
                label="Total de rollos / bobinas"
                type="number"
                value={
                  rolls
                }
                onChange={
                  event =>
                    setRolls(
                      Math.max(
                        1,
                        Number(
                          event.target.value
                        )
                      )
                    )
                }
                size="small"
                error={
                  rollsError
                }
                helperText={
                  rollsError
                    ? `No puede ser menor que las ${printed} etiquetas ya impresas.`
                    : ""
                }
                slotProps={{
                  htmlInput: {
                    min:
                      1,

                    step:
                      1
                  }
                }}
                fullWidth
              />


              {/* TOTALES */}

              <Paper
                variant="outlined"
                sx={{
                  p:
                    1.5,

                  backgroundColor:
                    "#F1F8F3",

                  borderColor:
                    "#A5D6A7"
                }}
              >

                <Grid
                  container
                  spacing={1}
                >

                  <Grid
                    size={{
                      xs:
                        6
                    }}
                  >

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Total inicial
                    </Typography>


                    <Typography
                      fontWeight={900}
                      color="#0B7A3B"
                    >
                      {
                        formatQuantity(
                          totalQuantity,
                          quantityUnit
                        )
                      }
                    </Typography>

                  </Grid>


                  <Grid
                    size={{
                      xs:
                        6
                    }}
                  >

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Pendiente
                    </Typography>


                    <Typography
                      fontWeight={900}
                      color="#D32F2F"
                    >
                      {
                        formatQuantity(
                          pendingQuantity,
                          quantityUnit
                        )
                      }
                    </Typography>

                  </Grid>

                </Grid>

              </Paper>

            </Stack>

          </Grid>


          {/* ==================================================
              COLUMNA DERECHA
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                6
            }}
          >

            <Stack
              spacing={1.5}
            >

              <Typography
                variant="subtitle2"
                fontWeight={800}
              >
                Estado de producción
              </Typography>


              {/* IMPRESAS / PENDIENTES */}

              <Grid
                container
                spacing={1.5}
              >

                <Grid
                  size={{
                    xs:
                      6
                  }}
                >

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
                    size="small"
                    slotProps={{
                      htmlInput: {
                        min:
                          0,

                        max:
                          totalRolls
                      }
                    }}
                    fullWidth
                  />

                </Grid>


                <Grid
                  size={{
                    xs:
                      6
                  }}
                >

                  <TextField
                    label="Etiquetas pendientes"
                    value={
                      pending
                    }
                    size="small"
                    disabled
                    fullWidth
                  />

                </Grid>

              </Grid>


              {/* COIL + ESTADO */}

              <Grid
                container
                spacing={1.5}
              >

                <Grid
                  size={{
                    xs:
                      6
                  }}
                >

                  <TextField
                    label="Siguiente Coil Number"
                    value={
                      pending >
                        0

                        ? nextCoil

                        : "-"
                    }
                    size="small"
                    disabled
                    fullWidth
                  />

                </Grid>


                <Grid
                  size={{
                    xs:
                      6
                  }}
                >

                  <TextField
                    label="Estado"
                    value={
                      pending ===
                        0

                        ? "FINALIZADA"

                        : "ABIERTA"
                    }
                    size="small"
                    disabled
                    fullWidth
                  />

                </Grid>

              </Grid>


              {
                rollsError &&
                (

                  <Alert
                    severity="warning"
                    sx={{
                      py:
                        0.5
                    }}
                  >
                    El número total de rollos / bobinas no puede ser inferior a las etiquetas ya impresas.
                  </Alert>

                )
              }


              {/* COMENTARIOS */}

              <TextField
                label="Comentarios de planificación"
                value={
                  comments
                }
                onChange={
                  event =>
                    setComments(
                      event.target.value
                    )
                }
                placeholder="Ej.: Palets nuevos 20 bobinas"
                multiline
                minRows={2}
                maxRows={3}
                size="small"
                fullWidth
              />


              {/* CARGAR ETIQUETA */}

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
                    sx={{
                      minHeight:
                        42,

                      fontWeight:
                        800
                    }}
                  >
                    CARGAR ETIQUETA DE ESTA ORDEN
                  </Button>

                )
              }


              {/* VISTA PREVIA */}

              {
                showPreview &&
                (

                  <>

                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                    >
                      Vista previa de etiqueta
                    </Typography>


                    <Paper
                      variant="outlined"
                      sx={{
                        p:
                          1,

                        backgroundColor:
                          "#EEEEEE",

                        overflow:
                          "auto",

                        maxHeight:
                          430
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            "flex",

                          justifyContent:
                            "center",

                          alignItems:
                            "flex-start"
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

                              ? 55

                              : 58
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


                    <Grid
                      container
                      spacing={1}
                    >

                      <Grid
                        size={{
                          xs:
                            6
                        }}
                      >

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
                          CERRAR VISTA
                        </Button>

                      </Grid>


                      <Grid
                        size={{
                          xs:
                            6
                        }}
                      >

                        <Button
                          variant="contained"
                          color="success"
                          onClick={
                            nextLabel
                          }
                          disabled={
                            pending ===
                              0 ||
                            rollsError
                          }
                          fullWidth
                        >
                          MARCAR IMPRESA
                        </Button>

                      </Grid>

                    </Grid>

                  </>

                )
              }

            </Stack>

          </Grid>

        </Grid>

      </DialogContent>


      <DialogActions
        sx={{
          px:
            2.5,

          py:
            1.25
        }}
      >

        <Button
          onClick={
            restart
          }
          color="warning"
        >
          REINICIAR
        </Button>


        <Box
          sx={{
            flex:
              1
          }}
        />


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