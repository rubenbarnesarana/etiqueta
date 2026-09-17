import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem
} from "@mui/material";

import { getProducts } from "../../services/ProductStorage";
import { getTemplates } from "../../services/TemplateStorage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (order: any) => void;
  editing?: any;
}

export default function ProductionDialog({
  open,
  onClose,
  onSave,
  editing
}: Props) {

  const products = getProducts();
  const templates = getTemplates();

  const [order, setOrder] = useState("");
  const [sku, setSku] = useState("");
  const [product, setProduct] = useState("");

  const [templateId, setTemplateId] = useState(0);

  const [rolls, setRolls] = useState("");
  const [firstCoil, setFirstCoil] = useState("1");
  const [printer, setPrinter] = useState("BA420");

  useEffect(() => {

    if (editing) {

      setOrder(editing.order ?? "");
      setSku(editing.sku ?? "");
      setProduct(editing.product ?? "");

      setTemplateId(
        Number(editing.templateId ?? 0)
      );

      setRolls(
        String(editing.rolls ?? "")
      );

      setFirstCoil(
        String(editing.firstCoil ?? 1)
      );

      setPrinter(
        editing.printer ?? "BA420"
      );

    } else {

      setOrder("");
      setSku("");
      setProduct("");

      setTemplateId(
        templates.length > 0
          ? templates[0].id
          : 0
      );

      setRolls("");
      setFirstCoil("1");
      setPrinter("BA420");

    }

  }, [editing, open]);

  function changeSKU(value: string) {

    setSku(value);

    const p = products.find(
      x => x.sapCode === value
    );

    if (!p) {
      return;
    }

    setProduct(
      p.description
    );

    /*
     * Al seleccionar el SKU proponemos
     * su plantilla como plantilla inicial.
     *
     * El usuario puede cambiarla manualmente
     * después.
     */
    setTemplateId(
      Number(p.templateId ?? 0)
    );

  }

  function changeTemplate(value: string) {

    setTemplateId(
      Number(value)
    );

  }

  function save() {

    if (!order.trim()) {
      alert("Introduce la Orden SAP.");
      return;
    }

    if (!sku) {
      alert("Selecciona un SKU.");
      return;
    }

    if (!templateId) {
      alert("Selecciona una plantilla.");
      return;
    }

    if (!rolls || Number(rolls) <= 0) {
      alert("Introduce el número de rollos.");
      return;
    }

    onSave({

      id:
        editing?.id ??
        Date.now(),

      order,

      sku,

      product,

      templateId,

      rolls:
        Number(rolls),

      printed:
        editing?.printed ??
        0,

      firstCoil:
        Number(firstCoil),

      printer,

      status:
        editing?.status ??
        "ABIERTA"

    });

  }

  return (

    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >

      <DialogTitle>
        {editing ? "Editar" : "Nueva"} Orden
      </DialogTitle>

      <DialogContent>

        <Grid
          container
          spacing={2}
          mt={1}
        >

          {/* ORDEN SAP */}

          <Grid size={{ xs: 12, md: 6 }}>

            <TextField
              fullWidth
              label="Orden SAP"
              value={order}
              onChange={(e) =>
                setOrder(e.target.value)
              }
            />

          </Grid>

          {/* SKU */}

          <Grid size={{ xs: 12, md: 6 }}>

            <TextField
              select
              fullWidth
              label="SKU"
              value={sku}
              onChange={(e) =>
                changeSKU(e.target.value)
              }
            >

              {products.map(p => (

                <MenuItem
                  key={p.id}
                  value={p.sapCode}
                >

                  {p.sapCode} - {p.description}

                </MenuItem>

              ))}

            </TextField>

          </Grid>

          {/* PRODUCTO */}

          <Grid size={{ xs: 12, md: 6 }}>

            <TextField
              fullWidth
              label="Producto"
              value={product}
              InputProps={{
                readOnly: true
              }}
            />

          </Grid>

          {/* PLANTILLA */}

          <Grid size={{ xs: 12, md: 6 }}>

            <TextField
              select
              fullWidth
              label="Plantilla"
              value={templateId}
              onChange={(e) =>
                changeTemplate(e.target.value)
              }
            >

              {templates.map(template => (

                <MenuItem
                  key={template.id}
                  value={template.id}
                >

                  {template.name}

                </MenuItem>

              ))}

            </TextField>

          </Grid>

          {/* ROLLOS */}

          <Grid size={{ xs: 12, md: 4 }}>

            <TextField
              fullWidth
              type="number"
              label="Total Rollos"
              value={rolls}
              onChange={(e) =>
                setRolls(e.target.value)
              }
              inputProps={{
                min: 1
              }}
            />

          </Grid>

          {/* BOBINA INICIAL */}

          <Grid size={{ xs: 12, md: 4 }}>

            <TextField
              fullWidth
              type="number"
              label="Bobina Inicial"
              value={firstCoil}
              onChange={(e) =>
                setFirstCoil(e.target.value)
              }
              inputProps={{
                min: 1
              }}
            />

          </Grid>

          {/* IMPRESORA */}

          <Grid size={{ xs: 12, md: 4 }}>

            <TextField
              select
              fullWidth
              label="Impresora"
              value={printer}
              onChange={(e) =>
                setPrinter(e.target.value)
              }
            >

              <MenuItem value="BA420">
                Toshiba BA420
              </MenuItem>

              <MenuItem value="BA400">
                Toshiba BA400
              </MenuItem>

            </TextField>

          </Grid>

        </Grid>

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={save}
        >
          Guardar
        </Button>

      </DialogActions>

    </Dialog>

  );

}