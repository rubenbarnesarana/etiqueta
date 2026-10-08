import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FactoryIcon from "@mui/icons-material/Factory";
import CommentIcon from "@mui/icons-material/Comment";

import ProductionDialog from "../../components/production/ProductionDialog";
import ProductionManageDialog from "../../components/production/ProductionManageDialog";

import BackButton from "../../components/common/BackButton";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder
} from "../../services/OrderStorage";

import {
  getTemplates
} from "../../services/TemplateStorage";

import {
  getProductionLineSetting,
  loadProductionLineSettingsFromSupabase,
  updateProductionLineComments
} from "../../services/ProductionLineStorage";


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


  const formatted =
    formatNumber(
      value
    );


  return unit ===
    "UN"

    ? `${formatted} un`

    : `${formatted} m`;

}


/*
 * ==================================================
 * TOTAL ORDEN
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
 * COMPONENTE
 * ==================================================
 */

export default function Production() {

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
    openDialog,
    setOpenDialog
  ] =
    useState(
      false
    );


  const [
    editing,
    setEditing
  ] =
    useState<
      ProductionOrder |
      undefined
    >();


  const [
    managing,
    setManaging
  ] =
    useState<
      ProductionOrder |
      undefined
    >();


  const [
    orderToDelete,
    setOrderToDelete
  ] =
    useState<
      ProductionOrder |
      undefined
    >();


  /*
   * ==================================================
   * COMENTARIOS DE LÍNEA
   * ==================================================
   */

  const [
    lineComments,
    setLineComments
  ] =
    useState(
      ""
    );


  const [
    commentsDialogOpen,
    setCommentsDialogOpen
  ] =
    useState(
      false
    );


  const [
    commentsDraft,
    setCommentsDraft
  ] =
    useState(
      ""
    );


  const [
    savingComments,
    setSavingComments
  ] =
    useState(
      false
    );


  const [
    commentsError,
    setCommentsError
  ] =
    useState(
      ""
    );


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
   * CARGAR COMENTARIO
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


  /*
   * ==================================================
   * EVENTOS
   * ==================================================
   */

  useEffect(
    () => {

      loadOrders();


      async function loadSupabaseLineSettings() {

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
            "No se pudieron cargar los comentarios de línea:",
            error
          );

        }

      }


      void loadSupabaseLineSettings();


      function handleOrdersUpdated() {

        loadOrders();

      }


      function handleLineSettingsUpdated() {

        loadLineComments(
          selectedLine
        );

      }


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


  useEffect(
    () => {

      loadLineComments(
        selectedLine
      );

    },
    [
      selectedLine
    ]
  );


  /*
   * ==================================================
   * GUARDAR ORDEN
   * ==================================================
   */

  function saveOrder(
    order: ProductionOrder
  ) {

    const existing =
      getOrders().find(
        item =>
          Number(
            item.id
          ) ===
          Number(
            order.id
          )
      );


    if (
      existing
    ) {

      updateOrder(
        order
      );

    }
    else {

      addOrder(
        order
      );

    }


    loadOrders();


    setOpenDialog(
      false
    );


    setEditing(
      undefined
    );


    setManaging(
      undefined
    );


    if (
      order.productionLine >=
        1 &&
      order.productionLine <=
        8
    ) {

      setSelectedLine(
        order.productionLine
      );

    }

  }


  /*
   * ==================================================
   * NUEVA ORDEN
   * ==================================================
   */

  function newOrder() {

    setEditing(
      undefined
    );


    setOpenDialog(
      true
    );

  }


  /*
   * ==================================================
   * GESTIONAR ORDEN
   * ==================================================
   */

  function manageOrder(
    order: ProductionOrder
  ) {

    setManaging(
      order
    );

  }


  /*
   * ==================================================
   * ELIMINAR
   * ==================================================
   */

  function askRemoveOrder(
    order: ProductionOrder
  ) {

    setOrderToDelete(
      order
    );

  }


  function cancelRemoveOrder() {

    setOrderToDelete(
      undefined
    );

  }


  function confirmRemoveOrder() {

    if (
      !orderToDelete
    ) {

      return;

    }


    deleteOrder(
      orderToDelete.id
    );


    setOrderToDelete(
      undefined
    );


    loadOrders();

  }


  /*
   * ==================================================
   * COMENTARIO DE LÍNEA
   * ==================================================
   */

  function openCommentsDialog() {

    setCommentsDraft(
      lineComments
    );


    setCommentsError(
      ""
    );


    setCommentsDialogOpen(
      true
    );

  }


  function closeCommentsDialog() {

    if (
      savingComments
    ) {

      return;

    }


    setCommentsDialogOpen(
      false
    );


    setCommentsDraft(
      ""
    );


    setCommentsError(
      ""
    );

  }


  async function saveLineComments() {

    if (
      savingComments
    ) {

      return;

    }


    setSavingComments(
      true
    );


    setCommentsError(
      ""
    );


    try {

      await updateProductionLineComments(
        selectedLine,
        commentsDraft
      );


      await loadProductionLineSettingsFromSupabase();


      loadLineComments(
        selectedLine
      );


      setCommentsDialogOpen(
        false
      );


      setCommentsDraft(
        ""
      );

    }
    catch (
      error
    ) {

      console.error(
        `Error guardando comentario de Línea ${selectedLine}:`,
        error
      );


      setCommentsError(
        "No se ha podido guardar el comentario en Supabase. Revisa la conexión e inténtalo de nuevo."
      );

    }
    finally {

      setSavingComments(
        false
      );

    }

  }


  /*
   * ==================================================
   * NOMBRE PLANTILLA
   * ==================================================
   */

  function getTemplateName(
    templateId: number
  ): string {

    const templates =
      getTemplates();


    const template =
      templates.find(
        item =>
          Number(
            item.id
          ) ===
          Number(
            templateId
          )
      );


    return (
      template?.name ??
      "-"
    );

  }


  /*
   * ==================================================
   * ÓRDENES DE LA LÍNEA
   * ==================================================
   */

  const lineOrders =
    useMemo(
      () => {

        return orders
          .map(
            (
              order,
              storageIndex
            ) => ({

              order,

              storageIndex

            })
          )
          .filter(
            item =>
              item.order.productionLine ===
              selectedLine
          )
          .sort(
            (
              a,
              b
            ) => {

              if (
                a.order.status !==
                b.order.status
              ) {

                return a.order.status ===
                  "ABIERTA"

                  ? -1

                  : 1;

              }


              const positionA =
                a.order.planningPosition >
                  0

                  ? a.order.planningPosition

                  : Number.MAX_SAFE_INTEGER;


              const positionB =
                b.order.planningPosition >
                  0

                  ? b.order.planningPosition

                  : Number.MAX_SAFE_INTEGER;


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
                a.storageIndex -
                b.storageIndex
              );

            }
          )
          .map(
            item =>
              item.order
          );

      },
      [
        orders,
        selectedLine
      ]
    );


  /*
   * ==================================================
   * SIN LÍNEA
   * ==================================================
   */

  const unassignedOrders =
    useMemo(
      () => {

        return orders.filter(
          order =>
            order.productionLine <
              1 ||
            order.productionLine >
              8
        );

      },
      [
        orders
      ]
    );


  /*
   * ==================================================
   * CONTADOR LÍNEA
   * ==================================================
   */

  function getLineOrderCount(
    line: number
  ): number {

    return orders.filter(
      order =>
        order.productionLine ===
        line
    ).length;

  }


  /*
   * ==================================================
   * FILA DE ORDEN
   * ==================================================
   */

  function renderOrderRow(
    order: ProductionOrder,
    position: number
  ) {

    const pending =
      Math.max(
        0,
        Number(
          order.rolls ??
          0
        ) -
        Number(
          order.printed ??
          0
        )
      );


    const quantityUnit:
      "M" |
      "UN" =

      order.quantityUnit ===
        "UN"

        ? "UN"

        : "M";


    const quantityPerRoll =
      Number(
        order.quantity ??
        0
      );


    const totalQuantity =
      getOrderTotalQuantity(
        order
      );


    return (

      <TableRow
        key={
          order.id
        }
        hover
        sx={{
          "&:last-child td": {
            borderBottom:
              "none"
          },

          backgroundColor:
            order.status ===
              "FINALIZADA"

              ? "#FAFAFA"

              : "#FFFFFF"
        }}
      >

        {/* POSICIÓN */}

        <TableCell
          align="center"
        >

          <Chip
            label={
              order.planningPosition >
                0

                ? `#${position}`

                : "-"
            }
            size="small"
            variant="outlined"
            sx={{
              fontWeight:
                700,

              minWidth:
                44
            }}
          />

        </TableCell>


        {/* OF */}

        <TableCell>

          <Typography
            fontWeight={800}
            sx={{
              whiteSpace:
                "nowrap",

              fontVariantNumeric:
                "tabular-nums"
            }}
          >
            {order.order}
          </Typography>

        </TableCell>


        {/* MARCAJE */}

        <TableCell>

          <Typography
            variant="body2"
            fontWeight={700}
          >
            {
              order.marking ||
              "-"
            }
          </Typography>

        </TableCell>


        {/* CANTIDAD POR BOBINA */}

        <TableCell
          align="center"
        >

          <Typography
            fontWeight={700}
            variant="body2"
            sx={{
              whiteSpace:
                "nowrap"
            }}
          >
            {
              formatQuantity(
                quantityPerRoll,
                quantityUnit
              )
            }
          </Typography>

        </TableCell>


        {/* TOTAL METROS / UNIDADES */}

        <TableCell
          align="center"
        >

          <Typography
            fontWeight={900}
            variant="body2"
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
                quantityUnit
              )
            }
          </Typography>

        </TableCell>


        {/* R/B TOTAL */}

        <TableCell
          align="center"
        >

          <Typography
            fontWeight={800}
          >
            {order.rolls}
          </Typography>

        </TableCell>


        {/* R/B PENDIENTE */}

        <TableCell
          align="center"
        >

          <Typography
            fontWeight={800}
            color={
              pending >
                0

                ? "error.main"

                : "success.main"
            }
          >
            {pending}
          </Typography>

        </TableCell>


        {/* DESCRIPCIÓN */}

        <TableCell
          sx={{
            minWidth:
              250
          }}
        >

          <Typography
            variant="body2"
          >
            {order.product}
          </Typography>

        </TableCell>


        {/* CLIENTE */}

        <TableCell>

          {
            order.customer ||
            "-"
          }

        </TableCell>


        {/* SKU */}

        <TableCell>

          <Typography
            variant="body2"
            sx={{
              whiteSpace:
                "nowrap"
            }}
          >
            {order.sku}
          </Typography>

        </TableCell>


        {/* PEDIDO VENTA */}

        <TableCell>

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

        </TableCell>


        {/* PLANTILLA */}

        <TableCell>

          {
            getTemplateName(
              order.templateId
            )
          }

        </TableCell>


        {/* IMPRESAS */}

        <TableCell
          align="center"
        >

          {order.printed}

        </TableCell>


        {/* ESTADO */}

        <TableCell
          align="center"
        >

          <Chip
            color={
              order.status ===
                "ABIERTA"

                ? "success"

                : "default"
            }
            label={
              order.status
            }
            size="small"
          />

        </TableCell>


        {/* ACCIONES */}

        <TableCell
          align="center"
        >

          <Stack
            direction="row"
            justifyContent="center"
            spacing={0.5}
          >

            <Tooltip
              title="Editar / gestionar orden"
            >

              <IconButton
                color="primary"
                onClick={
                  () =>
                    manageOrder(
                      order
                    )
                }
              >
                <EditIcon />
              </IconButton>

            </Tooltip>


            <Tooltip
              title="Eliminar orden"
            >

              <IconButton
                color="error"
                onClick={
                  () =>
                    askRemoveOrder(
                      order
                    )
                }
              >
                <DeleteIcon />
              </IconButton>

            </Tooltip>

          </Stack>

        </TableCell>

      </TableRow>

    );

  }


  /*
   * ==================================================
   * CABECERA TABLA
   * ==================================================
   */

  function renderTableHead() {

    return (

      <TableHead>

        <TableRow
          sx={{
            backgroundColor:
              "#F8FAF9"
          }}
        >

          <TableCell
            align="center"
            sx={{
              fontWeight:
                700
            }}
          >
            #
          </TableCell>


          <TableCell
            sx={{
              fontWeight:
                700
            }}
          >
            OF
          </TableCell>


          <TableCell
            sx={{
              fontWeight:
                700
            }}
          >
            Marcaje
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700,

              whiteSpace:
                "nowrap"
            }}
          >
            Cant. / R-B
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700,

              whiteSpace:
                "nowrap"
            }}
          >
            Total M / UN
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700,

              whiteSpace:
                "nowrap"
            }}
          >
            Nº R/B Tot
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700,

              whiteSpace:
                "nowrap"
            }}
          >
            Nº R/B Pen
          </TableCell>


          <TableCell
            sx={{
              fontWeight:
                700
            }}
          >
            Descripción
          </TableCell>


          <TableCell
            sx={{
              fontWeight:
                700
            }}
          >
            Cliente
          </TableCell>


          <TableCell
            sx={{
              fontWeight:
                700
            }}
          >
            SKU
          </TableCell>


          <TableCell
            sx={{
              fontWeight:
                700,

              whiteSpace:
                "nowrap"
            }}
          >
            Pedido venta
          </TableCell>


          <TableCell
            sx={{
              fontWeight:
                700
            }}
          >
            Plantilla
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700
            }}
          >
            Impresas
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700
            }}
          >
            Estado
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700
            }}
          >
            Acciones
          </TableCell>

        </TableRow>

      </TableHead>

    );

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box>

      <BackButton
        showBack={false}
      />


      {/* CABECERA */}

      <Box
        sx={{
          mb:
            3,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            2,

          flexWrap:
            "wrap"
        }}
      >

        <Box
          sx={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              2
          }}
        >

          <PrecisionManufacturingIcon
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
              Producción
            </Typography>


            <Typography
              color="text.secondary"
              sx={{
                mt:
                  0.5
              }}
            >
              Gestión de órdenes de producción
            </Typography>

          </Box>

        </Box>


        <Button
          variant="contained"
          color="success"
          onClick={
            newOrder
          }
          sx={{
            fontWeight:
              700
          }}
        >
          + Nueva Orden
        </Button>

      </Box>


      {/* SIN ÓRDENES */}

      {
        orders.length ===
          0 &&
        (

          <Card>

            <CardContent>

              <Box
                sx={{
                  py:
                    6,

                  textAlign:
                    "center"
                }}
              >

                <PrecisionManufacturingIcon
                  sx={{
                    fontSize:
                      52,

                    color:
                      "text.disabled",

                    mb:
                      1
                  }}
                />


                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  No existen órdenes
                </Typography>


                <Typography
                  color="text.secondary"
                >
                  Crea una nueva orden de producción para comenzar.
                </Typography>

              </Box>

            </CardContent>

          </Card>

        )
      }


      {/* LÍNEAS */}

      {
        orders.length >
          0 &&
        (

          <>

            <Paper
              elevation={0}
              sx={{
                mb:
                  2.5,

                border:
                  "1px solid #E0E0E0",

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
                    "#F8FAF8",

                  "& .MuiTabs-indicator": {
                    backgroundColor:
                      "#0B7A3B",

                    height:
                      4
                  },

                  "& .MuiTab-root": {
                    fontWeight:
                      700,

                    minHeight:
                      64,

                    minWidth:
                      0
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


            {/* TABLA DE LÍNEA */}

            <Card
              sx={{
                overflow:
                  "hidden",

                border:
                  "1px solid",

                borderColor:
                  "divider"
              }}
            >

              <Box
                sx={{
                  px:
                    2.5,

                  py:
                    1.7,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    1.5,

                  flexWrap:
                    "wrap",

                  backgroundColor:
                    "#E8F3EB",

                  borderBottom:
                    "1px solid",

                  borderColor:
                    "divider"
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

                    whiteSpace:
                      "nowrap"
                  }}
                >
                  LÍNEA {selectedLine}
                </Typography>


                {
                  lineComments

                    ? (

                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                        sx={{
                          flex:
                            1,

                          minWidth:
                            180
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
                          sx={{
                            color:
                              "#D84315"
                          }}
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
                          flex:
                            1
                        }}
                      >
                        Sin comentarios para esta línea
                      </Typography>

                    )
                }


                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    <EditIcon />
                  }
                  onClick={
                    openCommentsDialog
                  }
                  sx={{
                    fontWeight:
                      700,

                    whiteSpace:
                      "nowrap",

                    backgroundColor:
                      "#FFFFFF"
                  }}
                >
                  EDITAR COMENTARIO
                </Button>


                <Chip
                  label={
                    lineOrders.length ===
                      1

                      ? "1 orden"

                      : `${lineOrders.length} órdenes`
                  }
                  size="small"
                  sx={{
                    fontWeight:
                      700,

                    backgroundColor:
                      "#FFFFFF"
                  }}
                />

              </Box>


              {
                lineOrders.length ===
                  0

                  ? (

                    <Box
                      sx={{
                        py:
                          5,

                        textAlign:
                          "center"
                      }}
                    >

                      <FactoryIcon
                        sx={{
                          fontSize:
                            46,

                          color:
                            "text.disabled",

                          mb:
                            1
                        }}
                      />


                      <Typography
                        color="text.secondary"
                      >
                        No hay órdenes en la Línea {selectedLine}.
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

                      <Table
                        sx={{
                          minWidth:
                            1920
                        }}
                      >

                        {
                          renderTableHead()
                        }


                        <TableBody>

                          {
                            lineOrders.map(
                              (
                                order,
                                index
                              ) =>
                                renderOrderRow(
                                  order,
                                  index +
                                    1
                                )
                            )
                          }

                        </TableBody>

                      </Table>

                    </Box>

                  )
              }

            </Card>

          </>

        )
      }


      {/* SIN LÍNEA */}

      {
        unassignedOrders.length >
          0 &&
        (

          <Card
            sx={{
              mt:
                3,

              overflow:
                "hidden",

              border:
                "1px solid",

              borderColor:
                "warning.main"
            }}
          >

            <Box
              sx={{
                px:
                  2.5,

                py:
                  1.7,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                backgroundColor:
                  "#FFF8E1"
              }}
            >

              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >

                <WarningAmberIcon
                  color="warning"
                />


                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  SIN LÍNEA ASIGNADA
                </Typography>

              </Stack>


              <Chip
                label={
                  unassignedOrders.length ===
                    1

                    ? "1 orden"

                    : `${unassignedOrders.length} órdenes`
                }
                size="small"
                color="warning"
                variant="outlined"
                sx={{
                  backgroundColor:
                    "#FFFFFF"
                }}
              />

            </Box>


            <Box
              sx={{
                overflowX:
                  "auto"
              }}
            >

              <Table
                sx={{
                  minWidth:
                    1920
                }}
              >

                {
                  renderTableHead()
                }


                <TableBody>

                  {
                    unassignedOrders.map(
                      (
                        order,
                        index
                      ) =>
                        renderOrderRow(
                          order,
                          index +
                            1
                        )
                    )
                  }

                </TableBody>

              </Table>

            </Box>

          </Card>

        )
      }


      {/* NUEVA ORDEN */}

      <ProductionDialog
        open={
          openDialog
        }
        editing={
          editing
        }
        onClose={
          () => {

            setOpenDialog(
              false
            );


            setEditing(
              undefined
            );

          }
        }
        onSave={
          saveOrder
        }
      />


      {/* EDITAR / GESTIONAR */}

      <ProductionManageDialog
        open={
          Boolean(
            managing
          )
        }
        order={
          managing ??
          null
        }
        onClose={
          () =>
            setManaging(
              undefined
            )
        }
        onSave={
          saveOrder
        }
      />


      {/* COMENTARIO DE LÍNEA */}

      <Dialog
        open={
          commentsDialogOpen
        }
        onClose={
          closeCommentsDialog
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Comentario Línea {selectedLine}
        </DialogTitle>


        <DialogContent>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt:
                0.5,

              mb:
                2
            }}
          >
            Este comentario pertenece a toda la Línea {selectedLine} y se sincronizará con Supabase.
          </Typography>


          {
            commentsError &&
            (

              <Alert
                severity="error"
                sx={{
                  mb:
                    2
                }}
              >
                {commentsError}
              </Alert>

            )
          }


          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            disabled={
              savingComments
            }
            label={`Comentario Línea ${selectedLine}`}
            placeholder="Ej.: Palets nuevos 20 bobinas"
            value={
              commentsDraft
            }
            onChange={
              event =>
                setCommentsDraft(
                  event.target.value
                )
            }
          />

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              closeCommentsDialog
            }
            disabled={
              savingComments
            }
          >
            CANCELAR
          </Button>


          <Button
            variant="contained"
            color="success"
            onClick={
              () =>
                void saveLineComments()
            }
            disabled={
              savingComments
            }
          >

            {
              savingComments
                ? "GUARDANDO..."
                : "GUARDAR"
            }

          </Button>

        </DialogActions>

      </Dialog>


      {/* ELIMINAR */}

      <Dialog
        open={
          Boolean(
            orderToDelete
          )
        }
        onClose={
          cancelRemoveOrder
        }
        fullWidth
        maxWidth="xs"
      >

        <DialogTitle>

          <Box
            sx={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                1.5
            }}
          >

            <WarningAmberIcon
              color="error"
            />


            <Typography
              variant="h6"
              fontWeight={700}
            >
              Eliminar orden
            </Typography>

          </Box>

        </DialogTitle>


        <DialogContent>

          <DialogContentText>

            ¿Seguro que deseas eliminar la orden de producción{" "}

            <strong>
              {orderToDelete?.order}
            </strong>

            ?

            <br />
            <br />

            Esta acción no se puede deshacer.

          </DialogContentText>

        </DialogContent>


        <DialogActions
          sx={{
            px:
              3,

            pb:
              3
          }}
        >

          <Button
            onClick={
              cancelRemoveOrder
            }
            color="inherit"
          >
            CANCELAR
          </Button>


          <Button
            variant="contained"
            color="error"
            startIcon={
              <DeleteIcon />
            }
            onClick={
              confirmRemoveOrder
            }
          >
            ELIMINAR
          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}