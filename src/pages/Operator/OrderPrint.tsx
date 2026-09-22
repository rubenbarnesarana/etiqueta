import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";

import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";

import LabelPreview from "../../components/print/LabelPreview";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  findOrder
} from "../../services/OrderStorage";

import {
  printLabel
} from "../../services/PrintService";

import {
  registerPrint
} from "../../services/PrintHistoryService";

import {
  useAuth
} from "../../auth/AuthContext";

import type {
  DesignerElement
} from "../../components/designer/DesignerTypes";


export default function OrderPrint() {

  const navigate =
    useNavigate();


  const {
    user
  } = useAuth();


  const [
    searchParams
  ] = useSearchParams();


  const [
    order,
    setOrder
  ] =
    useState<
      ProductionOrder |
      null
    >(null);


  const [
    error,
    setError
  ] = useState("");


  const [
    previewOpen,
    setPreviewOpen
  ] = useState(false);


  const [
    finishedOpen,
    setFinishedOpen
  ] = useState(false);


  const [
    label,
    setLabel
  ] =
    useState<
      DesignerElement[]
    >([]);


  const [
    backgroundImage,
    setBackgroundImage
  ] =
    useState<
      string |
      undefined
    >();


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
    labelData,
    setLabelData
  ] =
    useState<any>();


  /*
   * Guardamos el total final antes
   * de limpiar/actualizar la orden.
   */

  const finalPrintedRef =
    useRef<number>(0);


  /*
   * ==================================================
   * VOLVER
   * ==================================================
   */

  function goBack() {

    navigate(-1);

  }


  /*
   * ==================================================
   * CARGAR ORDEN DESDE URL
   * ==================================================
   */

  useEffect(() => {

    const orderNumber =
      searchParams.get(
        "order"
      );


    if (
      !orderNumber
    ) {

      setError(
        "No se ha indicado ninguna orden de producción."
      );

      setOrder(
        null
      );

      return;

    }


    const productionOrder =
      findOrder(
        orderNumber
      );


    if (
      !productionOrder
    ) {

      setError(
        `La orden ${orderNumber} no existe.`
      );

      setOrder(
        null
      );

      return;

    }


    setOrder(
      productionOrder
    );


    finalPrintedRef.current =
      productionOrder.printed;


    setError("");

  }, [
    searchParams
  ]);


  /*
   * ==================================================
   * REGISTRAR IMPRESIÓN EN BASE DE DATOS
   * ==================================================
   */

  async function savePrintHistory(
    productionOrder: ProductionOrder,
    coilNumber: number
  ) {

    try {

      await registerPrint({

        username:
          user?.fullName ??
          "Usuario desconocido",

        productionOrder:
          productionOrder.order,

        sku:
          productionOrder.sku,

        description:
          productionOrder.product,

        lot:
          productionOrder.lot,

        coilNumber,

        quantity:
          1,

        printer:
          productionOrder.printer,

        templateId:
          productionOrder.templateId,

        printType:
          "PRINT",

        productionLine:
          productionOrder.productionLine

      });

    }
    catch (
      historyError
    ) {

      /*
       * Un fallo en el historial NO debe bloquear
       * ni modificar la impresión realizada.
       */

      console.error(
        "La etiqueta se imprimió, pero no se pudo registrar en el historial:",
        historyError
      );

    }

  }


  /*
   * ==================================================
   * IMPRIMIR
   * ==================================================
   */

  function printCurrentLabel() {

    if (
      !order
    ) {

      return;

    }


    /*
     * Bobina que corresponde a esta impresión.
     *
     * Se calcula ANTES de llamar a printLabel()
     * porque printLabel incrementará el contador.
     */

    const printedCoil =
      order.firstCoil +
      order.printed;


    const result =
      printLabel(
        order
      );


    if (
      !result.success
    ) {

      alert(
        result.message
      );

      return;

    }


    /*
     * ==================================================
     * HISTORIAL SUPABASE
     * ==================================================
     *
     * Solo llegamos aquí si printLabel()
     * ha confirmado success.
     */

    void savePrintHistory(
      order,
      printedCoil
    );


    /*
     * ELEMENTOS DE LA ETIQUETA
     */

    setLabel(
      result.label ??
      []
    );


    /*
     * IMAGEN DE FONDO
     */

    setBackgroundImage(
      result.backgroundImage
    );


    /*
     * FORMATO
     */

    setLabelFormat(
      result.labelFormat ??
      "FORMATO_1"
    );


    /*
     * DATOS
     */

    setLabelData(
      result.labelData
    );


    /*
     * RECARGAR ORDEN
     */

    const updated =
      findOrder(
        order.order
      );


    if (
      updated
    ) {

      setOrder(
        updated
      );


      finalPrintedRef.current =
        updated.printed;

    }


    /*
     * ABRIR PREVIEW
     */

    setPreviewOpen(
      true
    );


    /*
     * CERRAR PREVIEW AUTOMÁTICAMENTE
     */

    setTimeout(
      () => {

        setPreviewOpen(
          false
        );


        const latest =
          findOrder(
            order.order
          );


        if (
          latest
        ) {

          setOrder(
            latest
          );


          finalPrintedRef.current =
            latest.printed;

        }


        /*
         * SI ERA LA ÚLTIMA ETIQUETA
         */

        if (
          result.finished
        ) {

          setFinishedOpen(
            true
          );

        }

      },
      2000
    );

  }


  /*
   * ==================================================
   * REIMPRIMIR
   * ==================================================
   */

  function repeatLabel() {

    if (
      !order
    ) {

      return;

    }


    const coil =
      prompt(
        "¿Qué bobina desea reimprimir?"
      );


    if (
      !coil
    ) {

      return;

    }


    /*
     * Por ahora NO registramos REPRINT aquí.
     *
     * Actualmente este botón todavía no ejecuta
     * una impresión real. Solo muestra el aviso.
     *
     * Cuando conectemos la reimpresión real,
     * registraremos el evento REPRINT.
     */

    alert(
      "Reimpresión de la bobina " +
      coil
    );

  }


  /*
   * ==================================================
   * CONTADORES
   * ==================================================
   */

  const pending =
    order
      ? Math.max(
          0,
          order.rolls -
          order.printed
        )
      : 0;


  const finished =
    order?.status ===
      "FINALIZADA" ||
    pending === 0;


  const nextCoil =
    order &&
    pending > 0
      ? order.firstCoil +
        order.printed
      : null;


  /*
   * ==================================================
   * ERROR
   * ==================================================
   */

  if (
    error
  ) {

    return (

      <Box>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={
            goBack
          }
          sx={{
            mb: 3,
            fontWeight: 700
          }}
        >

          VOLVER

        </Button>


        <Alert
          severity="error"
        >

          {error}

        </Alert>

      </Box>

    );

  }


  /*
   * ==================================================
   * CARGANDO
   * ==================================================
   */

  if (
    !order
  ) {

    return (

      <Box>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={
            goBack
          }
          sx={{
            mb: 3,
            fontWeight: 700
          }}
        >

          VOLVER

        </Button>


        <Typography>

          Cargando orden...

        </Typography>

      </Box>

    );

  }


  /*
   * ==================================================
   * PANTALLA
   * ==================================================
   */

  return (

    <Box>

      {/* =============================================
          VOLVER
          ============================================= */}

      <Button
        variant="outlined"
        startIcon={
          <ArrowBackIcon />
        }
        onClick={
          goBack
        }
        sx={{
          mb: 3,
          fontWeight: 700
        }}
      >

        VOLVER

      </Button>


      {/* =============================================
          CABECERA
          ============================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
          flexWrap: "wrap"
        }}
      >

        <PrintIcon
          sx={{
            color: "#0B7A3B",
            fontSize: 46
          }}
        />


        <Box
          sx={{
            flexGrow: 1
          }}
        >

          <Typography
            variant="h4"
            fontWeight={700}
          >

            Imprimir Orden

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >

            Orden de producción {order.order}

          </Typography>

        </Box>


        {
          order.productionLine > 0
          &&
          (

            <Chip
              label={
                `Línea ${order.productionLine}`
              }
              color="success"
              variant="outlined"
              sx={{
                fontWeight: 700
              }}
            />

          )
        }


        {
          order.planningPosition > 0
          &&
          (

            <Chip
              label={
                `Posición ${order.planningPosition}`
              }
              variant="outlined"
              sx={{
                fontWeight: 700
              }}
            />

          )
        }

      </Box>


      {/* =============================================
          ORDEN
          ============================================= */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid #E0E0E0",

          borderRadius: 3,

          overflow: "hidden"
        }}
      >

        <Box
          sx={{
            height: 7,
            backgroundColor:
              "#0B7A3B"
          }}
        />


        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 4
            },

            "&:last-child": {
              pb: {
                xs: 3,
                md: 4
              }
            }
          }}
        >

          <Grid
            container
            spacing={3}
          >

            {/* DATOS */}

            <Grid
              size={{
                xs: 12,
                md: 8
              }}
            >

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  mb: 3,
                  color: "#0B7A3B"
                }}
              >

                Orden {order.order}

              </Typography>


              <Typography
                sx={{
                  mb: 1.5
                }}
              >

                <b>SKU:</b>{" "}
                {order.sku}

              </Typography>


              <Typography
                sx={{
                  mb: 1.5
                }}
              >

                <b>Producto:</b>{" "}
                {order.product}

              </Typography>


              <Typography
                sx={{
                  mb: 1.5
                }}
              >

                <b>Lote:</b>{" "}
                {order.lot}

              </Typography>


              <Typography
                sx={{
                  mb: 1.5
                }}
              >

                <b>Plantilla:</b>{" "}
                {order.templateId}

              </Typography>


              <Typography
                sx={{
                  mb: 1.5
                }}
              >

                <b>Impresora:</b>{" "}
                {order.printer}

              </Typography>


              <Box
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >

                <Typography>

                  <b>Estado:</b>

                </Typography>


                <Chip
                  size="small"
                  label={
                    order.status
                  }
                  color={
                    finished
                      ? "success"
                      : "warning"
                  }
                  sx={{
                    fontWeight: 700
                  }}
                />

              </Box>


              {
                order.productionLine > 0
                &&
                (

                  <Typography
                    sx={{
                      mb: 1.5
                    }}
                  >

                    <b>
                      Línea de producción:
                    </b>{" "}

                    {order.productionLine}

                  </Typography>

                )
              }


              {
                order.planningPosition > 0
                &&
                (

                  <Typography>

                    <b>
                      Posición en planificación:
                    </b>{" "}

                    {order.planningPosition}

                  </Typography>

                )
              }


              {/* BOTONES */}

              <Box
                display="flex"
                gap={2}
                mt={4}
                flexWrap="wrap"
              >

                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    <PrintIcon />
                  }
                  disabled={
                    finished
                  }
                  onClick={
                    printCurrentLabel
                  }
                  sx={{
                    minWidth: 190,
                    minHeight: 56,
                    fontWeight: 700,
                    backgroundColor:
                      "#0B7A3B",

                    "&:hover": {
                      backgroundColor:
                        "#086530"
                    }
                  }}
                >

                  IMPRIMIR

                </Button>


                <Button
                  variant="outlined"
                  size="large"
                  startIcon={
                    <ReplayIcon />
                  }
                  onClick={
                    repeatLabel
                  }
                  sx={{
                    minWidth: 210,
                    minHeight: 56,
                    fontWeight: 700
                  }}
                >

                  REPETIR ETIQUETA

                </Button>

              </Box>

            </Grid>


            {/* CONTADORES */}

            <Grid
              size={{
                xs: 12,
                md: 4
              }}
            >

              <Card
                elevation={0}
                sx={{
                  backgroundColor:
                    "#0B7A3B",

                  color:
                    "white",

                  textAlign:
                    "center",

                  p: 2.5,

                  borderRadius:
                    3
                }}
              >

                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    opacity: 0.9
                  }}
                >

                  TOTAL

                </Typography>


                <Typography
                  sx={{
                    fontSize: {
                      xs: 64,
                      md: 82
                    },

                    fontWeight:
                      700,

                    lineHeight:
                      1,

                    mt:
                      1
                  }}
                >

                  {order.rolls}

                </Typography>


                <Typography
                  sx={{
                    mt:
                      2,

                    fontSize:
                      20
                  }}
                >

                  Impresos:{" "}

                  <b>
                    {order.printed}
                  </b>

                </Typography>


                <Box
                  sx={{
                    mt: 2.5,
                    pt: 2,
                    borderTop:
                      "1px solid rgba(255,255,255,0.30)"
                  }}
                >

                  <Typography
                    sx={{
                      fontSize:
                        17
                    }}
                  >

                    Pendientes

                  </Typography>


                  <Typography
                    sx={{
                      fontSize: {
                        xs: 48,
                        md: 58
                      },

                      fontWeight:
                        700,

                      lineHeight:
                        1,

                      mt:
                        0.5,

                      color:
                        pending === 0
                          ? "#B7E27A"
                          : "#FF8A80"
                    }}
                  >

                    {pending}

                  </Typography>

                </Box>

              </Card>


              {/* PRÓXIMA BOBINA */}

              <Card
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2.5,
                  textAlign: "center",
                  borderRadius: 3,
                  border:
                    "2px solid #1976D2",
                  backgroundColor:
                    "#FFFFFF"
                }}
              >

                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#555"
                  }}
                >

                  Próxima bobina

                </Typography>


                {
                  nextCoil !== null
                    ? (

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: {
                            xs: 48,
                            md: 58
                          },
                          fontWeight: 700,
                          lineHeight: 1,
                          color: "#1976D2"
                        }}
                      >

                        {nextCoil}

                      </Typography>

                    )
                    : (

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#4CAF50"
                        }}
                      >

                        FINALIZADA

                      </Typography>

                    )
                }

              </Card>

            </Grid>

          </Grid>

        </CardContent>

      </Card>


      {/* =============================================
          VISTA PREVIA
          ============================================= */}

      <Dialog
        open={
          previewOpen
        }
        onClose={
          () =>
            setPreviewOpen(
              false
            )
        }
        maxWidth="lg"
      >

        <DialogTitle
          sx={{
            fontWeight: 700
          }}
        >

          Vista previa de etiqueta

        </DialogTitle>


        <DialogContent>

          <LabelPreview
            elements={
              label
            }
            backgroundImage={
              backgroundImage
            }
            labelFormat={
              labelFormat
            }
            labelData={
              labelData
            }
          />

        </DialogContent>

      </Dialog>


      {/* =============================================
          ORDEN FINALIZADA
          ============================================= */}

      <Dialog
        open={
          finishedOpen
        }
        onClose={
          () =>
            setFinishedOpen(
              false
            )
        }
      >

        <DialogTitle
          sx={{
            fontWeight: 700
          }}
        >

          ✅ Pedido finalizado

        </DialogTitle>


        <DialogContent>

          <Typography>

            Se ha impreso la última etiqueta de esta orden de producción.

          </Typography>


          <Typography
            mt={2}
            fontWeight="bold"
          >

            Total de bobinas impresas:{" "}

            {finalPrintedRef.current}

          </Typography>


          <Typography
            mt={2}
          >

            Ya no es posible imprimir más etiquetas para esta orden.

          </Typography>

        </DialogContent>


        <DialogActions>

          <Button
            variant="contained"
            onClick={
              () =>
                setFinishedOpen(
                  false
                )
            }
            sx={{
              backgroundColor:
                "#0B7A3B",

              "&:hover": {
                backgroundColor:
                  "#086530"
              }
            }}
          >

            Aceptar

          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}