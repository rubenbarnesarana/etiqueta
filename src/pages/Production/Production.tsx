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
  DialogActions,
  Tooltip
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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


export default function Production() {

  const [
    orders,
    setOrders
  ] = useState<ProductionOrder[]>([]);


  /*
   * Diálogo para crear una orden nueva.
   */
  const [
    openDialog,
    setOpenDialog
  ] = useState(false);


  /*
   * ProductionDialog sigue utilizando editing,
   * pero desde esta pantalla solamente lo usamos
   * para crear órdenes nuevas.
   */
  const [
    editing,
    setEditing
  ] = useState<
    ProductionOrder |
    undefined
  >();


  /*
   * Orden que estamos gestionando / editando.
   */
  const [
    managing,
    setManaging
  ] = useState<
    ProductionOrder |
    undefined
  >();


  /*
   * Orden pendiente de confirmación de borrado.
   */
  const [
    orderToDelete,
    setOrderToDelete
  ] = useState<
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


      function handleOrdersUpdated() {

        loadOrders();

      }


      window.addEventListener(
        "productionOrdersUpdated",
        handleOrdersUpdated
      );


      return () => {

        window.removeEventListener(
          "productionOrdersUpdated",
          handleOrdersUpdated
        );

      };

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
   * EDITAR / GESTIONAR ORDEN
   * ==================================================
   *
   * Este es ahora el ÚNICO botón de edición.
   *
   * Abre ProductionManageDialog, que permite:
   *
   * - consultar la orden
   * - cambiar impresos
   * - reiniciar
   * - guardar
   *
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
   * SOLICITAR ELIMINAR
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
   * NOMBRE DE PLANTILLA
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
   * ÓRDENES DE UNA LÍNEA
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
   * LÍNEAS QUE TIENEN ÓRDENES
   * ==================================================
   */

  const linesWithOrders =
    useMemo(
      () => {

        return PRODUCTION_LINES
          .map(
            line => {

              const lineOrders =
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
                  );


              return {

                line,

                orders:
                  lineOrders

              };

            }
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
              fontWeight:
                700,

              minWidth:
                44
            }}
          />

        </TableCell>


        {/* ORDEN SAP */}

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
            minWidth:
              220
          }}
        >

          {order.product}

        </TableCell>


        {/* CLIENTE */}

        <TableCell
          sx={{
            minWidth:
              140
          }}
        >

          {order.customer || "-"}

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
              pending >
              0
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
            Orden SAP
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
                700
            }}
          >
            Producto
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
            Plantilla
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700
            }}
          >
            Rollos
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700
            }}
          >
            Impresos
          </TableCell>


          <TableCell
            align="center"
            sx={{
              fontWeight:
                700
            }}
          >
            Pendientes
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
   * PANTALLA
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

      {orders.length ===
        0 && (

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
                sx={{
                  mt:
                    0.5
                }}
              >
                Crea una nueva orden de producción para comenzar.
              </Typography>

            </Box>

          </CardContent>

        </Card>

      )}


      {/* ÓRDENES AGRUPADAS POR LÍNEA */}

      <Stack
        spacing={3}
      >

        {linesWithOrders.map(
          group => {

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

                    gap:
                      2,

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
                      fontWeight:
                        700,

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
                            index +
                            1
                          )
                      )}

                    </TableBody>

                  </Table>

                </Box>

              </Card>

            );

          }
        )}


        {/* SIN LÍNEA ASIGNADA */}

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

                gap:
                  2,

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
                  fontWeight:
                    700,

                  backgroundColor:
                    "white"
                }}
              />

            </Box>


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
                        index +
                        1
                      )
                  )}

                </TableBody>

              </Table>

            </Box>

          </Card>

        )}

      </Stack>


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


      {/* EDITAR / GESTIONAR ORDEN */}

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


      {/* CONFIRMAR ELIMINACIÓN */}

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