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
  MenuItem,
  Typography
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

  onSave: (
    product: Product
  ) => void;

  product?: Product;

}


export default function ProductDialog({

  open,

  onClose,

  onSave,

  product

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


  /*
   * Texto que aparecerá en la mitad
   * superior de la etiqueta a 180°.
   */

  const [
    upperText,
    setUpperText
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

    if (
      !open
    ) {

      return;

    }


    if (
      product
    ) {

      setSapCode(
        product.sapCode ??
        ""
      );


      setDescription(
        product.description ??
        ""
      );


      setUpperText(
        product.upperText ??
        ""
      );


      setDiameter(
        product.diameter ??
        ""
      );


      setThickness(
        product.thickness ??
        ""
      );


      setFlow(
        product.flow ??
        ""
      );


      setSpacing(
        product.spacing ??
        ""
      );


      setDripper(
        product.dripper ??
        ""
      );


      setTemplateId(
        Number(
          product.templateId ??
          0
        )
      );


      return;

    }


    /*
     * NUEVO PRODUCTO
     */

    setSapCode("");

    setDescription("");

    setUpperText("");

    setDiameter("");

    setThickness("");

    setFlow("");

    setSpacing("");

    setDripper("");

    setTemplateId(0);


  }, [
    product,
    open
  ]);


  /*
   * ==================================================
   * GUARDAR PRODUCTO
   * ==================================================
   */

  function save() {

    const cleanSapCode =
      sapCode.trim();


    const cleanDescription =
      description.trim();


    if (
      !cleanSapCode
    ) {

      alert(
        "Introduce el Código SAP."
      );

      return;

    }


    if (
      !cleanDescription
    ) {

      alert(
        "Introduce la descripción del producto."
      );

      return;

    }


    onSave({

      id:
        product?.id ??
        Date.now(),

      sapCode:
        cleanSapCode,

      description:
        cleanDescription,

      upperText:
        upperText.trim(),

      diameter,

      thickness,

      flow,

      spacing,

      dripper,

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
          product
            ? "Editar Producto"
            : "Nuevo Producto"
        }

      </DialogTitle>


      <DialogContent>

        <Grid
          container
          spacing={2}
          sx={{
            mt: 1
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
              fullWidth
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
              fullWidth
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
            />

          </Grid>


          {/* TEXTO SUPERIOR */}

          <Grid
            size={{
              xs: 12
            }}
          >

            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{
                mb: 1
              }}
            >

              Texto superior de la etiqueta

            </Typography>


            <TextField
              fullWidth
              multiline
              minRows={5}
              maxRows={8}
              label="Texto superior (180°)"
              value={
                upperText
              }
              onChange={
                event =>
                  setUpperText(
                    event.target.value
                  )
              }
              placeholder={
`AMNON PC AS 20/3.8
50 CM R-300M 1,2MM
Emitting Pipe
Max Pressure 3,5 BAR
ISO 9261`
              }
              helperText="Este texto aparecerá en la mitad superior de la etiqueta con orientación 180°. Respeta los saltos de línea."
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
              fullWidth
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
            >

              <MenuItem value="16">
                16 mm
              </MenuItem>

              <MenuItem value="17">
                17 mm
              </MenuItem>

              <MenuItem value="20">
                20 mm
              </MenuItem>

              <MenuItem value="22">
                22 mm
              </MenuItem>

              <MenuItem value="23">
                23 mm
              </MenuItem>

              <MenuItem value="25">
                25 mm
              </MenuItem>

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
              fullWidth
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
            >

              {[
                "6",
                "8",
                "10",
                "12",
                "13",
                "15",
                "18",
                "20",
                "25",
                "30",
                "35",
                "40",
                "43",
                "45",
                "47"
              ].map(
                mil => (

                  <MenuItem
                    key={
                      mil
                    }
                    value={
                      mil
                    }
                  >

                    {mil} mil

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
              fullWidth
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
            >

              {[
                "0.6",
                "0.8",
                "0.95",
                "1.0",
                "1.1",
                "1.2",
                "1.4",
                "1.6",
                "2.0",
                "2.2",
                "3.5",
                "3.8",
                "4.0"
              ].map(
                flowValue => (

                  <MenuItem
                    key={
                      flowValue
                    }
                    value={
                      flowValue
                    }
                  >

                    {flowValue} l/h

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
              fullWidth
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
              fullWidth
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
              fullWidth
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
            >

              <MenuItem value={0}>
                Sin plantilla
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

          Cancelar

        </Button>


        <Button
          variant="contained"
          color="success"
          onClick={
            save
          }
        >

          Guardar

        </Button>

      </DialogActions>

    </Dialog>

  );

}