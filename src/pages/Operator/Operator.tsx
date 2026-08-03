import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import LabelPreview from "../../components/print/LabelPreview";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  findOrder
} from "../../services/OrderStorage";

import {
  printLabel
} from "../../services/PrintService";

import type {
  DesignerElement
} from "../../components/designer/DesignerTypes";

export default function Operator() {

  const [orderNumber, setOrderNumber] =
    useState("");

  const [order, setOrder] =
    useState<ProductionOrder | null>(null);

  const [error, setError] =
    useState("");

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [finishedOpen, setFinishedOpen] =
    useState(false);

  const [label, setLabel] =
    useState<DesignerElement[]>([]);

  //--------------------------------------------------
  // CARGAR ORDEN
  //--------------------------------------------------

  function loadOrder() {

    const productionOrder =
      findOrder(orderNumber);

    if (!productionOrder) {

      setError("Orden no encontrada");

      setOrder(null);

      return;

    }

    setError("");

    setOrder(productionOrder);

  }

  //--------------------------------------------------
  // IMPRIMIR
  //--------------------------------------------------

  function printCurrentLabel() {

    if (!order) return;

    const result =
      printLabel(order);

    if (!result.success) {

      alert(result.message);

      return;

    }

    setLabel(result.label ?? []);

    setPreviewOpen(true);

    const updated =
      findOrder(order.order);

    if (updated) {

      setOrder(updated);

    }

    //--------------------------------------------------
    // ÚLTIMA ETIQUETA
    //--------------------------------------------------

    if (result.finished) {

      setFinishedOpen(true);

    }

  }  //--------------------------------------------------
  // REIMPRIMIR
  //--------------------------------------------------

  function repeatLabel() {

    if (!order) return;

    const coil = prompt(
      "¿Qué bobina desea reimprimir?"
    );

    if (!coil) return;

    alert(
      "Reimpresión de la bobina " +
      coil
    );

  }

  //--------------------------------------------------
  // PENDIENTES
  //--------------------------------------------------

  const pending =
    order
      ? order.rolls - order.printed
      : 0;

  const finished =
    order?.status === "FINALIZADA";

  //--------------------------------------------------
  // PANTALLA
  //--------------------------------------------------

  return (

    <Box>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >

        👷 Operario

      </Typography>

      <Card>

        <CardContent>

          <Grid container spacing={2}>

            <Grid size={{ xs: 12, md: 8 }}>

              <TextField
                fullWidth
                label="Orden de Producción"
                value={orderNumber}
                onChange={(e) =>
                  setOrderNumber(
                    e.target.value
                  )
                }
              />

            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  height: "56px"
                }}
                onClick={loadOrder}
              >

                Cargar Orden

              </Button>

            </Grid>

          </Grid>

          {error && (

            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >

              {error}

            </Alert>

          )}

        </CardContent>

      </Card>      {order && (

        <Box mt={3}>

          <Card>

            <CardContent>

              <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 8 }}>

                  <Typography>
                    <b>SKU:</b> {order.sku}
                  </Typography>

                  <Typography>
                    <b>Producto:</b> {order.product}
                  </Typography>

                  <Typography>
                    <b>Plantilla:</b> {order.template}
                  </Typography>

                  <Typography>
                    <b>Impresora:</b> {order.printer}
                  </Typography>

                  <Typography>
                    <b>Estado:</b> {order.status}
                  </Typography>

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                  <Card
                    sx={{
                      background: "#0B7A3B",
                      color: "white",
                      textAlign: "center",
                      p: 2,
                      borderRadius: 2
                    }}
                  >

                    <Typography
                      variant="h5"
                      fontWeight="bold"
                    >
                      TOTAL
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 82,
                        fontWeight: 700,
                        lineHeight: 1
                      }}
                    >
                      {order.rolls}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 22
                      }}
                    >
                      Impresos: {order.printed}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: 18,
                        fontWeight: 400
                      }}
                    >
                      Pendientes
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 58,
                        fontWeight: 400,
                        lineHeight: 1,
                        mb: 2,
                        color:
                          pending === 0
                            ? "#4CAF50"
                            : "#FF2B2B"
                      }}
                    >
                      {pending}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 22
                      }}
                    >
                      Próxima bobina:
                      {" "}
                      {order.firstCoil + order.printed}
                    </Typography>

                  </Card>

                </Grid>

              </Grid>              <Box
                display="flex"
                gap={2}
                mt={4}
              >

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  disabled={finished}
                  onClick={printCurrentLabel}
                >

                  🖨 Imprimir

                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={repeatLabel}
                >

                  🔁 Repetir etiqueta

                </Button>

              </Box>

            </CardContent>

          </Card>

        </Box>

      )}

      <Dialog

        open={previewOpen}

        onClose={() => setPreviewOpen(false)}

        maxWidth="lg"

      >

        <DialogTitle>

          Vista previa

        </DialogTitle>

        <DialogContent>

          <LabelPreview

            elements={label}

          />

        </DialogContent>

      </Dialog>

      <Dialog

        open={finishedOpen}

        onClose={() => setFinishedOpen(false)}

      >

        <DialogTitle>

          ✅ Pedido finalizado

        </DialogTitle>

        <DialogContent>

          <Typography>

            Se ha impreso la última etiqueta de esta orden de producción.

          </Typography>

          <Typography
            mt={2}
            fontWeight="bold"
          >

            Total de bobinas impresas:

            {" "}

            {order?.printed}

          </Typography>

          <Typography
            mt={2}
          >

            Ya no es posible imprimir más etiquetas para esta orden.

          </Typography>

        </DialogContent>

        <DialogActions>

          <Button

            variant="contained"

            onClick={() =>

              setFinishedOpen(false)

            }

          >

            Aceptar

          </Button>

        </DialogActions>

      </Dialog>    </Box>

  );

}