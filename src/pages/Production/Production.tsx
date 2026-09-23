import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FactoryIcon from "@mui/icons-material/Factory";

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


/*
 * ==================================================
 * LÍNEAS DE PRODUCCIÓN
 * ==================================================
 */

const PRODUCTION_LINES =
  [
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
   * CARGAR ÓRDENES
   * ==================================================
   */

  useEffect(
    () => {

      loadOrders();

    },
    []
  );


  function loadOrders() {

    setOrders(
      getOrders()
    );

  }


  /*
   * ==================================================
   * GUARDAR ORDEN
   * ==================================================
   *
   * IMPORTANTE:
   *
   * Utilizamos addOrder / updateOrder del
   * OrderStorage.
   *
   * De esta forma:
   *
   * - Las órdenes nuevas se colocan al final
   *   de la línea seleccionada.
   *
   * - Si cambiamos una orden de línea,
   *   se reorganizan las dos líneas.
   *
   * - planningPosition se mantiene correctamente.
   *
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

    } else {

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
   * EDITAR ORDEN
   * ==================================================
   */

  function editOrder(
    order: ProductionOrder
  ) {

    setEditing(
      order
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
   * SOLICITAR ELIMINAR ORDEN
   * ==================================================
   */

  function askRemoveOrder(
    order: ProductionOrder
  ) {

    setOrderToDelete(
      order
    );

  }


  /*
   * ==================================================
   * CANCELAR ELIMINACIÓN
   * ==================================================
   */

  function cancelRemoveOrder() {

    setOrderToDelete(
      undefined
    );

  }


  /*
   * ==================================================
   * CONFIRMAR ELIMINACIÓN
   * ==================================================
   */

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
   * ORDENAR ÓRDENES DE UNA LÍNEA
   * ==================================================
   */

  function getLineOrders(
    productionLine: number
  ) {

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
          productionLine
      )
      .sort(
        (
          a,
          b
        ) => {

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

  }


  /*
   * ==================================================
   * LÍNEAS CON ÓRDENES
   * ==================================================
   *
   * Solo mostramos bloques para las líneas
   * que actualmente tienen órdenes.
   *
   * ==================================================
   */

  const linesWithOrders =
    useMemo(
      () => {

        return PRODUCTION_LINES
          .map(
            line => ({
              line,
              orders:
                orders
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
                      line
                  )
                  .sort(
                    (
                      a,
                      b
                    ) => {

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
                  )
            })
          )
          .filter(
            group =>
              group.orders.length >
              0
          );

      },
      [
        orders
      ]
    );


  /*
   * ==================================================
   * ÓRDENES SIN LÍNEA
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
        order.rolls -
        order.printed
      );


    return (

      <TableRow
        key={
          order.id
        }
        hover
        sx={{
          "&:last-child td":
            {
              borderBottom:
                "none"
            }
        }}
      >

        {/* POSICIÓN */}

        <TableCell
          align="center"
          sx={{
            width: 65
          }}
        >

          <Chip
            label={
              `#${position}`
            }
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              minWidth: 44
            }}
          />

        </TableCell>


        {/* ORDEN */}

        <TableCell>

          <Typography
            fontWeight={600}
          >

            {order.order}

          </Typography>

        </TableCell>


        {/* SKU */}

        <TableCell>

          {order.sku}

        </TableCell>


        {/* PRODUCTO */}

        <TableCell
          sx={{
            minWidth: 220
          }}
        >

          {order.product}

        </TableCell>


        {/* PLANTILLA */}

        <TableCell>

          {getTemplateName(
            order.templateId
          )}

        </TableCell>


        {/* ROLLOS */}

        <TableCell
          align="center"
        >

          {order.rolls}

        </TableCell>


        {/* IMPRESOS */}

        <TableCell
          align="center"
        >

          {order.printed}

        </TableCell>


        {/* PENDIENTES */}

        <TableCell
          align="center"
        >

          <Typography
            fontWeight={
              pending > 0
                ? 700
                : 400
            }
          >

            {pending}

          </Typography>

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
          />

        </TableCell>


        {/* ACCIONES */}

        <TableCell
          align="center"
        >

          <Stack
            direction="row"
            justifyContent="center"
          >

            <IconButton
              color="primary"
              onClick={
                () =>
                  editOrder(
                    order
                  )
              }
            >

              <EditIcon />

            </IconButton>


            <IconButton
              color="secondary"
              onClick={
                () =>
                  manageOrder(
                    order
                  )
              }
            >

              <SettingsIcon />

            </IconButton>


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

          </Stack>

        </TableCell>

      </TableRow>

    );

  }


  /*
   * ==================================================
   * CABECERA DE TABLA
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
              fontWeight: 700
            }}
          >

            #

          </TableCell>


          <TableCell
            sx={{
              fontWeight: 700
            }}
          >

            Orden SAP

          </TableCell>


          <TableCell
            sx={{
              fontWeight: 700
            }}
          >

            SKU

          </TableCell>


          <TableCell
            sx={{
              fontWeight: 700
            }}
          >

            Producto

          </TableCell>


          <TableCell
            sx={{
              fontWeight: 700
            }}
          >

            Plantilla

          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight: 700
            }}
          >

            Rollos

          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight: 700
            }}
          >

            Impresos

          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight: 700
            }}
          >

            Pendientes

          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight: 700
            }}
          >

            Estado

          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight: 700
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
   * PANTALLA
   * ==================================================
   */

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
          mb: 3,

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap: 2,

          flexWrap:
            "wrap"
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
              sx={{
                mt: 0.5
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
            fontWeight: 700
          }}
        >

          + Nueva Orden

        </Button>

      </Box>


      {/* =============================================
          SIN ÓRDENES
          ============================================= */}

      {orders.length === 0 && (

        <Card>

          <CardContent>

            <Box
              sx={{
                py: 6,
                textAlign:
                  "center"
              }}
            >

              <PrecisionManufacturingIcon
                sx={{
                  fontSize: 52,
                  color:
                    "text.disabled",
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
                sx={{
                  mt: 0.5
                }}
              >

                Crea una nueva orden de producción para comenzar.

              </Typography>

            </Box>

          </CardContent>

        </Card>

      )}


      {/* =============================================
          ÓRDENES AGRUPADAS POR LÍNEA
          ============================================= */}

      <Stack
        spacing={3}
      >

        {linesWithOrders.map(
          group => {

            /*
             * Dejamos esta llamada para que
             * toda la lógica de ordenación
             * permanezca centralizada también
             * en esta pantalla.
             */

            const lineOrders =
              getLineOrders(
                group.line
              );


            return (

              <Card
                key={
                  group.line
                }
                sx={{
                  overflow:
                    "hidden",
                  border:
                    "1px solid",
                  borderColor:
                    "divider"
                }}
              >

                {/* CABECERA DE LÍNEA */}

                <Box
                  sx={{
                    px: 2.5,
                    py: 1.7,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    gap: 2,

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

                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
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
                          "#0B7A3B"
                      }}
                    >

                      LÍNEA {group.line}

                    </Typography>

                  </Stack>


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
                      backgroundColor:
                        "white"
                    }}
                  />

                </Box>


                {/* TABLA */}

                <Box
                  sx={{
                    overflowX:
                      "auto"
                  }}
                >

                  <Table>

                    {renderTableHead()}


                    <TableBody>

                      {lineOrders.map(
                        (
                          order,
                          index
                        ) =>
                          renderOrderRow(
                            order,
                            index + 1
                          )
                      )}

                    </TableBody>

                  </Table>

                </Box>

              </Card>

            );

          }
        )}


        {/* =============================================
            SIN LÍNEA ASIGNADA
            ============================================= */}

        {unassignedOrders.length >
          0 && (

          <Card
            sx={{
              overflow:
                "hidden",

              border:
                "1px solid",

              borderColor:
                "warning.main"
            }}
          >

            {/* CABECERA */}

            <Box
              sx={{
                px: 2.5,
                py: 1.7,

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap: 2,

                flexWrap:
                  "wrap",

                backgroundColor:
                  "#FFF8E1",

                borderBottom:
                  "1px solid",

                borderColor:
                  "divider"
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
                  fontWeight: 700,
                  backgroundColor:
                    "white"
                }}
              />

            </Box>


            {/* TABLA */}

            <Box
              sx={{
                overflowX:
                  "auto"
              }}
            >

              <Table>

                {renderTableHead()}


                <TableBody>

                  {unassignedOrders.map(
                    (
                      order,
                      index
                    ) =>
                      renderOrderRow(
                        order,
                        index + 1
                      )
                  )}

                </TableBody>

              </Table>

            </Box>

          </Card>

        )}

      </Stack>


      {/* =============================================
          NUEVA / EDITAR ORDEN
          ============================================= */}

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


      {/* =============================================
          GESTIONAR ORDEN
          ============================================= */}

      <ProductionManageDialog
        open={
          Boolean(
            managing
          )
        }
        order={
          managing
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


      {/* =============================================
          CONFIRMAR ELIMINACIÓN
          ============================================= */}

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
              display: "flex",
              alignItems: "center",
              gap: 1.5
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
            px: 3,
            pb: 3
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