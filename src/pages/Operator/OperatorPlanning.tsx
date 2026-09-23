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
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
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
  getPendingQuantity
} from "../../services/OrderStorage";


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


export default function OperatorPlanning() {

  const navigate =
    useNavigate();


  const [
    orders,
    setOrders
  ] =
    useState<
      ProductionOrder[]
    >([]);


  /*
   * ==================================================
   * CARGAR ÓRDENES
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
   * ÓRDENES ACTIVAS
   * ==================================================
   */

  const activeOrders =
    useMemo(
      () =>
        orders.filter(
          order =>
            order.productionLine >= 1 &&
            order.productionLine <= 8 &&
            order.status !==
              "FINALIZADA" &&
            getPendingQuantity(
              order
            ) > 0
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


  return (

    <Box>

      {/* =============================================
          INICIO
          ============================================= */}

      <Box
        sx={{
          mt: 3,
          mb: 4
        }}
      >

        <Button
          onClick={
            () =>
              navigate("/")
          }
          sx={{
            minWidth: 205,
            height: 68,
            px: 2.5,

            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 1.8,

            border:
              "2px solid #0B7A3B",

            borderRadius:
              "16px",

            backgroundColor:
              "#FFFFFF",

            color:
              "#0B7A3B",

            fontSize: 19,
            fontWeight: 800,

            letterSpacing:
              "0.4px",

            textTransform:
              "uppercase",

            boxShadow:
              "0 5px 14px rgba(11, 122, 59, 0.16)",

            transition:
              "all 0.18s ease",

            "&:hover": {
              backgroundColor:
                "#EAF6EE",

              borderColor:
                "#086530",

              color:
                "#086530",

              boxShadow:
                "0 7px 18px rgba(11, 122, 59, 0.24)",

              transform:
                "translateY(-2px)"
            },

            "&:active": {
              transform:
                "translateY(0)",

              boxShadow:
                "0 3px 9px rgba(11, 122, 59, 0.18)"
            },

            "&:hover .homeIcon": {
              backgroundColor:
                "#086530",

              transform:
                "scale(1.08)"
            }
          }}
        >

          <Box
            className="homeIcon"
            sx={{
              width: 46,
              height: 46,
              flexShrink: 0,

              borderRadius:
                "50%",

              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",

              backgroundColor:
                "#0B7A3B",

              color:
                "#FFFFFF",

              boxShadow:
                "0 3px 8px rgba(11, 122, 59, 0.25)",

              transition:
                "all 0.18s ease"
            }}
          >

            <HomeRoundedIcon
              sx={{
                fontSize: 29
              }}
            />

          </Box>


          <Box
            component="span"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              pr: 2
            }}
          >

            INICIO

          </Box>

        </Button>

      </Box>


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

            Selecciona la orden de producción que deseas imprimir

          </Typography>

        </Box>


        <Chip
          label={
            `${activeOrders.length} órdenes pendientes`
          }
          color={
            activeOrders.length > 0
              ? "success"
              : "default"
          }
          variant="outlined"
          sx={{
            ml: 2
          }}
        />

      </Box>


      {/* =============================================
          8 LÍNEAS
          ============================================= */}

      <Stack
        spacing={3}
      >

        {PRODUCTION_LINES.map(
          line => {

            const lineOrders =
              activeOrders
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
                        minWidth: 1020
                      }}
                    >

                      {/* =================================
                          CABECERA TABLA
                          ================================= */}

                      <Box
                        sx={{
                          display: "grid",

                          gridTemplateColumns:
                            "60px 170px 140px minmax(280px, 1fr) 100px 100px 110px 130px",

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
                                  "60px 170px 140px minmax(280px, 1fr) 100px 100px 110px 130px",

                                alignItems:
                                  "center",

                                minHeight:
                                  64,

                                px: 2,

                                cursor:
                                  "pointer",

                                borderBottom:
                                  index ===
                                  lineOrders.length -
                                    1
                                    ? "none"
                                    : "1px solid #EEEEEE",

                                backgroundColor:
                                  "#FFFFFF",

                                transition:
                                  "background-color 0.15s ease",

                                "&:hover": {
                                  backgroundColor:
                                    "#F1F8E9"
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