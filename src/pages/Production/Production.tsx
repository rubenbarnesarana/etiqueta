import { useEffect, useState } from "react";

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
  IconButton
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";

import ProductionDialog from "../../components/production/ProductionDialog";
import ProductionManageDialog from "../../components/production/ProductionManageDialog";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  getOrders,
  saveOrders,
  deleteOrder
} from "../../services/OrderStorage";

import {
  getTemplates
} from "../../services/TemplateStorage";

export default function Production() {

  const [orders, setOrders] =
    useState<ProductionOrder[]>([]);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [editing, setEditing] =
    useState<ProductionOrder | undefined>();

  const [managing, setManaging] =
    useState<ProductionOrder | undefined>();

  useEffect(() => {

    loadOrders();

  }, []);

  function loadOrders() {

    setOrders(getOrders());

  }

  function saveOrder(order: ProductionOrder) {

    const all = getOrders();

    const index =
      all.findIndex(
        x => Number(x.id) === Number(order.id)
      );

    if (index >= 0) {

      all[index] = order;

    } else {

      all.push(order);

    }

    saveOrders(all);

    loadOrders();

    setOpenDialog(false);

    setEditing(undefined);

    setManaging(undefined);

  }

  function newOrder() {

    setEditing(undefined);

    setOpenDialog(true);

  }

  function editOrder(order: ProductionOrder) {

    setEditing(order);

    setOpenDialog(true);

  }

  function manageOrder(order: ProductionOrder) {

    setManaging(order);

  }

  function removeOrder(id: number) {

    if (!window.confirm("¿Eliminar esta orden?")) {
      return;
    }

    deleteOrder(id);

    loadOrders();

  }

  function getTemplateName(
    templateId: number
  ): string {

    const templates = getTemplates();

    const template =
      templates.find(
        t => Number(t.id) === Number(templateId)
      );

    return template?.name ?? "-";

  }

  return (

    <Box>

      {/* CABECERA */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >

        <Typography
          variant="h4"
          fontWeight="bold"
        >
          🏭 Producción
        </Typography>

        <Button
          variant="contained"
          color="success"
          onClick={newOrder}
        >
          + Nueva Orden
        </Button>

      </Stack>


      {/* TABLA */}

      <Card>

        <CardContent>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>
                  Orden SAP
                </TableCell>

                <TableCell>
                  SKU
                </TableCell>

                <TableCell>
                  Producto
                </TableCell>

                <TableCell>
                  Plantilla
                </TableCell>

                <TableCell align="center">
                  Rollos
                </TableCell>

                <TableCell align="center">
                  Impresos
                </TableCell>

                <TableCell align="center">
                  Pendientes
                </TableCell>

                <TableCell align="center">
                  Estado
                </TableCell>

                <TableCell align="center">
                  Acciones
                </TableCell>

              </TableRow>

            </TableHead>


            <TableBody>

              {/* SIN ORDENES */}

              {orders.length === 0 && (

                <TableRow>

                  <TableCell
                    colSpan={9}
                    align="center"
                  >
                    No existen órdenes.
                  </TableCell>

                </TableRow>

              )}


              {/* ORDENES */}

              {orders.map(order => (

                <TableRow
                  key={order.id}
                  hover
                >

                  <TableCell>
                    {order.order}
                  </TableCell>


                  <TableCell>
                    {order.sku}
                  </TableCell>


                  <TableCell>
                    {order.product}
                  </TableCell>


                  {/* PLANTILLA */}

                  <TableCell>

                    {getTemplateName(
                      order.templateId
                    )}

                  </TableCell>


                  {/* ROLLOS */}

                  <TableCell align="center">
                    {order.rolls}
                  </TableCell>


                  {/* IMPRESOS */}

                  <TableCell align="center">
                    {order.printed}
                  </TableCell>


                  {/* PENDIENTES */}

                  <TableCell align="center">

                    {Math.max(
                      0,
                      order.rolls - order.printed
                    )}

                  </TableCell>


                  {/* ESTADO */}

                  <TableCell align="center">

                    <Chip
                      color={
                        order.status === "ABIERTA"
                          ? "success"
                          : "default"
                      }
                      label={order.status}
                    />

                  </TableCell>


                  {/* ACCIONES */}

                  <TableCell align="center">

                    <IconButton
                      color="primary"
                      onClick={() =>
                        editOrder(order)
                      }
                    >
                      <EditIcon />
                    </IconButton>


                    <IconButton
                      color="secondary"
                      onClick={() =>
                        manageOrder(order)
                      }
                    >
                      <SettingsIcon />
                    </IconButton>


                    <IconButton
                      color="error"
                      onClick={() =>
                        removeOrder(order.id)
                      }
                    >
                      <DeleteIcon />
                    </IconButton>

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </CardContent>

      </Card>


      {/* NUEVA / EDITAR ORDEN */}

      <ProductionDialog
        open={openDialog}
        editing={editing}

        onClose={() => {

          setOpenDialog(false);

          setEditing(undefined);

        }}

        onSave={saveOrder}
      />


      {/* GESTIONAR ORDEN */}

      <ProductionManageDialog
        open={Boolean(managing)}
        order={managing}

        onClose={() =>
          setManaging(undefined)
        }

        onSave={saveOrder}
      />

    </Box>

  );

}