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
  DialogContent
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

import type { DesignerElement } from "../../components/designer/DesignerTypes";

export default function Operator() {

  const [orderNumber, setOrderNumber] = useState("");

  const [order, setOrder] = useState<ProductionOrder | null>(null);

  const [error, setError] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);

  const [label, setLabel] = useState<DesignerElement[]>([]);

  function loadOrder() {

    const productionOrder = findOrder(orderNumber);

    if (!productionOrder) {

      setError("Orden no encontrada");

      setOrder(null);

      return;

    }

    setError("");

    setOrder(productionOrder);

  }

  function printCurrentLabel() {

    if (!order) return;

    const result = printLabel(order);

    if (!result.success) {

      alert(result.message);

      return;

    }

    setLabel(result.label ?? []);

    setPreviewOpen(true);

    const updated = findOrder(order.order);

    if (updated) {

      setOrder(updated);

    }

  }

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
                onChange={(e) => setOrderNumber(e.target.value)}
              />

            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>

              <Button
                variant="contained"
                fullWidth
                sx={{ height: "56px" }}
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

      </Card>

      {order && (

        <Box mt={3}>

          <Card>

            <CardContent>

              <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 8 }}>

                  <Typography><b>SKU:</b> {order.sku}</Typography>

                  <Typography><b>Producto:</b> {order.product}</Typography>

                  <Typography><b>Plantilla:</b> {order.template}</Typography>

                  <Typography><b>Impresora:</b> {order.printer}</Typography>

                  <Typography><b>Estado:</b> {order.status}</Typography>

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                  <Card
                    sx={{
                      background: "#0B7A3B",
                      color: "white",
                      textAlign: "center",
                      p: 2
                    }}
                  >

                    <Typography variant="h6">

                      TOTAL

                    </Typography>

                    <Typography variant="h2">

                      {order.rolls}

                    </Typography>

                    <Typography>

                      Impresos: {order.printed}

                    </Typography>

                    <Typography>

                      Pendientes: {order.rolls - order.printed}

                    </Typography>

                    <Typography>

                      Próxima bobina: {order.firstCoil + order.printed}

                    </Typography>

                  </Card>

                </Grid>

              </Grid>

              <Box
                display="flex"
                gap={2}
                mt={4}
              >

                <Button
                  variant="contained"
                  color="success"
                  size="large"
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

    </Box>

  );

}