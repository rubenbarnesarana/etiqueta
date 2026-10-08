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

import {
  findTemplate
} from "../../services/TemplateStorage";

import {
  findProduct
} from "../../services/ProductStorage";

import {
  getAssignedTemplate
} from "../../services/ProductTemplateStorage";


/*
 * ==================================================
 * LÍNEAS
 * ==================================================
 */

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
 */

const PLANNING_COLUMNS =
  "42px 185px 110px 130px 82px 82px minmax(230px, 1.5fr) minmax(145px, 1fr) 110px 125px 100px";


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
    value <=
      0
  ) {

    return "-";

  }


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
 * TOTAL REAL DE LA ORDEN
 * ==================================================
 *
 * quantity = cantidad por rollo / bobina
 *
 * TOTAL = rolls × quantity
 * ==================================================
 */

function getOrderTotalQuantity(
  order: ProductionOrder
): number {

  const rolls =
    Math.max(
      0,
      Number(
        order.rolls ??
        0
      )
    );


  const quantityPerRoll =
    Math.max(
      0,
      Number(
        order.quantity ??
        0
      )
    );


  return (
    rolls *
    quantityPerRoll
  );

}


/*
 * ==================================================
 * NORMALIZAR TEXTO
 * ==================================================
 */

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


/*
 * ==================================================
 * PLANTILLA DE LA ORDEN
 * ==================================================
 */

function getOrderTemplateName(
  order: ProductionOrder
): string {

  const assigned:
    any =
    getAssignedTemplate(
      order.sku
    );


  const assignedId =
    typeof assigned ===
      "number"

      ? assigned

      : Number(
          assigned?.templateId ??
          assigned?.id ??
          0
        );


  if (
    assignedId >
      0
  ) {

    const template =
      findTemplate(
        assignedId
      );


    if (
      template
    ) {

      return (
        template.name ??
        ""
      );

    }

  }


  const product =
    findProduct(
      order.sku
    );


  if (
    product?.templateId
  ) {

    const template =
      findTemplate(
        Number(
          product.templateId
        )
      );


    if (
      template
    ) {

      return (
        template.name ??
        ""
      );

    }

  }


  const orderTemplate =
    findTemplate(
      Number(
        order.templateId ??
        0
      )
    );


  return (
    orderTemplate?.name ??
    ""
  );

}


/*
 * ==================================================
 * DESCRIPCIÓN
 * ==================================================
 *
 * SOLO NAAN PC MAX añade prefijo.
 * Ninguna otra familia se modifica.
 * ==================================================
 */

function getPlanningDescription(
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


  const templateName =
    getOrderTemplateName(
      order
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


  return (
    `NAAN PC MAX ${description}`
  );

}


/*
 * ==================================================
 * CABECERA
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
      textAlign={
        center
          ? "center"
          : "left"
      }
      sx={{
        textTransform:
          "uppercase",

        color:
          "#455A64",

        fontSize:
          10.5,

        lineHeight:
          1.15
      }}
    >
      {children}
    </Typography>

  );

}


/*
 * ==================================================
 * CELDA
 * ==================================================
 */

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


  /*
   * ==================================================
   * EVENTOS
   * ==================================================
   */

  useEffect(
    () => {

      loadOrders();


      function handleFocus() {

        loadOrders();

      }


      function handleOrdersUpdated() {

        loadOrders();

      }


      window.addEventListener(
        "focus",
        handleFocus
      );


      window.addEventListener(
        "productionOrdersUpdated",
        handleOrdersUpdated
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

      };

    },
    []
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
   * RENDER
   * ==================================================
   */

  return (

    <Box
      sx={{
        width:
          "100%",

        minWidth:
          0
      }}
    >

      {/* =============================================
          INICIO
          ============================================= */}

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
                "#FFFFFF",

              boxShadow:
                "0 3px 8px rgba(11, 122, 59, 0.25)",

              transition:
                "all 0.18s ease"
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


      {/* =============================================
          CABECERA
          ============================================= */}

      <Box
        sx={{
          mb:
            4,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          gap:
            2,

          flexWrap:
            "wrap"
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
              2
          }}
        />

      </Box>


      {/* =============================================
          LÍNEAS
          ============================================= */}

      <Stack
        spacing={3}
      >

        {
          PRODUCTION_LINES.map(
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


                      const safeA =
                        positionA >
                          0

                          ? positionA

                          : Number.MAX_SAFE_INTEGER;


                      const safeB =
                        positionB >
                          0

                          ? positionB

                          : Number.MAX_SAFE_INTEGER;


                      if (
                        safeA !==
                          safeB
                      ) {

                        return (
                          safeA -
                          safeB
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


              const total =
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


              const printed =
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
                    overflow:
                      "hidden",

                    border:
                      "1px solid #E0E0E0",

                    borderRadius:
                      2
                  }}
                >

                  {/* CABECERA LÍNEA */}

                  <Box
                    sx={{
                      px:
                        2.5,

                      py:
                        1.7,

                      backgroundColor:
                        "#E8F3EB",

                      borderBottom:
                        "1px solid #E0E0E0",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap:
                        1.5,

                      flexWrap:
                        "wrap"
                    }}
                  >

                    <FactoryIcon
                      sx={{
                        color:
                          "#0B7A3B"
                      }}
                    />


                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{
                        color:
                          "#0B7A3B",

                        minWidth:
                          110
                      }}
                    >
                      LÍNEA {line}
                    </Typography>


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
                        `R/B: ${total}`
                      }
                      size="small"
                      variant="outlined"
                    />


                    <Chip
                      label={
                        `Imp.: ${printed}`
                      }
                      size="small"
                      variant="outlined"
                    />


                    <Chip
                      label={
                        `Pend.: ${pending}`
                      }
                      size="small"
                      color={
                        pending >
                          0

                          ? "warning"

                          : "success"
                      }
                    />

                  </Box>


                  {/* SIN ÓRDENES */}

                  {
                    lineOrders.length ===
                      0

                      ? (

                        <Box
                          sx={{
                            py:
                              3,

                            textAlign:
                              "center"
                          }}
                        >

                          <Typography
                            color="text.secondary"
                          >
                            Sin órdenes planificadas
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

                            {/* CABECERA TABLA */}

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

                            </Box>


                            {/* ÓRDENES */}

                            {
                              lineOrders.map(
                                (
                                  order,
                                  index
                                ) => {

                                  const orderPending =
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


                                  const unit:
                                    "M" |
                                    "UN" =

                                    order.quantityUnit ===
                                      "UN"

                                      ? "UN"

                                      : "M";


                                  const totalQuantity =
                                    getOrderTotalQuantity(
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
                                          0.7,

                                        minHeight:
                                          68,

                                        px:
                                          1,

                                        alignItems:
                                          "center",

                                        cursor:
                                          "pointer",

                                        borderTop:
                                          "1px solid #EEEEEE",

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

                                      {/* POSICIÓN */}

                                      <CellBox>

                                        <Typography
                                          fontWeight={900}
                                          textAlign="center"
                                        >
                                          {index + 1}
                                        </Typography>

                                      </CellBox>


                                      {/* OF */}

                                      <CellBox>

                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={0.6}
                                        >

                                          <Typography
                                            fontWeight={900}
                                            color="primary.main"
                                            title={
                                              order.order
                                            }
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
                                                17,

                                              color:
                                                "#0B7A3B",

                                              flexShrink:
                                                0
                                            }}
                                          />

                                        </Stack>

                                      </CellBox>


                                      {/* MARCAJE */}

                                      <CellBox>

                                        <Typography
                                          variant="body2"
                                          fontWeight={700}
                                          noWrap
                                        >
                                          {
                                            order.marking ||
                                            "-"
                                          }
                                        </Typography>

                                      </CellBox>


                                      {/* TOTAL METROS / UNIDADES */}

                                      <CellBox>

                                        <Typography
                                          variant="body2"
                                          textAlign="center"
                                          fontWeight={900}
                                          sx={{
                                            color:
                                              "#0B7A3B",

                                            whiteSpace:
                                              "nowrap"
                                          }}
                                        >
                                          {
                                            formatQuantity(
                                              totalQuantity,
                                              unit
                                            )
                                          }
                                        </Typography>

                                      </CellBox>


                                      {/* TOTAL R/B */}

                                      <CellBox>

                                        <Typography
                                          textAlign="center"
                                          fontWeight={800}
                                        >
                                          {order.rolls}
                                        </Typography>

                                      </CellBox>


                                      {/* PENDIENTES */}

                                      <CellBox>

                                        <Typography
                                          textAlign="center"
                                          fontWeight={900}
                                          color={
                                            orderPending >
                                              0

                                              ? "error.main"

                                              : "success.main"
                                          }
                                        >
                                          {orderPending}
                                        </Typography>

                                      </CellBox>


                                      {/* DESCRIPCIÓN */}

                                      <CellBox>

                                        <Typography
                                          variant="body2"
                                          fontWeight={500}
                                          title={
                                            getPlanningDescription(
                                              order
                                            )
                                          }
                                          sx={{
                                            overflow:
                                              "hidden",

                                            display:
                                              "-webkit-box",

                                            WebkitLineClamp:
                                              2,

                                            WebkitBoxOrient:
                                              "vertical"
                                          }}
                                        >
                                          {
                                            getPlanningDescription(
                                              order
                                            )
                                          }
                                        </Typography>

                                      </CellBox>


                                      {/* CLIENTE */}

                                      <CellBox>

                                        <Typography
                                          variant="body2"
                                          noWrap
                                        >
                                          {
                                            order.customer ||
                                            "-"
                                          }
                                        </Typography>

                                      </CellBox>


                                      {/* SKU */}

                                      <CellBox>

                                        <Typography
                                          variant="body2"
                                          noWrap
                                        >
                                          {order.sku}
                                        </Typography>

                                      </CellBox>


                                      {/* PEDIDO VENTA */}

                                      <CellBox>

                                        <Typography
                                          variant="body2"
                                          fontWeight={700}
                                          noWrap
                                        >
                                          {
                                            order.salesOrder ||
                                            "-"
                                          }
                                        </Typography>

                                      </CellBox>


                                      {/* PROGRESO */}

                                      <CellBox>

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
                                                8,

                                              borderRadius:
                                                5,

                                              mb:
                                                0.5
                                            }}
                                          />


                                          <Typography
                                            variant="caption"
                                            display="block"
                                            textAlign="center"
                                            fontWeight={700}
                                          >
                                            {
                                              Math.round(
                                                progress
                                              )
                                            }%
                                          </Typography>

                                        </Box>

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

              );

            }
          )
        }

      </Stack>

    </Box>

  );

}