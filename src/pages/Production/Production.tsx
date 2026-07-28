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

import ProductionDialog from "../../components/production/ProductionDialog";

import type { ProductionOrder } from "../../services/OrderStorage";

import {
  getOrders,
  saveOrders,
  deleteOrder
} from "../../services/OrderStorage";

export default function Production() {

  const [orders, setOrders] = useState<ProductionOrder[]>([]);

  const [openDialog, setOpenDialog] = useState(false);

  const [editing, setEditing] = useState<ProductionOrder | undefined>();

  useEffect(() => {

    loadOrders();

  }, []);

  function loadOrders() {

    setOrders(getOrders());

  }

  function saveOrder(order: ProductionOrder) {

    const all = getOrders();

    const index = all.findIndex(x => x.id === order.id);

    if (index >= 0) {

      all[index] = order;

    } else {

      all.push(order);

    }

    saveOrders(all);

    loadOrders();

    setOpenDialog(false);

    setEditing(undefined);

  }

  function newOrder() {

    setEditing(undefined);

    setOpenDialog(true);

  }

  function editOrder(order: ProductionOrder) {

    setEditing(order);

    setOpenDialog(true);

  }

  function removeOrder(id: number) {

    if (!window.confirm("¿Eliminar esta orden?")) return;

    deleteOrder(id);

    loadOrders();

  }

  return (

    <Box>

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

      <Card>

        <CardContent>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>Orden SAP</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Plantilla</TableCell>

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

              {orders.map(order => (

                <TableRow
                  key={order.id}
                  hover
                >

                  <TableCell>{order.order}</TableCell>
                  <TableCell>{order.sku}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.template}</TableCell>

                  <TableCell align="center">
                    {order.rolls}
                  </TableCell>

                  <TableCell align="center">
                    {order.printed}
                  </TableCell>

                  <TableCell align="center">
                    {order.rolls - order.printed}
                  </TableCell>

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

                  <TableCell align="center">

                    <IconButton
                      color="primary"
                      onClick={() => editOrder(order)}
                    >

                      <EditIcon />

                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => removeOrder(order.id)}
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

      <ProductionDialog
        open={openDialog}
        editing={editing}
        onClose={() => {
          setOpenDialog(false);
          setEditing(undefined);
        }}
        onSave={saveOrder}
      />

    </Box>

  );

}