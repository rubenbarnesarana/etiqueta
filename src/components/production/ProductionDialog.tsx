import {
  useEffect,
  useMemo,
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
  Alert,
  Typography,
  Box,
  Autocomplete
} from "@mui/material";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import type {
  Product
} from "../../models/Product";

import {
  getProducts
} from "../../services/ProductStorage";

import {
  getTemplates
} from "../../services/TemplateStorage";


interface Props {

  open: boolean;

  onClose: () => void;

  onSave: (
    order: ProductionOrder
  ) => void;

  editing?: ProductionOrder;

}


/*
 * ==================================================
 * LÍNEAS DE PRODUCCIÓN
 * ==================================================
 */

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


/*
 * ==================================================
 * GENERAR LOTE AUTOMÁTICO
 * ==================================================
 */

function getTodayLot(): string {

  const today =
    new Date();


  const year =
    String(
      today.getFullYear()
    ).slice(-2);


  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    year +
    month +
    day
  );

}


export default function ProductionDialog({
  open,
  onClose,
  onSave,
  editing
}: Props) {


  /*
   * ==================================================
   * DATOS
   * ==================================================
   */

  const products =
    useMemo(
      () => getProducts(),
      [open]
    );


  const templates =
    useMemo(
      () => getTemplates(),
      [open]
    );


  /*
   * ==================================================
   * ESTADOS
   * ==================================================
   */

  const [
    order,
    setOrder
  ] = useState("");


  const [
    lot,
    setLot
  ] = useState(
    getTodayLot()
  );


  const [
    sku,
    setSku
  ] = useState("");


  const [
    productName,
    setProductName
  ] = useState("");


  const [
    templateId,
    setTemplateId
  ] = useState<number>(0);


  const [
    rolls,
    setRolls
  ] = useState<number>(1);


  const [
    firstCoil,
    setFirstCoil
  ] = useState<number>(1);


  const [
    printer,
    setPrinter
  ] = useState(
    "Toshiba BA420"
  );


  const [
    productionLine,
    setProductionLine
  ] = useState<number>(0);


  /*
   * ==================================================
   * PRODUCTO SELECCIONADO
   * ==================================================
   */

  const selectedProduct:
    Product | undefined =
      products.find(
        product =>
          product.sapCode === sku
      );


  /*
   * ==================================================
   * PLANTILLA SELECCIONADA
   * ==================================================
   */

  const selectedTemplate =
    templates.find(
      template =>
        Number(
          template.id
        ) ===
        Number(
          templateId
        )
    );


  /*
   * ==================================================
   * CARGAR ORDEN
   * ==================================================
   */

  useEffect(() => {

    if (!open) {

      return;

    }


    /*
     * EDITAR ORDEN EXISTENTE
     */

    if (editing) {

      setOrder(
        editing.order ?? ""
      );


      setLot(
        editing.lot ??
        getTodayLot()
      );


      setSku(
        editing.sku ?? ""
      );


      setProductName(
        editing.product ?? ""
      );


      setTemplateId(
        Number(
          editing.templateId ?? 0
        )
      );


      setRolls(
        Number(
          editing.rolls ?? 1
        )
      );


      setFirstCoil(
        Number(
          editing.firstCoil ?? 1
        )
      );


      setPrinter(
        editing.printer ||
        "Toshiba BA420"
      );


      setProductionLine(
        Number(
          editing.productionLine ?? 0
        )
      );


      return;

    }


    /*
     * NUEVA ORDEN
     */

    setOrder("");


    setLot(
      getTodayLot()
    );


    setSku("");


    setProductName("");


    setTemplateId(0);


    setRolls(1);


    setFirstCoil(1);


    setPrinter(
      "Toshiba BA420"
    );


    setProductionLine(0);

  }, [
    editing,
    open
  ]);


  /*
   * ==================================================
   * SELECCIONAR SKU
   * ==================================================
   */

  function handleProductSelect(
    product: Product | null
  ) {

    if (!product) {

      setSku("");

      setProductName("");

      setTemplateId(0);

      return;

    }


    setSku(
      product.sapCode
    );


    setProductName(
      product.description
    );


    setTemplateId(
      Number(
        product.templateId
      )
    );

  }


  /*
   * ==================================================
   * GUARDAR
   * ==================================================
   */

  function save() {

    const cleanOrder =
      order.trim();


    const cleanLot =
      lot.trim();


    const cleanSku =
      sku.trim();


    /*
     * VALIDACIONES
     */

    if (!cleanOrder) {

      alert(
        "Debes indicar la Orden SAP."
      );

      return;

    }


    if (!cleanLot) {

      alert(
        "No se ha podido generar el lote."
      );

      return;

    }


    if (!cleanSku) {

      alert(
        "Debes seleccionar un SKU."
      );

      return;

    }


    if (!selectedProduct) {

      alert(
        "El SKU seleccionado no existe en Productos."
      );

      return;

    }


    if (!templateId) {

      alert(
        "El producto no tiene una plantilla asignada."
      );

      return;

    }


    if (
      productionLine < 1 ||
      productionLine > 8
    ) {

      alert(
        "Debes seleccionar una línea de producción."
      );

      return;

    }


    if (
      !Number.isFinite(
        rolls
      ) ||
      rolls < 1
    ) {

      alert(
        "El número de rollos debe ser mayor que 0."
      );

      return;

    }


    if (
      !Number.isFinite(
        firstCoil
      ) ||
      firstCoil < 1 ||
      firstCoil > 9999
    ) {

      alert(
        "La primera bobina debe estar entre 1 y 9999."
      );

      return;

    }


    if (
      firstCoil +
      rolls -
      1 >
      9999
    ) {

      alert(
        "La numeración de bobinas supera el máximo 9999."
      );

      return;

    }


    /*
     * ==================================================
     * GUARDAR ORDEN
     * ==================================================
     */

    onSave({

      id:
        editing?.id ??
        Date.now(),

      order:
        cleanOrder,

      lot:
        cleanLot,

      sku:
        cleanSku,

      product:
        selectedProduct.description,

      templateId:
        Number(
          templateId
        ),

      rolls:
        Math.floor(
          Number(
            rolls
          )
        ),

      firstCoil:
        Math.floor(
          Number(
            firstCoil
          )
        ),

      printer:
        printer.trim() ||
        "Toshiba BA420",

      productionLine:
        productionLine,

      planningPosition:
        editing?.planningPosition ??
        0,

      status:
        editing?.status ??
        "ABIERTA",

      printed:
        editing?.printed ??
        0

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
            ? "Editar Orden de Producción"
            : "Nueva Orden de Producción"
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


          {/* ORDEN SAP */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Orden SAP"
              value={
                order
              }
              onChange={
                event =>
                  setOrder(
                    event.target.value
                  )
              }
              placeholder="Ejemplo: 8900005103"
              fullWidth
              autoFocus
            />

          </Grid>


          {/* LOTE AUTOMÁTICO */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Lote"
              value={
                lot
              }
              fullWidth
              helperText="Generado automáticamente con la fecha de hoy."
              slotProps={{
                input: {
                  readOnly: true
                }
              }}
            />

          </Grid>


          {/* SKU BUSCADOR */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <Autocomplete
              options={
                products
              }

              value={
                selectedProduct ??
                null
              }

              onChange={
                (
                  _event,
                  value
                ) =>
                  handleProductSelect(
                    value
                  )
              }

              getOptionLabel={
                product =>
                  `${product.sapCode} - ${product.description}`
              }

              isOptionEqualToValue={
                (
                  option,
                  value
                ) =>
                  option.id ===
                  value.id
              }

              filterOptions={
                (
                  options,
                  state
                ) => {

                  const search =
                    state.inputValue
                      .trim()
                      .toLowerCase();


                  /*
                   * No enseñamos toda la lista
                   * mientras el usuario no escriba.
                   */

                  if (!search) {

                    return [];

                  }


                  return options.filter(
                    product =>
                      product.sapCode
                        .toLowerCase()
                        .includes(
                          search
                        ) ||
                      product.description
                        .toLowerCase()
                        .includes(
                          search
                        )
                  );

                }
              }

              noOptionsText="No se ha encontrado ningún SKU"

              renderOption={
                (
                  props,
                  product
                ) => (

                  <Box
                    component="li"
                    {...props}
                    key={
                      product.id
                    }
                  >

                    <Box>

                      <Typography
                        fontWeight={700}
                      >

                        {product.sapCode}

                      </Typography>


                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >

                        {product.description}

                      </Typography>

                    </Box>

                  </Box>

                )
              }

              renderInput={
                params => (

                  <TextField
                    {...params}
                    label="SKU"
                    placeholder="Escribe el SKU..."
                    helperText="Escribe parte del SKU para buscar el producto."
                    fullWidth
                  />

                )
              }
            />

          </Grid>


          {/* PRODUCTO */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Producto"
              value={
                productName
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly: true
                }
              }}
            />

          </Grid>


          {/* LÍNEA DE PRODUCCIÓN */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              select
              label="Línea de producción"
              value={
                productionLine
              }
              onChange={
                event =>
                  setProductionLine(
                    Number(
                      event.target.value
                    )
                  )
              }
              fullWidth
              required
              helperText="La orden se añadirá a la planificación de esta línea."
            >

              <MenuItem
                value={0}
              >
                Seleccionar línea
              </MenuItem>


              {PRODUCTION_LINES.map(
                line => (

                  <MenuItem
                    key={
                      line
                    }
                    value={
                      line
                    }
                  >

                    Línea {line}

                  </MenuItem>

                )
              )}

            </TextField>

          </Grid>


          {/* PLANTILLA */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Plantilla"
              value={
                selectedTemplate?.name ??
                ""
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly: true
                }
              }}
              helperText="Se obtiene automáticamente del producto."
            />

          </Grid>


          {/* NÚMERO DE ROLLOS */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Número de rollos / bobinas"
              type="number"
              value={
                rolls
              }
              onChange={
                event =>
                  setRolls(
                    Number(
                      event.target.value
                    )
                  )
              }
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 9999
                }
              }}
              fullWidth
            />

          </Grid>


          {/* PRIMERA BOBINA */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Primera bobina"
              type="number"
              value={
                firstCoil
              }
              onChange={
                event =>
                  setFirstCoil(
                    Number(
                      event.target.value
                    )
                  )
              }
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 9999
                }
              }}
              helperText="La numeración continuará automáticamente."
              fullWidth
            />

          </Grid>


          {/* IMPRESORA */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Impresora"
              value={
                printer
              }
              onChange={
                event =>
                  setPrinter(
                    event.target.value
                  )
              }
              fullWidth
            />

          </Grid>


          {/* POSICIÓN ACTUAL */}

          {editing &&
            productionLine > 0 && (

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  label="Posición en planificación"
                  value={
                    editing.planningPosition > 0
                      ? editing.planningPosition
                      : "Sin planificar"
                  }
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: true
                    }
                  }}
                  helperText="El orden se modificará desde la pantalla Planificación."
                />

              </Grid>

            )}


          {/* INFORMACIÓN DEL PRODUCTO */}

          {selectedProduct && (

            <Grid
              size={{
                xs: 12
              }}
            >

              <Alert
                severity={
                  selectedTemplate
                    ? "success"
                    : "warning"
                }
              >

                <Box>

                  <Typography
                    fontWeight={700}
                  >

                    {selectedProduct.sapCode}

                    {" — "}

                    {selectedProduct.description}

                  </Typography>


                  <Typography
                    variant="body2"
                  >

                    Plantilla:{" "}

                    {
                      selectedTemplate?.name ??
                      "Sin plantilla"
                    }

                  </Typography>


                  {productionLine > 0 && (

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        fontWeight: 700
                      }}
                    >

                      Línea de producción:{" "}
                      {productionLine}

                    </Typography>

                  )}

                </Box>

              </Alert>

            </Grid>

          )}

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
          color="success"
          onClick={
            save
          }
        >

          {
            editing
              ? "GUARDAR CAMBIOS"
              : "CREAR ORDEN"
          }

        </Button>

      </DialogActions>

    </Dialog>

  );

}