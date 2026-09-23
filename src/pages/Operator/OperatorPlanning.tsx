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
  Card,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PrintIcon from "@mui/icons-material/Print";

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
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3
        }}
      >

        <PrecisionManufacturingIcon
          sx={{
            color: "#0B7A3B",
            fontSize: 38
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

            Planificación

          </Typography>


          <Typography
            color="text.secondary"
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
        />

      </Box>


      {/* =============================================
          LÍNEAS
          ============================================= */}

      <Grid
        container
        spacing={2}
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

              <Grid
                key={
                  line
                }
                size={{
                  xs: 12,
                  md: 6,
                  lg: 3
                }}
              >

                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    border:
                      "1px solid #E0E0E0",
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundColor:
                      "#FFFFFF"
                  }}
                >

                  {/* =================================
                      CABECERA DE LÍNEA
                      ================================= */}

                  <Box
                    sx={{
                      px: 2,
                      py: 1.7,
                      borderBottom:
                        "1px solid #E0E0E0"
                    }}
                  >

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="#0B7A3B"
                      textAlign="center"
                    >

                      Línea {line}

                    </Typography>


                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        justifyContent:
                          "center",
                        gap: 1,
                        flexWrap: "wrap"
                      }}
                    >

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >

                        Órdenes:{" "}

                        <b>
                          {lineOrders.length}
                        </b>

                      </Typography>


                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >

                        Total:{" "}

                        <b>
                          {total}
                        </b>

                      </Typography>


                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >

                        Imp.:{" "}

                        <b>
                          {printed}
                        </b>

                      </Typography>


                      <Typography
                        variant="caption"
                        color={
                          pending > 0
                            ? "warning.dark"
                            : "success.main"
                        }
                      >

                        Pend.:{" "}

                        <b>
                          {pending}
                        </b>

                      </Typography>

                    </Box>

                  </Box>


                  {/* =================================
                      SIN ÓRDENES
                      ================================= */}

                  {lineOrders.length ===
                  0 ? (

                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center"
                      }}
                    >

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >

                        Sin órdenes pendientes

                      </Typography>

                    </Box>

                  ) : (

                    <Stack
                      divider={
                        <Divider />
                      }
                    >

                      {lineOrders.map(
                        (
                          order,
                          index
                        ) => {

                          const orderPending =
                            getPendingQuantity(
                              order
                            );


                          return (

                            <Card
                              key={
                                order.id
                              }
                              elevation={0}
                              square
                              onClick={
                                () =>
                                  openOrder(
                                    order
                                  )
                              }
                              sx={{
                                p: 2,
                                cursor:
                                  "pointer",
                                borderLeft:
                                  "4px solid transparent",
                                transition:
                                  "all 0.15s ease",

                                "&:hover": {
                                  backgroundColor:
                                    "#E8F5E9",
                                  borderLeftColor:
                                    "#0B7A3B"
                                }
                              }}
                            >

                              {/* ORDEN */}

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  gap: 1
                                }}
                              >

                                <Chip
                                  label={
                                    index + 1
                                  }
                                  size="small"
                                  sx={{
                                    minWidth: 32
                                  }}
                                />


                                <Typography
                                  fontWeight={700}
                                  sx={{
                                    flexGrow: 1
                                  }}
                                >

                                  {order.order}

                                </Typography>


                                <PrintIcon
                                  sx={{
                                    fontSize: 19,
                                    color:
                                      "#0B7A3B"
                                  }}
                                />

                              </Box>


                              {/* SKU */}

                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                  mt: 1.25
                                }}
                              >

                                {order.sku}

                              </Typography>


                              {/* PRODUCTO */}

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  mt: 0.4,
                                  minHeight: 36
                                }}
                              >

                                {order.product}

                              </Typography>


                              {/* CANTIDADES */}

                              <Box
                                sx={{
                                  mt: 1.5,
                                  pt: 1,
                                  borderTop:
                                    "1px solid #EEEEEE",

                                  display: "flex",

                                  justifyContent:
                                    "space-between",

                                  gap: 1
                                }}
                              >

                                <Typography
                                  variant="caption"
                                >

                                  Total:{" "}

                                  <b>
                                    {order.rolls}
                                  </b>

                                </Typography>


                                <Typography
                                  variant="caption"
                                >

                                  Imp.:{" "}

                                  <b>
                                    {order.printed}
                                  </b>

                                </Typography>


                                <Typography
                                  variant="caption"
                                  color="warning.dark"
                                >

                                  Pend.:{" "}

                                  <b>
                                    {orderPending}
                                  </b>

                                </Typography>

                              </Box>

                            </Card>

                          );

                        }
                      )}

                    </Stack>

                  )}

                </Paper>

              </Grid>

            );

          }
        )}

      </Grid>

    </Box>

  );

}