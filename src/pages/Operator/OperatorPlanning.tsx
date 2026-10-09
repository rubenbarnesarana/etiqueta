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
  Tab,
  Tabs,
  Typography
} from "@mui/material";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FactoryIcon from "@mui/icons-material/Factory";
import PrintIcon from "@mui/icons-material/Print";
import CommentIcon from "@mui/icons-material/Comment";

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

import {
  getProductionLineSetting,
  loadProductionLineSettingsFromSupabase
} from "../../services/ProductionLineStorage";


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


/*
 * ==================================================
 * COLUMNAS
 * ==================================================
 *
 * Aumentamos MARCAJE y METROS para evitar
 * que los textos se junten.
 * ==================================================
 */

const PLANNING_COLUMNS =
  "38px 145px 145px 140px 76px 76px minmax(240px, 1.55fr) minmax(170px, 1fr) 105px 125px 90px 72px";


/*
 * ==================================================
 * FORMATEAR CANTIDAD
 * ==================================================
 */

function formatQuantity(
  quantity: number,
  unit: "M" | "UN"
): string {

  const value =
    Number(
      quantity ?? 0
    );


  if (
    !Number.isFinite(
      value
    ) ||
    value <= 0
  ) {

    return "-";

  }


  const formatted =
    new Intl.NumberFormat(
      "es-ES",
      {
        maximumFractionDigits: 2
      }
    ).format(
      value
    );


  return unit ===
    "UN"

    ? `${formatted} un`

    : `${formatted} m`;

}


/*
 * ==================================================
 * CANTIDAD PENDIENTE
 * ==================================================
 */

function getPendingAmount(
  order: ProductionOrder
): number {

  const pending =
    Math.max(
      0,
      Number(
        getPendingQuantity(
          order
        )
      )
    );


  const quantity =
    Math.max(
      0,
      Number(
        order.quantity ??
        0
      )
    );


  return (
    pending *
    quantity
  );

}


/*
 * ==================================================
 * CABECERA COLUMNA
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
      fontWeight={900}
      sx={{
        fontSize: 11.5,
        lineHeight: 1.15,
        textTransform: "uppercase",
        textAlign:
          center
            ? "center"
            : "left",
        whiteSpace: "normal"
      }}
    >
      {children}
    </Typography>

  );

}


/*
 * ==================================================
 * COMPONENTE
 * ==================================================
 */

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


  const [
    selectedLine,
    setSelectedLine
  ] =
    useState<number>(
      1
    );


  const [
    lineComments,
    setLineComments
  ] =
    useState(
      ""
    );


  /*
   * ==================================================
   * ÓRDENES
   * ==================================================
   */

  function loadOrders() {

    setOrders(
      getOrders()
    );

  }


  /*
   * ==================================================
   * COMENTARIOS
   * ==================================================
   */

  function loadLineComments(
    line: number
  ) {

    const setting =
      getProductionLineSetting(
        line
      );


    setLineComments(
      setting.comments ??
      ""
    );

  }


  async function refreshLineSettings() {

    try {

      await loadProductionLineSettingsFromSupabase();


      loadLineComments(
        selectedLine
      );

    }
    catch (
      error
    ) {

      console.error(
        "No se pudieron actualizar los comentarios de línea:",
        error
      );

    }

  }


  /*
   * ==================================================
   * EVENTOS
   * ==================================================
   */

  useEffect(
    () => {

      loadOrders();

      loadLineComments(
        selectedLine
      );

      void refreshLineSettings();


      function handleFocus() {

        loadOrders();

        void refreshLineSettings();

      }


      function handleOrdersUpdated() {

        loadOrders();

      }


      function handleLineSettingsUpdated() {

        loadLineComments(
          selectedLine
        );

      }


      window.addEventListener(
        "focus",
        handleFocus
      );


      window.addEventListener(
        "productionOrdersUpdated",
        handleOrdersUpdated
      );


      window.addEventListener(
        "productionLineSettingsUpdated",
        handleLineSettingsUpdated
      );


      return () => {

        window.removeEventListener(
          "focus",
          handleFocus
        );


        window.removeEventListener(
          "productionOrdersUpdated",
          handleOrdersUpdated
        );


        window.removeEventListener(
          "productionLineSettingsUpdated",
          handleLineSettingsUpdated
        );

      };

    },
    [
      selectedLine
    ]
  );


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

      [
        orders
      ]
    );


  /*
   * ==================================================
   * ÓRDENES DE LÍNEA
   * ==================================================
   */

  const lineOrders =
    useMemo(
      () => {

        return activeOrders
          .filter(
            order =>
              order.productionLine ===
              selectedLine
          )
          .sort(
            (
              a,
              b
            ) => {

              const positionA =
                Number(
                  a.planningPosition ??
                  0
                );


              const positionB =
                Number(
                  b.planningPosition ??
                  0
                );


              if (
                positionA <= 0 &&
                positionB > 0
              ) {

                return 1;

              }


              if (
                positionB <= 0 &&
                positionA > 0
              ) {

                return -1;

              }


              if (
                positionA !==
                positionB
              ) {

                return (
                  positionA -
                  positionB
                );

              }


              return (
                Number(
                  a.id
                ) -
                Number(
                  b.id
                )
              );

            }
          );

      },
      [
        activeOrders,
        selectedLine
      ]
    );


  /*
   * ==================================================
   * CONTADOR LÍNEA
   * ==================================================
   */

  function getLineCount(
    line: number
  ): number {

    return activeOrders.filter(
      order =>
        order.productionLine ===
        line
    ).length;

  }


  /*
   * ==================================================
   * ABRIR OF
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
   * TOTALES
   * ==================================================
   */

  const totalRolls =
    lineOrders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        Number(
          order.rolls ??
          0
        ),
      0
    );


  const totalPrinted =
    lineOrders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        Number(
          order.printed ??
          0
        ),
      0
    );


  const totalPending =
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


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box
      sx={{
        width: "100%",
        minWidth: 0
      }}
    >

      {/* INICIO */}

      <Box
        sx={{
          mt: 3,
          mb: 4
        }}
      >

        <Button
          onClick={
            () =>
              navigate(
                "/"
              )
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

            "&:hover": {
              backgroundColor:
                "#EAF6EE",

              borderColor:
                "#086530",

              color:
                "#086530"
            }
          }}
        >

          <Box
            sx={{
              width: 46,
              height: 46,

              borderRadius:
                "50%",

              backgroundColor:
                "#0B7A3B",

              color:
                "#FFFFFF",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center"
            }}
          >

            <HomeRoundedIcon />

          </Box>


          INICIO

        </Button>

      </Box>


      {/* CABECERA */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          mb: 3
        }}
      >

        <CalendarMonthIcon
          sx={{
            color: "#0B7A3B",
            fontSize: 44
          }}
        />


        <Box>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >

            <Typography
              variant="h3"
              fontWeight={800}
              color="#0B7A3B"
            >
              Planificación
            </Typography>


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

          </Stack>


          <Typography
            color="text.secondary"
            sx={{
              textAlign:
                "center"
            }}
          >
            Selecciona la orden de producción que deseas imprimir
          </Typography>

        </Box>

      </Box>


      {/* PESTAÑAS */}

      <Paper
        elevation={0}
        sx={{
          mb: 2.5,

          border:
            "1px solid #E0E0E0",

          borderRadius: 2,

          overflow:
            "hidden"
        }}
      >

        <Tabs
          value={
            selectedLine
          }
          onChange={
            (
              _event,
              value
            ) =>
              setSelectedLine(
                Number(
                  value
                )
              )
          }
          variant="fullWidth"
          sx={{
            backgroundColor:
              "#F8FAF8",

            "& .MuiTabs-indicator": {
              backgroundColor:
                "#0B7A3B",

              height: 4
            },

            "& .MuiTab-root": {
              fontWeight: 800,
              minHeight: 64,
              minWidth: 0,
              color: "#6D5844"
            },

            "& .Mui-selected": {
              color:
                "#0B7A3B !important"
            }
          }}
        >

          {
            PRODUCTION_LINES.map(
              line => {

                const count =
                  getLineCount(
                    line
                  );


                return (

                  <Tab
                    key={
                      line
                    }
                    value={
                      line
                    }
                    label={

                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                      >

                        <span>
                          LÍNEA {line}
                        </span>


                        <Box
                          sx={{
                            minWidth:
                              27,

                            height:
                              27,

                            px:
                              0.5,

                            borderRadius:
                              "14px",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            fontWeight:
                              900,

                            backgroundColor:
                              selectedLine ===
                                line

                                ? "#0B7A3B"

                                : count >
                                    0

                                  ? "#DCEFE1"

                                  : "#EEEEEE",

                            color:
                              selectedLine ===
                                line

                                ? "#FFFFFF"

                                : count >
                                    0

                                  ? "#0B7A3B"

                                  : "#757575"
                          }}
                        >
                          {count}
                        </Box>

                      </Stack>

                    }
                  />

                );

              }
            )
          }

        </Tabs>

      </Paper>


      {/* LÍNEA */}

      <Paper
        elevation={0}
        sx={{
          border:
            "1px solid #E0E0E0",

          borderRadius:
            2,

          overflow:
            "hidden"
        }}
      >

        {/* CABECERA LÍNEA */}

        <Box
          sx={{
            px: 2,
            py: 1.5,

            backgroundColor:
              "#E8F3EB",

            borderBottom:
              "1px solid #E0E0E0",

            display:
              "flex",

            alignItems:
              "center",

            gap:
              1.2,

            flexWrap:
              "wrap"
          }}
        >

          <FactoryIcon
            sx={{
              color:
                "#0B7A3B",

              fontSize:
                27
            }}
          />


          <Typography
            variant="h6"
            fontWeight={900}
            sx={{
              color:
                "#0B7A3B"
            }}
          >
            LÍNEA {selectedLine}
          </Typography>


          {/* COMENTARIO */}

          {
            lineComments

              ? (

                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                  sx={{
                    ml: 1,
                    flex: 1,
                    minWidth: 0
                  }}
                >

                  <CommentIcon
                    sx={{
                      fontSize:
                        18,

                      color:
                        "#D84315"
                    }}
                  />


                  <Typography
                    variant="body2"
                    fontWeight={800}
                    color="#D84315"
                    sx={{
                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      whiteSpace:
                        "nowrap"
                    }}
                    title={
                      lineComments
                    }
                  >
                    {lineComments}
                  </Typography>

                </Stack>

              )

              : (

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    ml: 1,
                    flex: 1
                  }}
                >
                  Sin comentarios para esta línea
                </Typography>

              )
          }


          <Chip
            label={
              `${lineOrders.length} OF`
            }
            size="small"
            sx={{
              fontWeight:
                800,

              backgroundColor:
                "#FFFFFF"
            }}
          />


          <Chip
            label={
              `R/B: ${totalRolls}`
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
              `Imp.: ${totalPrinted}`
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
              `Pend.: ${totalPending}`
            }
            size="small"
            color={
              totalPending > 0

                ? "warning"

                : "success"
            }
            sx={{
              fontWeight:
                700
            }}
          />

        </Box>


        {/* SIN ÓRDENES */}

        {
          lineOrders.length ===
            0

            ? (

              <Box
                sx={{
                  py: 5,

                  textAlign:
                    "center",

                  backgroundColor:
                    "#FFFFFF"
                }}
              >

                <Typography
                  color="text.secondary"
                >
                  Sin órdenes planificadas en la Línea {selectedLine}
                </Typography>

              </Box>

            )

            : (

              <Box
                sx={{
                  width:
                    "100%",

                  overflowX:
                    "auto"
                }}
              >

                <Box
                  sx={{
                    /*
                     * Un poco más ancho para que Marcaje
                     * y Metros no se monten.
                     */
                    minWidth:
                      1500
                  }}
                >

                  {/* CABECERA */}

                  <Box
                    sx={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        PLANNING_COLUMNS,

                      columnGap:
                        1.2,

                      px:
                        1.2,

                      py:
                        1.1,

                      backgroundColor:
                        "#F5F7FA",

                      borderBottom:
                        "1px solid #E0E0E0"
                    }}
                  >

                    <Header center>
                      #
                    </Header>

                    <Header>
                      OF
                    </Header>

                    <Header>
                      Marcaje
                    </Header>

                    <Header center>
                      Metros / Unid.
                    </Header>

                    <Header center>
                      R/B Tot
                    </Header>

                    <Header center>
                      R/B Pen
                    </Header>

                    <Header>
                      Descripción
                    </Header>

                    <Header>
                      Cliente
                    </Header>

                    <Header>
                      SKU
                    </Header>

                    <Header>
                      Pedido Venta
                    </Header>

                    <Header center>
                      Progreso
                    </Header>

                    <Header center>
                      Imprimir
                    </Header>

                  </Box>


                  {/* FILAS */}

                  {
                    lineOrders.map(
                      (
                        order,
                        index
                      ) => {

                        const pending =
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


                        const unit:
                          "M" |
                          "UN" =

                          order.quantityUnit ===
                            "UN"

                            ? "UN"

                            : "M";


                        const pendingAmount =
                          getPendingAmount(
                            order
                          );


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
                                PLANNING_COLUMNS,

                              columnGap:
                                1.2,

                              minHeight:
                                64,

                              px:
                                1.2,

                              alignItems:
                                "center",

                              borderBottom:
                                "1px solid #EAEAEA",

                              cursor:
                                "pointer",

                              backgroundColor:
                                "#FFFFFF",

                              "&:hover": {
                                backgroundColor:
                                  "#F3FAF5"
                              }
                            }}
                          >

                            {/* POSICIÓN */}

                            <Typography
                              fontWeight={800}
                              textAlign="center"
                            >
                              {
                                order.planningPosition >
                                  0

                                  ? order.planningPosition

                                  : index +
                                    1
                              }
                            </Typography>


                            {/* OF */}

                            <Typography
                              fontWeight={900}
                              color="#1976D2"
                              sx={{
                                whiteSpace:
                                  "nowrap"
                              }}
                            >
                              {order.order}
                            </Typography>


                            {/* MARCAJE */}

                            <Typography
                              fontWeight={800}
                              title={
                                order.marking ||
                                "-"
                              }
                              sx={{
                                fontSize:
                                  13,

                                whiteSpace:
                                  "nowrap",

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "clip",

                                pr:
                                  1.5
                              }}
                            >
                              {
                                order.marking ||
                                "-"
                              }
                            </Typography>


                            {/* METROS */}

                            <Typography
                              fontWeight={900}
                              color="#0B7A3B"
                              textAlign="center"
                              sx={{
                                whiteSpace:
                                  "nowrap",

                                pl:
                                  1,

                                pr:
                                  1
                              }}
                            >
                              {
                                formatQuantity(
                                  pendingAmount,
                                  unit
                                )
                              }
                            </Typography>


                            {/* R/B TOTAL */}

                            <Typography
                              fontWeight={800}
                              textAlign="center"
                            >
                              {order.rolls}
                            </Typography>


                            {/* R/B PENDIENTES */}

                            <Typography
                              fontWeight={900}
                              color="error.main"
                              textAlign="center"
                            >
                              {pending}
                            </Typography>


                            {/* DESCRIPCIÓN */}

                            <Typography
                              variant="body2"
                              sx={{
                                lineHeight:
                                  1.25,

                                overflow:
                                  "hidden",

                                display:
                                  "-webkit-box",

                                WebkitLineClamp:
                                  2,

                                WebkitBoxOrient:
                                  "vertical",

                                px:
                                  1
                              }}
                            >
                              {order.product}
                            </Typography>


                            {/* CLIENTE */}

                            <Typography
                              variant="body2"
                              title={
                                order.customer ||
                                "-"
                              }
                              sx={{
                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",

                                px:
                                  1
                              }}
                            >
                              {
                                order.customer ||
                                "-"
                              }
                            </Typography>


                            {/* SKU */}

                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace:
                                  "nowrap"
                              }}
                            >
                              {order.sku}
                            </Typography>


                            {/* PEDIDO VENTA */}

                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                whiteSpace:
                                  "nowrap"
                              }}
                            >
                              {
                                order.salesOrder ||
                                "-"
                              }
                            </Typography>


                            {/* PROGRESO */}

                            <Box
                              sx={{
                                px:
                                  0.5
                              }}
                            >

                              <LinearProgress
                                variant="determinate"
                                value={
                                  progress
                                }
                                sx={{
                                  height:
                                    7,

                                  borderRadius:
                                    5
                                }}
                              />


                              <Typography
                                variant="caption"
                                fontWeight={800}
                                sx={{
                                  display:
                                    "block",

                                  mt:
                                    0.4,

                                  textAlign:
                                    "center"
                                }}
                              >
                                {
                                  Math.round(
                                    progress
                                  )
                                }%
                              </Typography>

                            </Box>


                            {/* IMPRIMIR */}

                            <Box
                              sx={{
                                display:
                                  "flex",

                                justifyContent:
                                  "center"
                              }}
                            >

                              <PrintIcon
                                sx={{
                                  color:
                                    "#0B7A3B"
                                }}
                              />

                            </Box>

                          </Box>

                        );

                      }
                    )
                  }

                </Box>

              </Box>

            )
        }

      </Paper>

    </Box>

  );

}