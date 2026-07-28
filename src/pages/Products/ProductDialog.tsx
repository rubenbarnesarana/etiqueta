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

import type { Product } from "../../models/Product";

import {
  getTemplates
} from "../../services/TemplateStorage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editing?: Product;
}

export default function ProductDialog({
  open,
  onClose,
  onSave,
  editing
}: Props) {

  const templates = getTemplates();

  const [sapCode, setSapCode] = useState("");
  const [description, setDescription] = useState("");
  const [diameter, setDiameter] = useState("");
  const [thickness, setThickness] = useState("");
  const [flow, setFlow] = useState("");
  const [spacing, setSpacing] = useState("");
  const [dripper, setDripper] = useState("");
  const [templateId, setTemplateId] = useState<number>(0);

  useEffect(() => {

    if (editing) {

      setSapCode(editing.sapCode);
      setDescription(editing.description);
      setDiameter(editing.diameter);
      setThickness(editing.thickness);
      setFlow(editing.flow);
      setSpacing(editing.spacing);
      setDripper(editing.dripper);
      setTemplateId(editing.templateId);

    } else {

      setSapCode("");
      setDescription("");
      setDiameter("");
      setThickness("");
      setFlow("");
      setSpacing("");
      setDripper("");
      setTemplateId(0);

    }

  }, [editing, open]);

  function save() {

    onSave({

      id: editing?.id ?? Date.now(),

      sapCode,

      description,

      diameter,

      thickness,

      flow,

      spacing,

      dripper,

      templateId

    });

  }

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >

      <DialogTitle>

        {editing ? "Editar Producto" : "Nuevo Producto"}

      </DialogTitle>

      <DialogContent>

        <Grid container spacing={2} sx={{ mt: 1 }}>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Código SAP"
              value={sapCode}
              onChange={(e) => setSapCode(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Diámetro"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
            >
              <MenuItem value="16">16 mm</MenuItem>
              <MenuItem value="17">17 mm</MenuItem>
              <MenuItem value="20">20 mm</MenuItem>
              <MenuItem value="22">22 mm</MenuItem>
              <MenuItem value="25">25 mm</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Espesor"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
            >
              {["6","8","10","12","13","15","18","25","35","40","43","45","47"].map(mil => (
                <MenuItem key={mil} value={mil}>
                  {mil} mil
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Caudal"
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
            >
              {["0.6","0.8","0.95","1.0","1.1","1.4","1.6","2.0","2.2","3.5","3.8","4.0"].map(f => (
                <MenuItem key={f} value={f}>
                  {f} l/h
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Espaciado"
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tipo de gotero"
              value={dripper}
              onChange={(e) => setDripper(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Plantilla"
              value={templateId}
              onChange={(e) => setTemplateId(Number(e.target.value))}
            >

              <MenuItem value={0}>
                Sin plantilla
              </MenuItem>

              {templates.map(t => (

                <MenuItem
                  key={t.id}
                  value={t.id}
                >
                  {t.name}
                </MenuItem>

              ))}

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