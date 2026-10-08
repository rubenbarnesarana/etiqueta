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
    ).slice(
      -2
    );


  const month =
    String(
      today.getMonth() +
      1
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


/*
 * ==================================================
 * COMPONENTE
 * ==================================================
 */

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
      () =>
        getProducts(),
      [
        open
      ]
    );


  const templates =
    useMemo(
      () =>
        getTemplates(),
      [
        open
      ]
    );


  /*
   * ==================================================
   * ESTADOS
   * ==================================================
   */

  const [
    order,
    setOrder
  ] = useState(
    ""
  );


  const [
    lot,
    setLot
  ] = useState(
    getTodayLot()
  );


  const [
    customer,
    setCustomer
  ] = useState(
    ""
  );


  /*
   * ==================================================
   * CAMPOS DE PLANIFICACIÓN
   * ==================================================
   */

  const [
    salesOrder,
    setSalesOrder
  ] = useState(
    ""
  );


  const [
    quantity,
    setQuantity
  ] = useState<number>(
    0
  );


  const [
    quantityUnit,
    setQuantityUnit
  ] = useState<
    "M" |
    "UN"
  >(
    "M"
  );


  /*
   * ==================================================
   * PRODUCTO
   * ==================================================
   */

  const [
    sku,
    setSku
  ] = useState(
    ""
  );


  const [
    productName,
    setProductName
  ] = useState(
    ""
  );


  const [
    templateId,
    setTemplateId
  ] = useState<number>(
    0
  );


  /*
   * ==================================================
   * PRODUCCIÓN
   * ==================================================
   */

  const [
    rolls,
    setRolls
  ] = useState<number>(
    1
  );


  const [
    firstCoil,
    setFirstCoil
  ] = useState<number>(
    1
  );


  const [
    printer,
    setPrinter
  ] = useState(
    "Toshiba BA420"
  );


  const [
    productionLine,
    setProductionLine
  ] = useState<number>(
    0
  );


  /*
   * ==================================================
   * PRODUCTO SELECCIONADO
   * ==================================================
   */

  const selectedProduct:
    Product |
    undefined =

    products.find(
      product =>
        product.sapCode ===
        sku
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
   * MARCAJE AUTOMÁTICO
   * ==================================================
   */

  const productMarking =
    selectedProduct?.marking ??
    "";


  /*
   * ==================================================
   * CARGAR ORDEN
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !open
      ) {

        return;
      }


      /*
       * ==================================================
       * EDITAR ORDEN EXISTENTE
       * ==================================================
       */

      if (
        editing
      ) {

        setOrder(
          editing.order ??
          ""
        );


        setLot(
          editing.lot ??
          getTodayLot()
        );


        setCustomer(
          editing.customer ??
          ""
        );


        setSalesOrder(
          editing.salesOrder ??
          ""
        );


        setQuantity(
          Number(
            editing.quantity ??
            0
          )
        );


        setQuantityUnit(
          editing.quantityUnit ===
            "UN"
            ? "UN"
            : "M"
        );


        setSku(
          editing.sku ??
          ""
        );


        setProductName(
          editing.product ??
          ""
        );


        setTemplateId(
          Number(
            editing.templateId ??
            0
          )
        );


        setRolls(
          Number(
            editing.rolls ??
            1
          )
        );


        setFirstCoil(
          Number(
            editing.firstCoil ??
            1
          )
        );


        setPrinter(
          editing.printer ||
          "Toshiba BA420"
        );


        setProductionLine(
          Number(
            editing.productionLine ??
            0
          )
        );


        return;
      }


      /*
       * ==================================================
       * NUEVA ORDEN
       * ==================================================
       */

      setOrder("");

      setLot(
        getTodayLot()
      );

      setCustomer("");

      setSalesOrder("");

      setQuantity(0);

      setQuantityUnit(
        "M"
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

    },
    [
      editing,
      open
    ]
  );


  /*
   * ==================================================
   * SELECCIONAR SKU
   * ==================================================
   */

  function handleProductSelect(
    product:
      Product |
      null
  ) {

    if (
      !product
    ) {

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
     * ==================================================
     * VALIDACIONES
     * ==================================================
     */

    if (
      !cleanOrder
    ) {

      alert(
        "Debes indicar la Orden SAP."
      );

      return;
    }


    if (
      !cleanLot
    ) {

      alert(
        "No se ha podido generar el lote."
      );

      return;
    }


    if (
      !cleanSku
    ) {

      alert(
        "Debes seleccionar un SKU."
      );

      return;
    }


    if (
      !selectedProduct
    ) {

      alert(
        "El SKU seleccionado no existe en Productos."
      );

      return;
    }


    if (
      !templateId
    ) {

      alert(
        "El producto no tiene una plantilla asignada."
      );

      return;
    }


    if (
      productionLine <
        1 ||
      productionLine >
        8
    ) {

      alert(
        "Debes seleccionar una línea de producción."
      );

      return;
    }


    if (
      !Number.isFinite(
        quantity
      ) ||
      quantity <
        0
    ) {

      alert(
        "La cantidad no es válida."
      );

      return;
    }


    if (
      !Number.isFinite(
        rolls
      ) ||
      rolls <
        1
    ) {

      alert(
        "El número de rollos / bobinas debe ser mayor que 0."
      );

      return;
    }


    if (
      editing &&
      rolls <
      Number(
        editing.printed ??
        0
      )
    ) {

      alert(
        `El total no puede ser menor que las ${editing.printed} etiquetas ya impresas.`
      );

      return;
    }


    if (
      !Number.isFinite(
        firstCoil
      ) ||
      firstCoil <
        1 ||
      firstCoil >
        9999
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

      customer:
        customer.trim(),

      /*
       * Los comentarios dejarán de ser de orden.
       *
       * Mientras terminamos la migración a comentarios
       * por línea, conservamos el valor anterior para
       * no perder información existente.
       */

      comments:
        editing?.comments ??
        "",

      /*
       * Marcaje obtenido automáticamente del producto.
       */

      marking:
        selectedProduct.marking?.trim() ??
        "",

      salesOrder:
        salesOrder.trim(),

      quantity:
        Math.max(
          0,
          Number(
            quantity
          )
        ),

      quantityUnit,

      sku:
        cleanSku,

      product:
        selectedProduct.description,

      templateId:
        Number(
          selectedProduct.templateId
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
      maxWidth="lg"
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
            mt:
              0.5
          }}
        >

          {/* ==================================================
              ORDEN SAP
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Orden de fabricación"
              value={
                order
              }
              onChange={
                event =>
                  setOrder(
                    event.target.value
                  )
              }
              placeholder="Ej.: 89000050937"
              fullWidth
              autoFocus
            />

          </Grid>


          {/* ==================================================
              PEDIDO DE VENTA
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Pedido de venta"
              value={
                salesOrder
              }
              onChange={
                event =>
                  setSalesOrder(
                    event.target.value
                  )
              }
              placeholder="Ej.: 405053377"
              fullWidth
            />

          </Grid>


          {/* ==================================================
              LOTE
              ================================================== */}

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
              helperText="Generado automáticamente con la fecha actual."
              slotProps={{
                input: {
                  readOnly:
                    true
                }
              }}
            />

          </Grid>


          {/* ==================================================
              CLIENTE
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Cliente"
              value={
                customer
              }
              onChange={
                event =>
                  setCustomer(
                    event.target.value
                  )
              }
              placeholder="Ej.: M P A"
              fullWidth
            />

          </Grid>


          {/* ==================================================
              LÍNEA
              ================================================== */}

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


              {
                PRODUCTION_LINES.map(
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
                )
              }

            </TextField>

          </Grid>


          {/* ==================================================
              SKU
              ================================================== */}

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


                  if (
                    !search
                  ) {

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
                        ) ||
                      product.marking
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


                      {
                        product.marking &&
                        (

                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                "#0B7A3B",

                              fontWeight:
                                700
                            }}
                          >
                            Marcaje: {product.marking}
                          </Typography>

                        )
                      }

                    </Box>

                  </Box>

                )
              }
              renderInput={
                params => (

                  <TextField
                    {...params}
                    label="SKU"
                    placeholder="Escribe SKU, descripción o marcaje..."
                    helperText="Producto, marcaje y plantilla se obtienen automáticamente."
                    fullWidth
                  />

                )
              }
            />

          </Grid>


          {/* ==================================================
              PRODUCTO
              ================================================== */}

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
                  readOnly:
                    true
                }
              }}
            />

          </Grid>


          {/* ==================================================
              MARCAJE AUTOMÁTICO
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 6
            }}
          >

            <TextField
              label="Marcaje"
              value={
                productMarking
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly:
                    true
                }
              }}
              helperText="Se obtiene automáticamente del SKU seleccionado."
            />

          </Grid>


          {/* ==================================================
              CANTIDAD
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 4
            }}
          >

            <TextField
              label="Cantidad"
              type="number"
              value={
                quantity
              }
              onChange={
                event =>
                  setQuantity(
                    Number(
                      event.target.value
                    )
                  )
              }
              slotProps={{
                htmlInput: {
                  min:
                    0
                }
              }}
              helperText="Metros o unidades del pedido."
              fullWidth
            />

          </Grid>


          {/* ==================================================
              UNIDAD
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 2
            }}
          >

            <TextField
              select
              label="Unidad"
              value={
                quantityUnit
              }
              onChange={
                event =>
                  setQuantityUnit(
                    event.target.value ===
                      "UN"
                      ? "UN"
                      : "M"
                  )
              }
              fullWidth
            >

              <MenuItem
                value="M"
              >
                Metros
              </MenuItem>

              <MenuItem
                value="UN"
              >
                Unidades
              </MenuItem>

            </TextField>

          </Grid>


          {/* ==================================================
              TOTAL ROLLOS / BOBINAS
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 3
            }}
          >

            <TextField
              label="Nº rollos / bobinas"
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
                  min:
                    1,
                  max:
                    9999
                }
              }}
              fullWidth
            />

          </Grid>


          {/* ==================================================
              PRIMER COIL
              ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 3
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
                  min:
                    1,
                  max:
                    9999
                }
              }}
              helperText="Coil Number inicial."
              fullWidth
            />

          </Grid>


          {/* ==================================================
              PLANTILLA
              ================================================== */}

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
                  readOnly:
                    true
                }
              }}
              helperText="Se obtiene automáticamente del SKU seleccionado."
            />

          </Grid>


          {/* ==================================================
              IMPRESORA
              ================================================== */}

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


          {/* ==================================================
              POSICIÓN ACTUAL
              ================================================== */}

          {
            editing &&
            productionLine >
              0 &&
            (

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  label="Posición en planificación"
                  value={
                    editing.planningPosition >
                      0
                      ? editing.planningPosition
                      : "Sin planificar"
                  }
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly:
                        true
                    }
                  }}
                  helperText="El orden se modifica desde la pantalla Planificación."
                />

              </Grid>

            )
          }


          {/* ==================================================
              INFORMACIÓN PRODUCTO
              ================================================== */}

          {
            selectedProduct &&
            (

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
                      Marcaje:{" "}

                      <strong>
                        {
                          productMarking ||
                          "Sin marcaje"
                        }
                      </strong>
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


                    {
                      productionLine >
                        0 &&
                      (

                        <Typography
                          variant="body2"
                          sx={{
                            mt:
                              0.5,

                            fontWeight:
                              700
                          }}
                        >
                          Línea de producción:{" "}
                          {productionLine}
                        </Typography>

                      )
                    }

                  </Box>

                </Alert>

              </Grid>

            )
          }

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