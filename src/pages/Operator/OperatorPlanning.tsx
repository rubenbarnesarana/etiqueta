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
  findTemplate
} from "../../services/TemplateStorage";

import {
  findProduct
} from "../../services/ProductStorage";

import {
  getAssignedTemplate
} from "../../services/ProductTemplateStorage";

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


const PLANNING_COLUMNS =
  "42px 185px 110px 120px 82px 82px minmax(230px, 1.5fr) minmax(145px, 1fr) 110px 125px 100px";


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
        maximumFractionDigits:
          2
      }
    ).format(
      value
    );


  return unit ===
    "UN"
    ? `${formatted} un`
    : `${formatted} m`;
}


function normalizeText(
  value: string
): string {

  return value
    .toUpperCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^A-Z0-9]/g,
      ""
    );
}


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


  function loadOrders() {

    setOrders(
      getOrders()
    );
  }


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


  const activeOrders =
    useMemo(
      () =>
        orders.filter(
          order =>
            order.productionLine >=
              1 &&
            order.productionLine <=
              8 &&
            order.status !==
              "FINALIZADA" &&
            getPendingQuantity(
              order
            ) >
              0
        ),
      [
        orders
      ]
    );


  const lineOrders =
    useMemo(
      () =>
        activeOrders
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
                a.planningPosition >
                  0
                  ? a.planningPosition
                  : Number.MAX_SAFE_INTEGER;


              const positionB =
                b.planningPosition >
                  0
                  ? b.planningPosition
                  : Number.MAX_SAFE_INTEGER;


              return (
                positionA -
                positionB
              );
            }
          ),
      [
        activeOrders,
        selectedLine
      ]
    );


  const totalRolls =
    lineOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        Number(
          order.rolls ??
          0
        ),
      0
    );


  const totalPrinted =
    lineOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        Number(
          order.printed ??
          0
        ),
      0
    );


  const totalPending =
    lineOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        getPendingQuantity(
          order
        ),
      0
    );


  function getLineOrderCount(
    line: number
  ): number {

    return activeOrders.filter(
      order =>
        order.productionLine ===
        line
    ).length;
  }


  function openOrder(
    order: ProductionOrder
  ) {

    navigate(
      `/operator/print?order=${encodeURIComponent(
        order.order
      )}`
    );
  }


  function getOrderTemplate(
    order: ProductionOrder
  ) {

    const assignedTemplate =
      getAssignedTemplate(
        order.sku
      );


    if (
      assignedTemplate
    ) {

      const template =
        findTemplate(
          assignedTemplate.id
        );


      if (
        template
      ) {

        return template;
      }
    }


    const product =
      findProduct(
        order.sku
      );


    if (
      product
    ) {

      const template =
        findTemplate(
          product.templateId
        );


      if (
        template
      ) {

        return template;
      }
    }


    return findTemplate(
      order.templateId
    );
  }


  function getOperatorDescription(
    order: ProductionOrder
  ): string {

    const description =
      String(
        order.product ??
        ""
      ).trim();


    if (
      !description
    ) {

      return "-";
    }


    const template =
      getOrderTemplate(
        order
      );


    const templateName =
      String(
        template?.name ??
        ""
      );


    const normalizedTemplate =
      normalizeText(
        templateName
      );


    if (
      !normalizedTemplate.includes(
        "NAANPCMAX"
      )
    ) {

      return description;
    }


    const normalizedDescription =
      normalizeText(
        description
      );


    if (
      normalizedDescription.startsWith(
        "NAANPCMAX"
      )
    ) {

      return description;
    }


    return `NAAN PC MAX ${description}`;
  }


  return (

    <Box
      sx={{
        width:
          "100%",

        minWidth:
          0
      }}
    >

      <Box
        sx={{
          mt:
            3,

          mb:
            4
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
            minWidth:
              205,

            height:
              68,

            px:
              2.5,

            display:
              "flex",

            justifyContent:
              "flex-start",

            alignItems:
              "center",

            gap:
              1.8,

            border:
              "2px solid #0B7A3B",

            borderRadius:
              "16px",

            backgroundColor:
              "#FFFFFF",

            color:
              "#0B7A3B",

            fontSize:
              19,

            fontWeight:
              800,

            textTransform:
              "uppercase"
          }}
        >

          <Box
            sx={{
              width:
                46,

              height:
                46,

              flexShrink:
                0,

              borderRadius:
                "50%",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              backgroundColor:
                "#0B7A3B",

              color:
                "#FFFFFF"
            }}
          >

            <HomeRoundedIcon
              sx={{
                fontSize:
                  29
              }}
            />

          </Box>


          <Box
            component="span"
            sx={{
              flexGrow:
                1,

              textAlign:
                "center",

              pr:
                2
            }}
          >
            INICIO
          </Box>

        </Button>

      </Box>


      <Box
        sx={{
          mb:
            3,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          gap:
            2
        }}
      >

        <CalendarMonthIcon
          sx={{
            fontSize:
              46,

            color:
              "#0B7A3B"
          }}
        />


        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color:
                "#087D3E"
            }}
          >
            Planificación
          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt:
                0.5
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
            activeOrders.length >
              0
              ? "success"
              : "default"
          }
          variant="outlined"
          sx={{
            ml:
              1,

            fontWeight:
              600
          }}
        />

      </Box>


      <Paper
        elevation={0}
        sx={{
          mb:
            2.5,

          border:
            "1px solid #D7DDD9",

          borderRadius:
            2,

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
              "#FAFBFA",

            minHeight:
              64,

            "& .MuiTabs-indicator": {
              backgroundColor:
                "#0B7A3B",

              height:
                4
            },

            "& .MuiTab-root": {
              minHeight:
                64,

              minWidth:
                0,

              px:
                0.6,

              fontWeight:
                800
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
                  getLineOrderCount(
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
                        justifyContent="center"
                      >

                        <Typography
                          component="span"
                          fontWeight={800}
                          sx={{
                            whiteSpace:
                              "nowrap"
                          }}
                        >
                          LÍNEA {line}
                        </Typography>


                        <Box
                          sx={{
                            minWidth:
                              27,

                            height:
                              27,

                            px:
                              count >
                                9
                                ? 0.8
                                : 0.4,

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

                            fontSize:
                              "0.78rem",

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


      <Paper
        elevation={0}
        sx={{
          width:
            "100%",

          minWidth:
            0,

          overflow:
            "hidden",

          border:
            "1px solid #D8DDD9",

          borderRadius:
            2
        }}
      >

        <Box
          sx={{
            px:
              2,

            py:
              1.5,

            backgroundColor:
              "#E8F3EB",

            borderBottom:
              "1px solid #D8DDD9"
          }}
        >

          <Box
            sx={{
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
                  "#0B7A3B",

                whiteSpace:
                  "nowrap"
              }}
            >
              LÍNEA {selectedLine}
            </Typography>


            {
              lineComments
                ? (

                  <Box
                    sx={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap:
                        0.6,

                      flex:
                        "1 1 250px",

                      minWidth:
                        0
                    }}
                  >

                    <CommentIcon
                      sx={{
                        fontSize:
                          17,

                        color:
                          "#D84315"
                      }}
                    />


                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{
                        color:
                          "#D84315"
                      }}
                    >
                      {lineComments}
                    </Typography>

                  </Box>

                )
                : (

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flex:
                        "1 1 250px"
                    }}
                  >
                    Sin comentarios para esta línea
                  </Typography>

                )
            }


            <Stack
              direction="row"
              spacing={0.7}
              sx={{
                ml:
                  "auto"
              }}
            >

              <Chip
                label={
                  lineOrders.length ===
                    1
                    ? "1 ORDEN"
                    : `${lineOrders.length} ÓRDENES`
                }
                size="small"
                sx={{
                  fontWeight:
                    900,

                  color:
                    "#FFFFFF",

                  backgroundColor:
                    "#0B7A3B"
                }}
              />


              <Chip
                label={
                  `R/B: ${totalRolls}`
                }
                size="small"
                variant="outlined"
              />


              <Chip
                label={
                  `Imp.: ${totalPrinted}`
                }
                size="small"
                variant="outlined"
              />


              <Chip
                label={
                  `Pend.: ${totalPending}`
                }
                size="small"
                color={
                  totalPending >
                    0
                    ? "warning"
                    : "success"
                }
              />

            </Stack>

          </Box>

        </Box>


        {
          lineOrders.length ===
            0
            ? (

              <Box
                sx={{
                  p:
                    5,

                  textAlign:
                    "center"
                }}
              >

                <FactoryIcon
                  sx={{
                    fontSize:
                      48,

                    color:
                      "#BDBDBD"
                  }}
                />


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
                  overflowX:
                    "auto"
                }}
              >

                <Box
                  sx={{
                    minWidth:
                      1430
                  }}
                >

                  <Box
                    sx={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        PLANNING_COLUMNS,

                      columnGap:
                        0.7,

                      px:
                        1,

                      py:
                        1.1,

                      backgroundColor:
                        "#F5F7FA"
                    }}
                  >

                    <Header center>#</Header>

                    <Header>OF</Header>

                    <Header>Marcaje</Header>

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

                  </Box>


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
                          order.rolls >
                            0
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
                                PLANNING_COLUMNS,

                              columnGap:
                                0.7,

                              minHeight:
                                66,

                              px:
                                1,

                              alignItems:
                                "center",

                              cursor:
                                "pointer",

                              borderTop:
                                "1px solid #EEEEEE",

                              "&:hover": {
                                backgroundColor:
                                  "#F0F8F2"
                              }
                            }}
                          >

                            <CellBox>

                              <Typography
                                fontWeight={900}
                                textAlign="center"
                              >
                                {index + 1}
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Box
                                sx={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap:
                                    0.8,

                                  minWidth:
                                    0
                                }}
                              >

                                <Typography
                                  fontWeight={800}
                                  color="primary.main"
                                  sx={{
                                    whiteSpace:
                                      "nowrap",

                                    overflow:
                                      "visible",

                                    textOverflow:
                                      "clip",

                                    fontVariantNumeric:
                                      "tabular-nums"
                                  }}
                                >
                                  {order.order}
                                </Typography>


                                <PrintIcon
                                  sx={{
                                    fontSize:
                                      16,

                                    color:
                                      "#0B7A3B",

                                    flexShrink:
                                      0
                                  }}
                                />

                              </Box>

                            </CellBox>


                            <CellBox>

                              <Typography
                                variant="body2"
                                fontWeight={700}
                              >
                                {
                                  order.marking ||
                                  "-"
                                }
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Typography
                                variant="body2"
                                textAlign="center"
                              >
                                {
                                  formatQuantity(
                                    Number(
                                      order.quantity ??
                                      0
                                    ),
                                    order.quantityUnit ===
                                      "UN"
                                      ? "UN"
                                      : "M"
                                  )
                                }
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Typography
                                fontWeight={800}
                                textAlign="center"
                              >
                                {order.rolls}
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Typography
                                fontWeight={800}
                                textAlign="center"
                                color="error.main"
                              >
                                {pending}
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Typography
                                variant="body2"
                              >
                                {
                                  getOperatorDescription(
                                    order
                                  )
                                }
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Typography
                                variant="body2"
                              >
                                {
                                  order.customer ||
                                  "-"
                                }
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Typography
                                variant="body2"
                              >
                                {order.sku}
                              </Typography>

                            </CellBox>


                            <CellBox>

                              <Typography
                                variant="body2"
                              >
                                {
                                  order.salesOrder ||
                                  "-"
                                }
                              </Typography>

                            </CellBox>


                            <CellBox>

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
                                sx={{
                                  display:
                                    "block",

                                  textAlign:
                                    "center"
                                }}
                              >
                                {Math.round(progress)}%
                              </Typography>

                            </CellBox>

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


function CellBox({
  children
}: {
  children: ReactNode;
}) {

  return (

    <Box
      sx={{
        minWidth:
          0,

        overflow:
          "visible"
      }}
    >
      {children}
    </Box>

  );
}


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
      fontWeight={800}
      color="text.secondary"
      textAlign={
        center
          ? "center"
          : "left"
      }
      sx={{
        whiteSpace:
          "nowrap",

        textTransform:
          "uppercase"
      }}
    >
      {children}
    </Typography>

  );
}