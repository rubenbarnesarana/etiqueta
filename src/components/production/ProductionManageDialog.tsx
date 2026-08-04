import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  Chip
} from "@mui/material";

import { useEffect, useState } from "react";

import type { ProductionOrder } from "../../services/OrderStorage";

interface Props {

  open: boolean;

  order?: ProductionOrder;

  onClose: () => void;

  onSave: (order: ProductionOrder) => void;

}

export default function ProductionManageDialog({

  open,

  order,

  onClose,

  onSave

}: Props) {

  const [printed, setPrinted] = useState(0);

  const [reopen, setReopen] = useState(false);

  const [finish, setFinish] = useState(false);

  useEffect(() => {

    if (!order) return;

    setPrinted(order.printed);

    setReopen(order.status === "ABIERTA");

    setFinish(order.status === "FINALIZADA");

  }, [order]);

  if (!order) return null;

  function save() {

    let printedValue = printed;

    if (printedValue < 0)
      printedValue = 0;

    if (printedValue > order.rolls)
      printedValue = order.rolls;

    const updated: ProductionOrder = {

      ...order,

      printed: printedValue,

      status:
        finish
          ? "FINALIZADA"
          : reopen || printedValue < order.rolls
          ? "ABIERTA"
          : "FINALIZADA"

    };

    onSave(updated);

    alert("Orden actualizada correctamente.");

    onClose();

  }

  function restart() {

    if (
      !window.confirm(
        "¿Seguro que deseas reiniciar la orden desde la bobina 1?"
      )
    )
      return;

    const updated: ProductionOrder = {

      ...order,

      printed: 0,

      status: "ABIERTA"

    };

    onSave(updated);

    onClose();

  }

  return (

    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >

      <DialogTitle>

        ⚙ Gestionar Orden

      </DialogTitle>

      <DialogContent>

        <Grid container spacing={2} sx={{ mt: 1 }}>

          <Grid xs={12}>

            <Typography variant="h6">

              Orden SAP

            </Typography>

            <Typography>

              {order.order}

            </Typography>

          </Grid>

          <Grid xs={12}>

            <Typography variant="h6">

              SKU

            </Typography>

            <Typography>

              {order.sku}

            </Typography>

          </Grid>

          <Grid xs={12}>

            <Typography variant="h6">

              Estado

            </Typography>

            <Chip
              color={
                order.status === "ABIERTA"
                  ? "success"
                  : "default"
              }
              label={order.status}
            />

          </Grid>

          <Divider sx={{ width: "100%", mt: 2, mb: 2 }} />          <Grid xs={12}>

            <Typography>

              Total bobinas

            </Typography>

            <Typography variant="h5" fontWeight="bold">

              {order.rolls}

            </Typography>

          </Grid>

          <Grid xs={12}>

            <TextField
              fullWidth
              type="number"
              label="Bobinas impresas"
              value={printed}
              onChange={(e) =>
                setPrinted(Number(e.target.value))
              }
            />

          </Grid>

          <Grid xs={12}>

            <Typography>

              Pendientes

            </Typography>

            <Typography
              sx={{
                fontSize: 40,
                color: "#d32f2f",
                fontWeight: 500
              }}
            >

              {order.rolls - printed}

            </Typography>

          </Grid>

          <Grid xs={12}>

            <Typography>

              Próxima bobina

            </Typography>

            <Typography
              variant="h5"
              fontWeight="bold"
            >

              {order.firstCoil + printed}

            </Typography>

          </Grid>

          <Grid xs={12}>

            <FormControlLabel
              control={
                <Checkbox
                  checked={reopen}
                  onChange={(e) =>
                    setReopen(e.target.checked)
                  }
                />
              }
              label="Reabrir orden"
            />

          </Grid>

          <Grid xs={12}>

            <FormControlLabel
              control={
                <Checkbox
                  checked={finish}
                  onChange={(e) =>
                    setFinish(e.target.checked)
                  }
                />
              }
              label="Marcar como finalizada"
            />

          </Grid>

        </Grid>

      </DialogContent>

      <DialogActions>

        <Button
          color="warning"
          onClick={restart}
        >

          Reiniciar

        </Button>

        <Button
          onClick={onClose}
        >

          Cancelar

        </Button>

        <Button
          variant="contained"
          onClick={save}
        >

          Guardar

        </Button>

      </DialogActions>

    </Dialog>

  );

}