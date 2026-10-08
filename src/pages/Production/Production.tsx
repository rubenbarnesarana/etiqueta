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
  deleteOrder,
  getPendingQuantity
} from "../../services/OrderStorage";

import {
  getTemplates
} from "../../services/TemplateStorage";

import {
  getProductionLineSetting,
  loadProductionLineSettingsFromSupabase,
  updateProductionLineComments
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
 * quantity = cantidad por bobina
 *
 * Lo que mostramos en Producción es lo pendiente:
 *
 * R/B pendientes × cantidad por bobina
 */

function getOrderPendingAmount(
  order: ProductionOrder
): number {

  const pendingRolls =
    Math.max(
      0,
      Number(
        getPendingQuantity(
          order
        )
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
    pendingRolls *
    quantityPerRoll
  );

}


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


  function newOrder() {

    setEditing(
      undefined
    );


    setOpenDialog(
      true
    );

  }


  function manageOrder(
    order: ProductionOrder
  ) {

    setManaging(
      order
    );

  }


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


  function getTemplateName(
    templateId: number
  ): string {

    const template =
      getTemplates().find(
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


  const unassignedOrders =
    useMemo(
      () =>
        orders.filter(
          order =>
            order.productionLine <
              1 ||
            order.productionLine >
              8
        ),
      [
        orders
      ]
    );


  function getLineOrderCount(
    line: number
  ): number {

    return orders.filter(
      order =>
        order.productionLine ===
        line
    ).length;

  }


  const commonCellSx = {
    px: 0.7,
    py: 1.2,
    overflow: "hidden",
    verticalAlign: "middle"
  };


  const headCellSx = {
    ...commonCellSx,
    fontWeight: 800,
    fontSize: 12,
    lineHeight: 1.15,
    whiteSpace: "normal"
  };


  function renderOrderRow(
    order: ProductionOrder,
    position: number
  ) {

    const pending =
      getPendingQuantity(
        order
      );


    const unit:
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


    const pendingAmount =
      getOrderPendingAmount(
        order
      );


    return (

      <TableRow
        key={
          order.id
        }
        hover
      >

        <TableCell
          align="center"
          sx={commonCellSx}
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
              fontWeight: 700,
              minWidth: 36
            }}
          />

        </TableCell>


        <TableCell
          sx={commonCellSx}
        >

          <Typography
            fontWeight={800}
            fontSize={13}
            title={
              order.order
            }
            sx={{
              whiteSpace: "nowrap"
            }}
          >
            {order.order}
          </Typography>

        </TableCell>


        <TableCell
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            fontWeight={700}
            title={
              order.marking ||
              "-"
            }
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {
              order.marking ||
              "-"
            }
          </Typography>

        </TableCell>


        <TableCell
          align="center"
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              whiteSpace: "nowrap"
            }}
          >
            {
              formatQuantity(
                quantityPerRoll,
                unit
              )
            }
          </Typography>

        </TableCell>


        {/*
         * METROS / UNIDADES PENDIENTES
         */}

        <TableCell
          align="center"
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            fontWeight={900}
            sx={{
              color: "#0B7A3B",
              whiteSpace: "nowrap"
            }}
          >
            {
              formatQuantity(
                pendingAmount,
                unit
              )
            }
          </Typography>

        </TableCell>


        <TableCell
          align="center"
          sx={commonCellSx}
        >

          <Typography
            fontWeight={800}
            fontSize={13}
          >
            {order.rolls}
          </Typography>

        </TableCell>


        <TableCell
          align="center"
          sx={commonCellSx}
        >

          <Typography
            fontWeight={900}
            fontSize={13}
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


        <TableCell
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            title={
              order.product
            }
            sx={{
              lineHeight: 1.25,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word"
            }}
          >
            {order.product}
          </Typography>

        </TableCell>


        <TableCell
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            title={
              order.customer ||
              "-"
            }
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {
              order.customer ||
              "-"
            }
          </Typography>

        </TableCell>


        <TableCell
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            title={
              order.sku
            }
            sx={{
              whiteSpace: "nowrap",
              fontSize: 12.5
            }}
          >
            {order.sku}
          </Typography>

        </TableCell>


        <TableCell
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            fontWeight={700}
            title={
              order.salesOrder ||
              "-"
            }
            sx={{
              whiteSpace: "nowrap",
              fontSize: 12.5
            }}
          >
            {
              order.salesOrder ||
              "-"
            }
          </Typography>

        </TableCell>


        <TableCell
          sx={commonCellSx}
        >

          <Typography
            variant="body2"
            title={
              getTemplateName(
                order.templateId
              )
            }
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {
              getTemplateName(
                order.templateId
              )
            }
          </Typography>

        </TableCell>


        <TableCell
          align="center"
          sx={commonCellSx}
        >
          {order.printed}
        </TableCell>


        <TableCell
          align="center"
          sx={commonCellSx}
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
            sx={{
              fontSize: 11
            }}
          />

        </TableCell>


        <TableCell
          align="center"
          sx={commonCellSx}
        >

          <Stack
            direction="row"
            justifyContent="center"
            spacing={0}
          >

            <Tooltip
              title="Editar / gestionar orden"
            >

              <IconButton
                size="small"
                color="primary"
                onClick={
                  () =>
                    manageOrder(
                      order
                    )
                }
              >
                <EditIcon
                  fontSize="small"
                />
              </IconButton>

            </Tooltip>


            <Tooltip
              title="Eliminar orden"
            >

              <IconButton
                size="small"
                color="error"
                onClick={
                  () =>
                    askRemoveOrder(
                      order
                    )
                }
              >
                <DeleteIcon
                  fontSize="small"
                />
              </IconButton>

            </Tooltip>

          </Stack>

        </TableCell>

      </TableRow>

    );

  }


  function renderTableHead() {

    return (

      <TableHead>

        <TableRow
          sx={{
            backgroundColor: "#F8FAF9"
          }}
        >

          <TableCell
            align="center"
            sx={headCellSx}
          >
            #
          </TableCell>

          <TableCell
            sx={headCellSx}
          >
            OF
          </TableCell>

          <TableCell
            sx={headCellSx}
          >
            Marcaje
          </TableCell>

          <TableCell
            align="center"
            sx={headCellSx}
          >
            Cant. / R-B
          </TableCell>

          <TableCell
            align="center"
            sx={headCellSx}
          >
            Metros / Unid.
          </TableCell>

          <TableCell
            align="center"
            sx={headCellSx}
          >
            Nº R/B Tot
          </TableCell>

          <TableCell
            align="center"
            sx={headCellSx}
          >
            Nº R/B Pen
          </TableCell>

          <TableCell
            sx={headCellSx}
          >
            Descripción
          </TableCell>

          <TableCell
            sx={headCellSx}
          >
            Cliente
          </TableCell>

          <TableCell
            sx={headCellSx}
          >
            SKU
          </TableCell>

          <TableCell
            sx={headCellSx}
          >
            Pedido venta
          </TableCell>

          <TableCell
            sx={headCellSx}
          >
            Plantilla
          </TableCell>

          <TableCell
            align="center"
            sx={headCellSx}
          >
            Impresas
          </TableCell>

          <TableCell
            align="center"
            sx={headCellSx}
          >
            Estado
          </TableCell>

          <TableCell
            align="center"
            sx={headCellSx}
          >
            Acciones
          </TableCell>

        </TableRow>

      </TableHead>

    );

  }


  function renderProductionTable(
    tableOrders: ProductionOrder[]
  ) {

    return (

      <Box
        sx={{
          width: "100%",
          overflow: "hidden"
        }}
      >

        <Table
          size="small"
          sx={{
            width: "100%",
            tableLayout: "fixed"
          }}
        >

          <colgroup>

            <col style={{ width: "2.5%" }} />
            <col style={{ width: "8.5%" }} />
            <col style={{ width: "6.5%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "7.5%" }} />
            <col style={{ width: "4.5%" }} />
            <col style={{ width: "4.5%" }} />
            <col style={{ width: "17.5%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "6.5%" }} />
            <col style={{ width: "7.5%" }} />
            <col style={{ width: "5.5%" }} />
            <col style={{ width: "4.5%" }} />
            <col style={{ width: "6.5%" }} />
            <col style={{ width: "6%" }} />

          </colgroup>


          {
            renderTableHead()
          }


          <TableBody>

            {
              tableOrders.map(
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

    );

  }


  return (

    <Box
      sx={{
        width: "100%",
        minWidth: 0
      }}
    >

      <BackButton
        showBack={false}
      />


      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap"
        }}
      >

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2
          }}
        >

          <PrecisionManufacturingIcon
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
              Producción
            </Typography>


            <Typography
              color="text.secondary"
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
            fontWeight: 700
          }}
        >
          + NUEVA ORDEN
        </Button>

      </Box>


      {
        orders.length ===
          0 &&
        (

          <Card>

            <CardContent>

              <Box
                sx={{
                  py: 6,
                  textAlign: "center"
                }}
              >

                <PrecisionManufacturingIcon
                  sx={{
                    fontSize: 52,
                    color: "text.disabled",
                    mb: 1
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


      {
        orders.length >
          0 &&
        (

          <>

            <Paper
              elevation={0}
              sx={{
                mb: 2.5,
                border: "1px solid #E0E0E0",
                borderRadius: 2,
                overflow: "hidden"
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
                  backgroundColor: "#F8FAF8",

                  "& .MuiTabs-indicator": {
                    backgroundColor: "#0B7A3B",
                    height: 4
                  },

                  "& .MuiTab-root": {
                    fontWeight: 700,
                    minHeight: 64,
                    minWidth: 0
                  },

                  "& .Mui-selected": {
                    color: "#0B7A3B !important"
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
                                  minWidth: 27,
                                  height: 27,
                                  px: 0.5,
                                  borderRadius: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 900,

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


            <Card
              sx={{
                width: "100%",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider"
              }}
            >

              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  backgroundColor: "#E8F3EB",
                  borderBottom: "1px solid",
                  borderColor: "divider"
                }}
              >

                <FactoryIcon
                  sx={{
                    color: "#0B7A3B"
                  }}
                />


                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#0B7A3B"
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
                          flex: 1
                        }}
                      >

                        <CommentIcon
                          sx={{
                            fontSize: 18,
                            color: "#D84315"
                          }}
                        />


                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="#D84315"
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
                          flex: 1
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
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    backgroundColor: "#FFFFFF"
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
                    fontWeight: 700,
                    backgroundColor: "#FFFFFF"
                  }}
                />

              </Box>


              {
                lineOrders.length ===
                  0

                  ? (

                    <Box
                      sx={{
                        py: 5,
                        textAlign: "center"
                      }}
                    >

                      <Typography
                        color="text.secondary"
                      >
                        No hay órdenes en la Línea {selectedLine}.
                      </Typography>

                    </Box>

                  )

                  : renderProductionTable(
                      lineOrders
                    )
              }

            </Card>

          </>

        )
      }


      {
        unassignedOrders.length >
          0 &&
        (

          <Card
            sx={{
              mt: 3,
              width: "100%",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "warning.main"
            }}
          >

            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FFF8E1"
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

            </Box>


            {
              renderProductionTable(
                unassignedOrders
              )
            }

          </Card>

        )
      }


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

          {
            commentsError &&
            (

              <Alert
                severity="error"
                sx={{
                  mb: 2
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
            GUARDAR
          </Button>

        </DialogActions>

      </Dialog>


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
          Eliminar orden
        </DialogTitle>


        <DialogContent>

          <DialogContentText>
            ¿Seguro que deseas eliminar la orden{" "}
            <strong>
              {orderToDelete?.order}
            </strong>
            ?
          </DialogContentText>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              cancelRemoveOrder
            }
          >
            CANCELAR
          </Button>


          <Button
            variant="contained"
            color="error"
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