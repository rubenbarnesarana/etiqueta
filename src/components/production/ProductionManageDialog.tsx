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
  Box
} from "@mui/material";

import {
  useEffect,
  useState
} from "react";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  updateOrder
} from "../../services/OrderStorage";

import {
  findTemplate
} from "../../services/TemplateStorage";

import {
  findProduct
} from "../../services/ProductStorage";

import {
  generateUpperText,
  generateBottomDescription
} from "../../services/LabelTextGenerator";

import {
  useDesigner
} from "../designer/DesignerContext";

import Canvas from "../designer/Canvas";


interface Props {
  open: boolean;
  order: ProductionOrder | null;
  onClose: () => void;
  onSaved?: () => void;
}


export default function ProductionManageDialog({
  open,
  order,
  onClose,
  onSaved
}: Props) {

  const {
    setElements,
    setSelected,
    setLabelData
  } = useDesigner();


  const [
    printed,
    setPrinted
  ] = useState(0);


  const [
    showPreview,
    setShowPreview
  ] = useState(false);


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
   * VALORES DE LA ORDEN
   * ==================================================
   */

  const totalRolls =
    Number(
      order?.rolls ??
      0
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
   * ABRIR ORDEN
   * ==================================================
   */

  useEffect(() => {

    if (!order) {
      return;
    }


    setPrinted(
      Number(
        order.printed ??
        0
      )
    );


    setShowPreview(
      false
    );


    setBackgroundImage(
      undefined
    );

  }, [
    order,
    open
  ]);


  /*
   * ==================================================
   * ACTUALIZAR COIL EN LA ETIQUETA
   * ==================================================
   */

  useEffect(() => {

    if (
      !order ||
      !showPreview
    ) {
      return;
    }


    const currentPrinted =
      Math.min(
        Number(
          order.rolls
        ),
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


    /*
     * Si ya se ha terminado la orden,
     * no mostramos un Coil inexistente.
     */

    if (
      currentPrinted >=
      Number(
        order.rolls
      )
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

  }, [
    printed,
    order,
    showPreview,
    setLabelData
  ]);


  /*
   * ==================================================
   * SIN ORDEN
   * ==================================================
   */

  if (!order) {
    return null;
  }


  /*
   * ==================================================
   * CARGAR ETIQUETA
   * ==================================================
   */

  function loadLabel() {

    /*
     * PLANTILLA
     */

    const template =
      findTemplate(
        Number(
          order.templateId
        )
      );


    if (!template) {

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


    if (!product) {

      alert(
        `No se ha encontrado el SKU ${order.sku} en Productos.\n\nDebes crear el producto antes de cargar la etiqueta.`
      );

      return;
    }


    /*
     * ==================================================
     * TEXTO SUPERIOR AUTOMÁTICO
     * ==================================================
     */

    const upperText =
      generateUpperText(
        product,
        template
      );


    /*
     * ==================================================
     * DESCRIPCIÓN INFERIOR AUTOMÁTICA
     * ==================================================
     *
     * Ejemplo:
     *
     * Producto:
     * AMNON PC AS 16/40/2.2/0.75 R-500M
     *
     * Etiqueta:
     * AS 16/40/2.2/0.75 R-500M
     */

    const bottomDescription =
      generateBottomDescription(
        product,
        template
      );


    /*
     * ==================================================
     * CARGAR DISEÑO
     * ==================================================
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
     * ==================================================
     * DATOS DE LA ETIQUETA
     * ==================================================
     */

    setLabelData(
      prev => ({

        ...prev,


        /*
         * PRODUCTION ORDER
         */

        ORDER:
          String(
            order.order
          ),


        /*
         * LOT NUMBER
         */

        LOT:
          String(
            order.lot ??
            ""
          ),


        /*
         * COIL NUMBER
         */

        COIL:
          String(
            nextCoil
          ),


        /*
         * SKU
         */

        SKU:
          String(
            order.sku
          ),


        /*
         * DESCRIPCIÓN INFERIOR
         *
         * Ya no utilizamos directamente
         * product.description.
         */

        DESCRIPTION:
          bottomDescription,


        /*
         * TEXTO SUPERIOR
         */

        UPPER_TEXT:
          upperText,


        /*
         * CÓDIGO DE BARRAS
         *
         * El valor es siempre el SKU.
         */

        BARCODE:
          String(
            order.sku
          ),


        /*
         * QR
         */

        QR:
          String(
            order.sku
          ),


        /*
         * TOTAL ROLLOS
         */

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

    const newPrinted =
      Math.min(
        totalRolls,
        Math.max(
          0,
          Number(
            printed
          )
        )
      );


    const newStatus:
      "ABIERTA" |
      "FINALIZADA" =

      newPrinted >=
      totalRolls
        ? "FINALIZADA"
        : "ABIERTA";


    updateOrder({

      ...order,

      printed:
        newPrinted,

      status:
        newStatus

    });


    onSaved?.();

    onClose();
  }


  /*
   * ==================================================
   * REINICIAR
   * ==================================================
   */

  function restart() {

    updateOrder({

      ...order,

      printed:
        0,

      status:
        "ABIERTA"

    });


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


    onSaved?.();
  }


  /*
   * ==================================================
   * SIGUIENTE ETIQUETA
   * ==================================================
   */

  function nextLabel() {

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


    /*
     * Coil 9999 SÍ se puede imprimir.
     */

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


    const newStatus:
      "ABIERTA" |
      "FINALIZADA" =

      newPrinted >=
      totalRolls
        ? "FINALIZADA"
        : "ABIERTA";


    updateOrder({

      ...order,

      printed:
        newPrinted,

      status:
        newStatus

    });


    setPrinted(
      newPrinted
    );


    /*
     * PREPARAR SIGUIENTE COIL
     */

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


    onSaved?.();
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
          spacing={
            2
          }
        >

          {/* ==================================================
              DATOS ETIQUETA
             ================================================== */}

          <Paper
            variant="outlined"
            sx={{
              p: 2
            }}
          >

            <Stack
              spacing={
                1.5
              }
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


          {/* ==================================================
              PRODUCCIÓN
             ================================================== */}

          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            Producción
          </Typography>


          <TextField
            label="Total de rollos"
            value={
              totalRolls
            }
            disabled
            fullWidth
          />


          <TextField
            label="Rollos impresos"
            type="number"
            value={
              printed
            }
            onChange={(
              event
            ) => {

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

            }}
            inputProps={{
              min:
                0,

              max:
                totalRolls
            }}
            fullWidth
          />


          <TextField
            label="Rollos pendientes"
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


          <Divider />


          {/* ==================================================
              ESTADO
             ================================================== */}

          <Paper
            variant="outlined"
            sx={{
              p:
                2,

              textAlign:
                "center"
            }}
          >

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Estado
            </Typography>


            <Typography
              variant="h6"
              fontWeight="bold"
            >

              {
                pending ===
                0
                  ? "FINALIZADA"
                  : "ABIERTA"
              }

            </Typography>

          </Paper>


          {/* ==================================================
              CARGAR ETIQUETA
             ================================================== */}

          {!showPreview && (

            <Button
              variant="contained"
              onClick={
                loadLabel
              }
              fullWidth
            >
              CARGAR ETIQUETA DE ESTA ORDEN
            </Button>

          )}


          {/* ==================================================
              VISTA PREVIA
             ================================================== */}

          {showPreview && (

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
                  p:
                    2,

                  backgroundColor:
                    "#eeeeee",

                  overflow:
                    "auto"
                }}
              >

                <Box
                  sx={{
                    display:
                      "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "flex-start",

                    minHeight:
                      "400px"
                  }}
                >

                  <Canvas
                    addText={
                      false
                    }

                    insertField=""

                    zoom={
                      70
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


              {/* ==================================================
                  ETIQUETA ACTUAL
                 ================================================== */}

              <Paper
                variant="outlined"
                sx={{
                  p: 2
                }}
              >

                <Stack
                  spacing={
                    1
                  }
                >

                  <Typography
                    fontWeight="bold"
                  >
                    Etiqueta actual
                  </Typography>


                  <Typography>

                    Production Order:{" "}

                    <strong>
                      {order.order}
                    </strong>

                  </Typography>


                  <Typography>

                    Lot Number:{" "}

                    <strong>
                      {
                        order.lot ||
                        "-"
                      }
                    </strong>

                  </Typography>


                  <Typography>

                    Coil Number:{" "}

                    <strong>

                      {
                        pending >
                        0
                          ? nextCoil
                          : "-"
                      }

                    </strong>

                  </Typography>


                  <Typography>

                    SKU:{" "}

                    <strong>
                      {order.sku}
                    </strong>

                  </Typography>


                  <Typography>

                    Pendientes:{" "}

                    <strong>
                      {pending}
                    </strong>

                  </Typography>

                </Stack>

              </Paper>


              {/* ==================================================
                  SIMULACIÓN IMPRESIÓN
                 ================================================== */}

              <Button
                variant="contained"
                size="large"
                onClick={
                  nextLabel
                }
                disabled={
                  pending ===
                  0
                }
                fullWidth
              >
                MARCAR ETIQUETA COMO IMPRESA
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

          )}

        </Stack>

      </DialogContent>


      <DialogActions>

        <Button
          onClick={
            restart
          }
          color="warning"
        >
          Reiniciar
        </Button>


        <Button
          onClick={
            onClose
          }
        >
          Cancelar
        </Button>


        <Button
          variant="contained"
          onClick={
            save
          }
        >
          Guardar
        </Button>

      </DialogActions>

    </Dialog>

  );
}