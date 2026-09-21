import {
  useEffect,
  useState
} from "react";

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

import type {
  Product
} from "../../models/Product";

import {
  getTemplates
} from "../../services/TemplateStorage";


interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editing?: Product;
}


const DIAMETERS = [
  "16 mm",
  "20 mm",
  "22 mm",
  "23 mm"
];


const THICKNESSES = [
  "6 mil",
  "8 mil",
  "10 mil",
  "12 mil",
  "15 mil",
  "18 mil",
  "20 mil",
  "25 mil",
  "30 mil",
  "35 mil",
  "40 mil",
  "43 mil",
  "45 mil",
  "47 mil"
];


const FLOWS = [
  "0.6 l/h",
  "0.95 l/h",
  "1.0 l/h",
  "1.1 l/h",
  "1.4 l/h",
  "1.6 l/h",
  "2.0 l/h",
  "2.2 l/h",
  "3.5 l/h",
  "3.8 l/h"
];


export default function ProductDialog({
  open,
  onClose,
  onSave,
  editing
}: Props) {

  const templates =
    getTemplates();


  const [
    sapCode,
    setSapCode
  ] = useState("");


  const [
    description,
    setDescription
  ] = useState("");


  const [
    diameter,
    setDiameter
  ] = useState("");


  const [
    thickness,
    setThickness
  ] = useState("");


  const [
    flow,
    setFlow
  ] = useState("");


  const [
    spacing,
    setSpacing
  ] = useState("");


  const [
    dripper,
    setDripper
  ] = useState("");


  const [
    templateId,
    setTemplateId
  ] = useState<number>(0);


  /*
   * ==================================================
   * CARGAR PRODUCTO
   * ==================================================
   */

  useEffect(() => {

    if (editing) {

      setSapCode(
        editing.sapCode
      );

      setDescription(
        editing.description
      );

      setDiameter(
        editing.diameter
      );

      setThickness(
        editing.thickness
      );

      setFlow(
        editing.flow
      );

      setSpacing(
        editing.spacing
      );

      setDripper(
        editing.dripper
      );

      setTemplateId(
        editing.templateId
      );

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

  }, [
    editing,
    open
  ]);


  /*
   * ==================================================
   * GUARDAR
   * ==================================================
   */

  function save() {

    const cleanSapCode =
      sapCode.trim();

    const cleanDescription =
      description.trim();


    if (!cleanSapCode) {

      alert(
        "Debes indicar el Código SAP."
      );

      return;
    }


    if (!cleanDescription) {

      alert(
        "Debes indicar la descripción."
      );

      return;
    }


    if (!diameter) {

      alert(
        "Debes seleccionar el diámetro."
      );

      return;
    }


    if (!thickness) {

      alert(
        "Debes seleccionar el espesor."
      );

      return;
    }


    if (!flow) {

      alert(
        "Debes seleccionar el caudal."
      );

      return;
    }


    if (!spacing.trim()) {

      alert(
        "Debes indicar el espaciado."
      );

      return;
    }


    if (!templateId) {

      alert(
        "Debes seleccionar una plantilla."
      );

      return;
    }


    onSave({

      id:
        editing?.id ??
        Date.now(),

      sapCode:
        cleanSapCode,

      description:
        cleanDescription,

      diameter,

      thickness,

      flow,

      spacing:
        spacing.trim(),

      dripper:
        dripper.trim(),

      templateId

    });

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Dialog
      open={
        open
      }

      onClose={
        onClose
      }

      fullWidth

      maxWidth="md"
    >

      <DialogTitle>

        {
          editing
            ? "Editar Producto"
            : "Nuevo Producto"
        }

      </DialogTitle>


      <DialogContent>

        <Grid
          container
          spacing={2}
          sx={{
            mt: 0.5
          }}
        >


          {/* CÓDIGO SAP */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Código SAP"
              value={
                sapCode
              }
              onChange={
                event =>
                  setSapCode(
                    event.target.value
                  )
              }
              fullWidth
            />

          </Grid>


          {/* DESCRIPCIÓN */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Descripción"
              value={
                description
              }
              onChange={
                event =>
                  setDescription(
                    event.target.value
                  )
              }
              helperText="Descripción que aparecerá en la parte inferior de la etiqueta."
              fullWidth
            />

          </Grid>


          {/* DIÁMETRO */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              select
              label="Diámetro"
              value={
                diameter
              }
              onChange={
                event =>
                  setDiameter(
                    event.target.value
                  )
              }
              fullWidth
            >

              {DIAMETERS.map(
                value => (

                  <MenuItem
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {value}
                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


          {/* ESPESOR */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              select
              label="Espesor"
              value={
                thickness
              }
              onChange={
                event =>
                  setThickness(
                    event.target.value
                  )
              }
              fullWidth
            >

              {THICKNESSES.map(
                value => (

                  <MenuItem
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {value}
                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


          {/* CAUDAL */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              select
              label="Caudal"
              value={
                flow
              }
              onChange={
                event =>
                  setFlow(
                    event.target.value
                  )
              }
              fullWidth
            >

              {FLOWS.map(
                value => (

                  <MenuItem
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {value}
                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


          {/* ESPACIADO */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Espaciado"
              value={
                spacing
              }
              onChange={
                event =>
                  setSpacing(
                    event.target.value
                  )
              }
              placeholder="Ejemplo: 75"
              helperText="Indicar el espaciado en centímetros."
              fullWidth
            />

          </Grid>


          {/* TIPO DE GOTERO */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Tipo de gotero"
              value={
                dripper
              }
              onChange={
                event =>
                  setDripper(
                    event.target.value
                  )
              }
              fullWidth
            />

          </Grid>


          {/* PLANTILLA */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              select
              label="Plantilla"
              value={
                templateId
              }
              onChange={
                event =>
                  setTemplateId(
                    Number(
                      event.target.value
                    )
                  )
              }
              fullWidth
            >

              <MenuItem
                value={
                  0
                }
              >
                Seleccionar plantilla
              </MenuItem>


              {templates.map(
                template => (

                  <MenuItem
                    key={
                      template.id
                    }
                    value={
                      template.id
                    }
                  >
                    {template.name}
                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


        </Grid>

      </DialogContent>


      <DialogActions>

        <Button
          onClick={
            onClose
          }
        >
          CANCELAR
        </Button>


        <Button
          variant="contained"
          onClick={
            save
          }
        >
          GUARDAR
        </Button>

      </DialogActions>

    </Dialog>

  );
}