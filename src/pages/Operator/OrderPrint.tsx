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

import type {
  DesignerElement
} from "../../components/designer/DesignerTypes";


export default function OrderPrint() {

  const navigate =
    useNavigate();


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


    if (!orderNumber) {

      setError(
        "No se ha indicado ninguna orden de producción."
      );

      setOrder(null);

      return;

    }


    const productionOrder =
      findOrder(
        orderNumber
      );


    if (!productionOrder) {

      setError(
        `La orden ${orderNumber} no existe.`
      );

      setOrder(null);

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
   * IMPRIMIR
   * ==================================================
   */

  function printCurrentLabel() {

    if (!order) {

      return;

    }


    const result =
      printLabel(
        order
      );


    if (!result.success) {

      alert(
        result.message
      );

      return;

    }


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


    if (updated) {

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


        if (latest) {

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

    if (!order) {

      return;

    }


    const coil =
      prompt(
        "¿Qué bobina desea reimprimir?"
      );


    if (!coil) {

      return;

    }


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

  if (error) {

    return (

      <Box>

        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={
            goBack
          }
          sx={{
            mb: 3
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

  if (!order) {

    return (

      <Box>

        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={
            goBack
          }
          sx={{
            mb: 3
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
          mb: 2,
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
          gap: 1.5,
          mb: 3,
          flexWrap: "wrap"
        }}
      >

        <PrintIcon
          sx={{
            color: "#0B7A3B",
            fontSize: 34
          }}
        />


        <Box
          sx={{
            flexGrow: 1
          }}
        >

          <Typography
            variant="h4"
            fontWeight="bold"
          >

            Imprimir orden

          </Typography>


          <Typography
            color="text.secondary"
          >

            Orden de producción {order.order}

          </Typography>

        </Box>


        {order.productionLine > 0 && (

          <Chip
            label={
              `Línea ${order.productionLine}`
            }
            color="success"
            variant="outlined"
          />

        )}


        {order.planningPosition > 0 && (

          <Chip
            label={
              `Posición ${order.planningPosition}`
            }
            variant="outlined"
          />

        )}

      </Box>


      {/* =============================================
          ORDEN
          ============================================= */}

      <Card>

        <CardContent>

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
                mb={3}
              >

                Orden {order.order}

              </Typography>


              <Typography
                sx={{
                  mb: 1
                }}
              >

                <b>SKU:</b>{" "}
                {order.sku}

              </Typography>


              <Typography
                sx={{
                  mb: 1
                }}
              >

                <b>Producto:</b>{" "}
                {order.product}

              </Typography>


              <Typography
                sx={{
                  mb: 1
                }}
              >

                <b>Lote:</b>{" "}
                {order.lot}

              </Typography>


              <Typography
                sx={{
                  mb: 1
                }}
              >

                <b>Plantilla:</b>{" "}
                {order.templateId}

              </Typography>


              <Typography
                sx={{
                  mb: 1
                }}
              >

                <b>Impresora:</b>{" "}
                {order.printer}

              </Typography>


              <Typography
                sx={{
                  mb: 1
                }}
              >

                <b>Estado:</b>{" "}

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
                />

              </Typography>


              {order.productionLine > 0 && (

                <Typography
                  sx={{
                    mb: 1
                  }}
                >

                  <b>
                    Línea de producción:
                  </b>{" "}

                  {order.productionLine}

                </Typography>

              )}


              {order.planningPosition > 0 && (

                <Typography>

                  <b>
                    Posición en planificación:
                  </b>{" "}

                  {order.planningPosition}

                </Typography>

              )}


              {/* =====================================
                  BOTONES
                  ===================================== */}

              <Box
                display="flex"
                gap={2}
                mt={4}
                flexWrap="wrap"
              >

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  disabled={
                    finished
                  }
                  onClick={
                    printCurrentLabel
                  }
                  sx={{
                    minWidth: 180,
                    minHeight: 55,
                    fontWeight: 700
                  }}
                >

                  🖨 IMPRIMIR

                </Button>


                <Button
                  variant="outlined"
                  size="large"
                  onClick={
                    repeatLabel
                  }
                  sx={{
                    minWidth: 190,
                    minHeight: 55
                  }}
                >

                  🔁 REPETIR ETIQUETA

                </Button>

              </Box>

            </Grid>


            {/* =====================================
                CONTADORES
                ===================================== */}

            <Grid
              size={{
                xs: 12,
                md: 4
              }}
            >

              <Card
                sx={{
                  backgroundColor:
                    "#0B7A3B",
                  color: "white",
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2
                }}
              >

                <Typography
                  variant="h5"
                  fontWeight="bold"
                >

                  TOTAL

                </Typography>


                <Typography
                  sx={{
                    fontSize: 82,
                    fontWeight: 700,
                    lineHeight: 1
                  }}
                >

                  {order.rolls}

                </Typography>


                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 22
                  }}
                >

                  Impresos:{" "}
                  {order.printed}

                </Typography>


                <Typography
                  sx={{
                    mt: 2,
                    fontSize: 18
                  }}
                >

                  Pendientes

                </Typography>


                <Typography
                  sx={{
                    fontSize: 58,
                    fontWeight: 400,
                    lineHeight: 1,
                    color:
                      pending === 0
                        ? "#8BC34A"
                        : "#FF5252"
                  }}
                >

                  {pending}

                </Typography>

              </Card>


              {/* =====================================
                  PRÓXIMA BOBINA
                  ===================================== */}

              <Card
                sx={{
                  mt: 2,
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
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


                {nextCoil !== null ? (

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 58,
                      fontWeight: 700,
                      lineHeight: 1,
                      color: "#1976D2"
                    }}
                  >

                    {nextCoil}

                  </Typography>

                ) : (

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

                )}

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

        <DialogTitle>

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

        <DialogTitle>

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
          >

            Aceptar

          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}