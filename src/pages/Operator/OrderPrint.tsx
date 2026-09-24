import {
  useEffect,
  useRef,
  useState
} from "react";

import {
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
  Chip,
  TextField
} from "@mui/material";

import PrintIcon from "@mui/icons-material/Print";
import ReplayIcon from "@mui/icons-material/Replay";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import BackButton from "../../components/common/BackButton";
import LabelPreview from "../../components/print/LabelPreview";
import PalletLabelDialog from "../../components/print/PalletLabelDialog";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  findOrder
} from "../../services/OrderStorage";

import {
  printLabel,
  reprintLabel
} from "../../services/PrintService";

import {
  registerPrint
} from "../../services/PrintHistoryService";

import {
  findProduct
} from "../../services/ProductStorage";

import {
  findTemplate
} from "../../services/TemplateStorage";

import {
  getAssignedTemplate
} from "../../services/ProductTemplateStorage";

import {
  useAuth
} from "../../auth/AuthContext";

import type {
  DesignerElement
} from "../../components/designer/DesignerTypes";


export default function OrderPrint() {

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
    reprintOpen,
    setReprintOpen
  ] = useState(false);


  /*
   * ==================================================
   * ETIQUETA DE PALET
   * ==================================================
   */

  const [
    palletLabelOpen,
    setPalletLabelOpen
  ] = useState(false);


  const [
    reprintCoil,
    setReprintCoil
  ] = useState("");


  const [
    reprintError,
    setReprintError
  ] = useState("");


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
    coilNumber: number,
    printType:
      | "PRINT"
      | "REPRINT" =
      "PRINT"
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

        printType,

        productionLine:
          productionOrder.productionLine

      });

    }
    catch (
      historyError
    ) {

      console.error(
        "La etiqueta se imprimió, pero no se pudo registrar en el historial:",
        historyError
      );

    }

  }


  /*
   * ==================================================
   * CARGAR VISTA PREVIA
   * ==================================================
   */

  function loadPreview(
    result: {
      label?: any[];
      backgroundImage?: string;
      labelFormat?:
        | "FORMATO_1"
        | "FORMATO_2";
      labelData?: any;
    }
  ) {

    setLabel(
      result.label ??
      []
    );


    setBackgroundImage(
      result.backgroundImage
    );


    setLabelFormat(
      result.labelFormat ??
      "FORMATO_1"
    );


    setLabelData(
      result.labelData
    );


    setPreviewOpen(
      true
    );


    setTimeout(
      () => {

        setPreviewOpen(
          false
        );

      },
      2000
    );

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


    void savePrintHistory(
      order,
      printedCoil,
      "PRINT"
    );


    setLabel(
      result.label ??
      []
    );


    setBackgroundImage(
      result.backgroundImage
    );


    setLabelFormat(
      result.labelFormat ??
      "FORMATO_1"
    );


    setLabelData(
      result.labelData
    );


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


    setPreviewOpen(
      true
    );


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
   * ABRIR REIMPRESIÓN
   * ==================================================
   */

  function repeatLabel() {

    if (
      !order
    ) {

      return;

    }


    setReprintError("");


    if (
      order.printed <= 0
    ) {

      setReprintCoil("");

    }
    else {

      /*
       * Proponemos por defecto la última
       * bobina realmente impresa.
       */

      setReprintCoil(
        String(
          order.firstCoil +
          order.printed -
          1
        )
      );

    }


    setReprintOpen(
      true
    );

  }


  /*
   * ==================================================
   * CONFIRMAR REIMPRESIÓN
   * ==================================================
   */

  function confirmReprint() {

    if (
      !order
    ) {

      return;

    }


    const coilNumber =
      Number(
        reprintCoil
      );


    if (
      !Number.isInteger(
        coilNumber
      )
    ) {

      setReprintError(
        "Introduce un número de bobina válido."
      );

      return;

    }


    const result =
      reprintLabel(
        order,
        coilNumber
      );


    if (
      !result.success
    ) {

      setReprintError(
        result.message
      );

      return;

    }


    /*
     * IMPORTANTE:
     *
     * La reimpresión NO modifica:
     *
     * - Impresos
     * - Pendientes
     * - Próxima bobina
     * - Estado
     */


    void savePrintHistory(
      order,
      coilNumber,
      "REPRINT"
    );


    setReprintOpen(
      false
    );


    setReprintError("");


    loadPreview(
      result
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


  const firstReprintCoil =
    order
      ? order.firstCoil
      : 0;


  const lastReprintCoil =
    order &&
    order.printed > 0
      ? order.firstCoil +
        order.printed -
        1
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

        <BackButton />


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

        <BackButton />


        <Typography>

          Cargando orden...

        </Typography>

      </Box>

    );

  }


  /*
   * ==================================================
   * PLANTILLA REAL DE LA ORDEN
   * ==================================================
   *
   * Utilizamos exactamente el mismo criterio
   * que PrintService:
   *
   * 1. Asignación específica SKU -> plantilla
   * 2. Plantilla configurada en el producto
   *
   * De esta forma el botón de etiqueta de palet
   * solamente aparece cuando la etiqueta que
   * realmente utiliza el SKU es FORMATO_2.
   * ==================================================
   */

  const product =
    findProduct(
      order.sku
    );


  const assignedTemplate =
    getAssignedTemplate(
      order.sku
    );


  const realTemplate =
    assignedTemplate
      ? findTemplate(
          assignedTemplate.id
        )
      : product
        ? findTemplate(
            product.templateId
          )
        : null;


  const isFormat2 =
    realTemplate?.labelFormat ===
    "FORMATO_2";


  /*
   * Nombre que aparecerá en la cabecera
   * de la etiqueta de palet.
   *
   * Ejemplo:
   *
   * TURBO EXCEL BOBINAS
   *
   * pasa a:
   *
   * TURBO EXCEL
   */

  const palletProductTitle =
    realTemplate?.name
      ?.replace(
        /\s+BOBINAS\s*$/i,
        ""
      )
      .trim() ||
    order.product;


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

      <BackButton />


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

            <Box
              sx={{
                minWidth: 145,
                height: 105,
                px: 2.5,
                borderRadius: 3,
                backgroundColor: "#0B7A3B",
                color: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 5px 14px rgba(11, 122, 59, 0.22)",
                border: "2px solid #086530"
              }}
            >

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  lineHeight: 1,
                  mb: 0.5
                }}
              >
                LÍNEA
              </Typography>

              <Typography
                sx={{
                  fontSize: 54,
                  fontWeight: 900,
                  lineHeight: 0.95
                }}
              >
                {order.productionLine}
              </Typography>

            </Box>

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


              {/* CLIENTE */}

              <Typography
                sx={{
                  mb: 1.5
                }}
              >

                <b>Cliente:</b>{" "}
                {order.customer || "-"}

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
                  disabled={
                    order.printed <= 0
                  }
                  onClick={
                    repeatLabel
                  }
                  sx={{
                    minWidth: 210,
                    minHeight: 56,
                    fontWeight: 700,
                    color: "#0B7A3B",
                    borderColor: "#0B7A3B",

                    "&:hover": {
                      borderColor: "#086530",
                      backgroundColor:
                        "#F2F8F4"
                    }
                  }}
                >

                  REPETIR ETIQUETA

                </Button>


                {/* =====================================
                    ETIQUETA DE PALET
                    SOLO FORMATO 2
                    ===================================== */}

                {
                  isFormat2
                  &&
                  (

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={
                        <Inventory2OutlinedIcon />
                      }
                      onClick={
                        () =>
                          setPalletLabelOpen(
                            true
                          )
                      }
                      sx={{
                        minWidth: 230,
                        minHeight: 56,
                        fontWeight: 700,
                        color: "#0B7A3B",
                        borderColor: "#0B7A3B",

                        "&:hover": {
                          borderColor: "#086530",
                          backgroundColor:
                            "#F2F8F4"
                        }
                      }}
                    >

                      ETIQUETA DE PALET

                    </Button>

                  )
                }

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
          VENTANA REIMPRESIÓN
          ============================================= */}

      <Dialog
        open={
          reprintOpen
        }
        onClose={
          () =>
            setReprintOpen(
              false
            )
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: 26,
            color: "#0B7A3B",
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >

          <ReplayIcon
            sx={{
              fontSize: 32
            }}
          />

          Repetir etiqueta

        </DialogTitle>


        <DialogContent>

          <Typography
            sx={{
              mb: 2
            }}
          >

            Orden de producción{" "}

            <b>
              {order.order}
            </b>

          </Typography>


          {
            lastReprintCoil !== null
            &&
            (

              <Alert
                severity="info"
                sx={{
                  mb: 3
                }}
              >

                Puedes reimprimir las bobinas{" "}

                <b>
                  {firstReprintCoil}
                </b>

                {" "}a{" "}

                <b>
                  {lastReprintCoil}
                </b>.

                La reimpresión no modificará los contadores de la orden.

              </Alert>

            )
          }


          {
            reprintError
            &&
            (

              <Alert
                severity="error"
                sx={{
                  mb: 2
                }}
              >

                {reprintError}

              </Alert>

            )
          }


          <TextField
            autoFocus
            fullWidth
            label="Número de bobina"
            type="number"
            value={
              reprintCoil
            }
            onChange={
              event => {

                setReprintCoil(
                  event.target.value
                );

                setReprintError("");

              }
            }
            onKeyDown={
              event => {

                if (
                  event.key ===
                  "Enter"
                ) {

                  confirmReprint();

                }

              }
            }
            slotProps={{
              htmlInput: {
                min:
                  firstReprintCoil,

                max:
                  lastReprintCoil ??
                  undefined,

                step:
                  1
              }
            }}
            sx={{
              mt: 1,

              "& input": {
                fontSize: 28,
                fontWeight: 700,
                textAlign: "center"
              }
            }}
          />

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1
          }}
        >

          <Button
            onClick={
              () =>
                setReprintOpen(
                  false
                )
            }
            sx={{
              fontWeight: 700
            }}
          >

            CANCELAR

          </Button>


          <Button
            variant="contained"
            startIcon={
              <ReplayIcon />
            }
            onClick={
              confirmReprint
            }
            sx={{
              minHeight: 48,
              px: 3,
              fontWeight: 800,
              backgroundColor:
                "#0B7A3B",

              "&:hover": {
                backgroundColor:
                  "#086530"
              }
            }}
          >

            REIMPRIMIR BOBINA

          </Button>

        </DialogActions>

      </Dialog>


      {/* =============================================
          ETIQUETA DE PALET
          ============================================= */}

      <PalletLabelDialog
        open={
          palletLabelOpen
        }

        order={
          order
        }

        productTitle={
          palletProductTitle
        }

        onClose={
          () =>
            setPalletLabelOpen(
              false
            )
        }
      />


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