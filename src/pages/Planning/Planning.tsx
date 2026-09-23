import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FactoryIcon from "@mui/icons-material/Factory";
import PrintIcon from "@mui/icons-material/Print";

import type {
  ReactNode
} from "react";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  getOrders,
  getPendingQuantity,
  moveOrderInPlanning
} from "../../services/OrderStorage";

import BackButton from "../../components/common/BackButton";


const PRODUCTION_LINES = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8
];


export default function Planning() {

  const navigate =
    useNavigate();


  const [
    orders,
    setOrders
  ] = useState<
    ProductionOrder[]
  >([]);


  /*
   * ==================================================
   * CARGAR PLANIFICACIÓN
   * ==================================================
   */

  function loadOrders() {

    setOrders(
      getOrders()
    );

  }


  useEffect(() => {

    loadOrders();


    function handleFocus() {

      loadOrders();

    }


    window.addEventListener(
      "focus",
      handleFocus
    );


    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );

    };

  }, []);


  /*
   * ==================================================
   * ÓRDENES SIN ASIGNAR
   * ==================================================
   */

  const unassignedOrders =
    useMemo(
      () =>
        orders.filter(
          order =>
            order.productionLine === 0
        ),
      [orders]
    );


  /*
   * ==================================================
   * ABRIR ORDEN
   * ==================================================
   */

  function openOrder(
    order: ProductionOrder
  ) {

    navigate(
      `/operator/print?order=${encodeURIComponent(
        order.order
      )}`
    );

  }


  /*
   * ==================================================
   * MOVER ORDEN
   * ==================================================
   */

  function moveOrder(
    orderId: number,
    direction:
      | "UP"
      | "DOWN"
  ) {

    moveOrderInPlanning(
      orderId,
      direction
    );


    loadOrders();

  }


  return (

    <Box>

      {/* =============================================
          INICIO
          ============================================= */}

      <BackButton
        showBack={false}
      />


      {/* =============================================
          CABECERA
          ============================================= */}

      <Box
        sx={{
          mb: 4,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          gap: 2
        }}
      >

        <CalendarMonthIcon
          sx={{
            fontSize: 46,
            color: "#0B7A3B"
          }}
        />


        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
          >

            Planificación

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >

            Orden de fabricación de las líneas de producción

          </Typography>

        </Box>

      </Box>


      {/* =============================================
          ÓRDENES ANTIGUAS SIN LÍNEA
          ============================================= */}

      {unassignedOrders.length > 0 && (

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2.5,
            border:
              "1px solid #FFCC80",
            backgroundColor:
              "#FFF8E1",
            borderRadius: 2
          }}
        >

          <Typography
            fontWeight={700}
          >

            Órdenes sin línea asignada

          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >

            Hay{" "}
            {unassignedOrders.length}{" "}
            orden(es) antiguas que todavía no tienen línea de producción asignada.

          </Typography>


          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{
              mt: 1.5
            }}
          >

            {unassignedOrders.map(
              order => (

                <Chip
                  key={
                    order.id
                  }
                  label={
                    `${order.order} · ${order.sku}`
                  }
                  size="small"
                  onClick={
                    () =>
                      openOrder(
                        order
                      )
                  }
                  sx={{
                    cursor: "pointer"
                  }}
                />

              )
            )}

          </Stack>

        </Paper>

      )}


      {/* =============================================
          8 LÍNEAS
          ============================================= */}

      <Stack
        spacing={3}
      >

        {PRODUCTION_LINES.map(
          line => {

            const lineOrders =
              orders
                .filter(
                  order =>
                    order.productionLine ===
                    line
                )
                .sort(
                  (
                    a,
                    b
                  ) =>
                    a.planningPosition -
                    b.planningPosition
                );


            const total =
              lineOrders.reduce(
                (
                  sum,
                  order
                ) =>
                  sum +
                  order.rolls,
                0
              );


            const printed =
              lineOrders.reduce(
                (
                  sum,
                  order
                ) =>
                  sum +
                  order.printed,
                0
              );


            const pending =
              lineOrders.reduce(
                (
                  sum,
                  order
                ) =>
                  sum +
                  getPendingQuantity(
                    order
                  ),
                0
              );


            return (

              <Paper
                key={
                  line
                }
                elevation={0}
                sx={{
                  overflow: "hidden",
                  border:
                    "1px solid #E0E0E0",
                  borderRadius: 2
                }}
              >

                {/* =====================================
                    CABECERA LÍNEA
                    ===================================== */}

                <Box
                  sx={{
                    px: 2.5,
                    py: 1.7,

                    backgroundColor:
                      "#E8F3EB",

                    borderBottom:
                      "1px solid #E0E0E0",

                    display: "flex",

                    alignItems: "center",

                    gap: 1.5,

                    flexWrap: "wrap"
                  }}
                >

                  <FactoryIcon
                    sx={{
                      color: "#0B7A3B",
                      fontSize: 28
                    }}
                  />


                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                      color: "#0B7A3B",
                      mr: "auto"
                    }}
                  >

                    LÍNEA {line}

                  </Typography>


                  <Chip
                    label={
                      lineOrders.length === 1
                        ? "1 orden"
                        : `${lineOrders.length} órdenes`
                    }
                    size="small"
                    sx={{
                      fontWeight: 700,
                      backgroundColor:
                        "#FFFFFF"
                    }}
                  />


                  <Chip
                    label={
                      `Total: ${total}`
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        "#FFFFFF"
                    }}
                  />


                  <Chip
                    label={
                      `Impresas: ${printed}`
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        "#FFFFFF"
                    }}
                  />


                  <Chip
                    label={
                      `Pendientes: ${pending}`
                    }
                    size="small"
                    color={
                      pending > 0
                        ? "warning"
                        : "success"
                    }
                    sx={{
                      fontWeight: 600
                    }}
                  />

                </Box>


                {/* =====================================
                    SIN ÓRDENES
                    ===================================== */}

                {lineOrders.length ===
                0 ? (

                  <Box
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor:
                        "#FAFAFA"
                    }}
                  >

                    <Typography
                      color="text.secondary"
                    >

                      Sin órdenes planificadas

                    </Typography>

                  </Box>

                ) : (

                  <Box
                    sx={{
                      overflowX: "auto"
                    }}
                  >

                    <Box
                      sx={{
                        minWidth: 1110
                      }}
                    >

                      {/* =================================
                          CABECERA TABLA
                          ================================= */}

                      <Box
                        sx={{
                          display: "grid",

                          gridTemplateColumns:
                            "60px 160px 130px minmax(240px, 1fr) 100px 100px 110px 120px 90px",

                          alignItems: "center",

                          px: 2,
                          py: 1.2,

                          backgroundColor:
                            "#F5F7FA",

                          borderBottom:
                            "1px solid #E0E0E0"
                        }}
                      >

                        <Header>
                          #
                        </Header>


                        <Header>
                          Orden
                        </Header>


                        <Header>
                          SKU
                        </Header>


                        <Header>
                          Producto
                        </Header>


                        <Header center>
                          Total
                        </Header>


                        <Header center>
                          Impresas
                        </Header>


                        <Header center>
                          Pendientes
                        </Header>


                        <Header center>
                          Progreso
                        </Header>


                        <Header center>
                          Orden
                        </Header>

                      </Box>


                      {/* =================================
                          ÓRDENES
                          ================================= */}

                      {lineOrders.map(
                        (
                          order,
                          index
                        ) => {

                          const orderPending =
                            getPendingQuantity(
                              order
                            );


                          const progress =
                            order.rolls > 0
                              ? Math.min(
                                  100,
                                  (
                                    order.printed /
                                    order.rolls
                                  ) *
                                    100
                                )
                              : 0;


                          return (

                            <Box
                              key={
                                order.id
                              }
                              onClick={
                                () =>
                                  openOrder(
                                    order
                                  )
                              }
                              sx={{
                                display:
                                  "grid",

                                gridTemplateColumns:
                                  "60px 160px 130px minmax(240px, 1fr) 100px 100px 110px 120px 90px",

                                alignItems:
                                  "center",

                                minHeight:
                                  64,

                                px:
                                  2,

                                cursor:
                                  "pointer",

                                borderBottom:
                                  index ===
                                  lineOrders.length -
                                    1
                                    ? "none"
                                    : "1px solid #EEEEEE",

                                backgroundColor:
                                  order.status ===
                                  "FINALIZADA"
                                    ? "#F1F8E9"
                                    : "#FFFFFF",

                                transition:
                                  "background-color 0.15s ease",

                                "&:hover": {
                                  backgroundColor:
                                    order.status ===
                                    "FINALIZADA"
                                      ? "#E8F5E9"
                                      : "#F1F8E9"
                                }
                              }}
                            >

                              <Typography
                                fontWeight={700}
                                color="text.secondary"
                              >

                                {index + 1}

                              </Typography>


                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1
                                }}
                              >

                                <Typography
                                  fontWeight={700}
                                  color="primary.main"
                                >

                                  {order.order}

                                </Typography>


                                <PrintIcon
                                  sx={{
                                    fontSize: 17,
                                    color:
                                      "#0B7A3B"
                                  }}
                                />

                              </Box>


                              <Typography
                                variant="body2"
                              >

                                {order.sku}

                              </Typography>


                              <Box
                                sx={{
                                  pr: 2
                                }}
                              >

                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                >

                                  {order.product}

                                </Typography>


                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >

                                  Lote:{" "}
                                  {order.lot}

                                </Typography>

                              </Box>


                              <Typography
                                textAlign="center"
                                fontWeight={600}
                              >

                                {order.rolls}

                              </Typography>


                              <Typography
                                textAlign="center"
                              >

                                {order.printed}

                              </Typography>


                              <Typography
                                textAlign="center"
                                fontWeight={700}
                                color={
                                  orderPending === 0
                                    ? "success.main"
                                    : "warning.dark"
                                }
                              >

                                {orderPending}

                              </Typography>


                              <Box
                                sx={{
                                  px: 1
                                }}
                              >

                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    progress
                                  }
                                  sx={{
                                    height: 8,
                                    borderRadius: 5
                                  }}
                                />


                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >

                                  {
                                    Math.round(
                                      progress
                                    )
                                  }%

                                </Typography>

                              </Box>


                              {/* SUBIR / BAJAR */}

                              <Box
                                onClick={
                                  event =>
                                    event.stopPropagation()
                                }
                                sx={{
                                  display: "flex",
                                  justifyContent:
                                    "center"
                                }}
                              >

                                <Tooltip
                                  title="Subir"
                                >

                                  <span>

                                    <IconButton
                                      size="small"
                                      disabled={
                                        index === 0
                                      }
                                      onClick={
                                        event => {

                                          event.stopPropagation();


                                          moveOrder(
                                            order.id,
                                            "UP"
                                          );

                                        }
                                      }
                                    >

                                      <KeyboardArrowUpIcon />

                                    </IconButton>

                                  </span>

                                </Tooltip>


                                <Tooltip
                                  title="Bajar"
                                >

                                  <span>

                                    <IconButton
                                      size="small"
                                      disabled={
                                        index ===
                                        lineOrders.length -
                                          1
                                      }
                                      onClick={
                                        event => {

                                          event.stopPropagation();


                                          moveOrder(
                                            order.id,
                                            "DOWN"
                                          );

                                        }
                                      }
                                    >

                                      <KeyboardArrowDownIcon />

                                    </IconButton>

                                  </span>

                                </Tooltip>

                              </Box>

                            </Box>

                          );

                        }
                      )}

                    </Box>

                  </Box>

                )}

              </Paper>

            );

          }
        )}

      </Stack>

    </Box>

  );

}


/*
 * ==================================================
 * CABECERA TABLA
 * ==================================================
 */

function Header({
  children,
  center = false
}: {
  children: ReactNode;
  center?: boolean;
}) {

  return (

    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      textAlign={
        center
          ? "center"
          : "left"
      }
      sx={{
        textTransform:
          "uppercase"
      }}
    >

      {children}

    </Typography>

  );

}