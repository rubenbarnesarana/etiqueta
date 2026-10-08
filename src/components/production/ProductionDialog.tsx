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
  Autocomplete,
  Paper,
  Divider
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
 * FORMATEAR NÚMERO
 * ==================================================
 */

function formatNumber(
  value: number
): string {

  if (
    !Number.isFinite(
      value
    )
  ) {

    return "0";
  }


  return new Intl.NumberFormat(
    "es-ES",
    {
      maximumFractionDigits:
        2
    }
  ).format(
    value
  );

}


/*
 * ==================================================
 * FORMATEAR CANTIDAD
 * ==================================================
 */

function formatQuantity(
  value: number,
  unit: "M" | "UN"
): string {

  const formatted =
    formatNumber(
      value
    );


  return unit ===
    "UN"

    ? `${formatted} un`

    : `${formatted} m`;

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
  ] =
    useState(
      ""
    );


  const [
    lot,
    setLot
  ] =
    useState(
      getTodayLot()
    );


  const [
    customer,
    setCustomer
  ] =
    useState(
      ""
    );


  const [
    comments,
    setComments
  ] =
    useState(
      ""
    );


  /*
   * ==================================================
   * CAMPOS DE PLANIFICACIÓN
   * ==================================================
   */

  const [
    marking,
    setMarking
  ] =
    useState(
      ""
    );


  const [
    salesOrder,
    setSalesOrder
  ] =
    useState(
      ""
    );


  /*
   * quantity =
   * cantidad contenida en CADA rollo / bobina.
   *
   * Ejemplos:
   *
   * 2500 m
   * 3000 m
   * 500 m
   * 400 m
   * 2500 un
   */

  const [
    quantity,
    setQuantity
  ] =
    useState<number>(
      0
    );


  const [
    quantityUnit,
    setQuantityUnit
  ] =
    useState<
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
  ] =
    useState(
      ""
    );


  const [
    productName,
    setProductName
  ] =
    useState(
      ""
    );


  const [
    templateId,
    setTemplateId
  ] =
    useState<number>(
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
  ] =
    useState<number>(
      1
    );


  const [
    firstCoil,
    setFirstCoil
  ] =
    useState<number>(
      1
    );


  const [
    printer,
    setPrinter
  ] =
    useState(
      "Toshiba BA420"
    );


  const [
    productionLine,
    setProductionLine
  ] =
    useState<number>(
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
   * TOTAL CALCULADO
   * ==================================================
   */

  const safeRolls =
    Number.isFinite(
      Number(
        rolls
      )
    )
      ? Math.max(
          0,
          Number(
            rolls
          )
        )
      : 0;


  const safeQuantity =
    Number.isFinite(
      Number(
        quantity
      )
    )
      ? Math.max(
          0,
          Number(
            quantity
          )
        )
      : 0;


  const totalQuantity =
    safeRolls *
    safeQuantity;


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

        const product =
          products.find(
            item =>
              item.sapCode ===
              editing.sku
          );


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


        setComments(
          editing.comments ??
          ""
        );


        /*
         * Si la orden ya tiene Marcaje usamos ese.
         *
         * Si es una orden antigua y no tiene Marcaje,
         * recuperamos el Marcaje configurado en Productos.
         */

        setMarking(
          String(
            editing.marking ??
            ""
          ).trim()
          ||
          String(
            product?.marking ??
            ""
          ).trim()
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

      setOrder(
        ""
      );


      setLot(
        getTodayLot()
      );


      setCustomer(
        ""
      );


      setComments(
        ""
      );


      setMarking(
        ""
      );


      setSalesOrder(
        ""
      );


      setQuantity(
        0
      );


      setQuantityUnit(
        "M"
      );


      setSku(
        ""
      );


      setProductName(
        ""
      );


      setTemplateId(
        0
      );


      setRolls(
        1
      );


      setFirstCoil(
        1
      );


      setPrinter(
        "Toshiba BA420"
      );


      setProductionLine(
        0
      );

    },
    [
      editing,
      open,
      products
    ]
  );


  /*
   * ==================================================
   * SELECCIONAR SKU
   * ==================================================
   */

  function handleProductSelect(
    product: Product | null
  ) {

    if (
      !product
    ) {

      setSku(
        ""
      );


      setProductName(
        ""
      );


      setTemplateId(
        0
      );


      setMarking(
        ""
      );


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


    /*
     * Marcaje automático desde Productos.
     */

    setMarking(
      String(
        product.marking ??
        ""
      ).trim()
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


    const cleanSalesOrder =
      salesOrder.trim();


    const finalRolls =
      Math.floor(
        Number(
          rolls
        )
      );


    const finalQuantity =
      Number(
        quantity
      );


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


    /*
     * Cantidad por rollo / bobina.
     */

    if (
      !Number.isFinite(
        finalQuantity
      ) ||
      finalQuantity <=
        0
    ) {

      alert(
        "Debes indicar la cantidad de metros o unidades que contiene cada rollo / bobina."
      );


      return;

    }


    if (
      !Number.isFinite(
        finalRolls
      ) ||
      finalRolls <
        1
    ) {

      alert(
        "El número de rollos / bobinas debe ser mayor que 0."
      );


      return;

    }


    if (
      editing &&
      finalRolls <
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
      finalRolls -
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

      comments:
        comments.trim(),

      marking:
        marking.trim(),

      salesOrder:
        cleanSalesOrder,

      /*
       * IMPORTANTE:
       *
       * quantity guarda la cantidad POR rollo / bobina.
       *
       * El total se calcula en pantalla como:
       *
       * rolls × quantity
       */

      quantity:
        finalQuantity,

      quantityUnit,

      sku:
        cleanSku,

      product:
        selectedProduct.description,

      templateId:
        Number(
          templateId
        ),

      rolls:
        finalRolls,

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
              xs:
                12,
              md:
                6
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
              xs:
                12,
              md:
                6
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
              helperText="Pedido de venta asociado a esta orden."
              fullWidth
            />

          </Grid>


          {/* ==================================================
              LOTE
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                6
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
              MARCAJE
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                6
            }}
          >

            <TextField
              label="Marcaje"
              value={
                marking
              }
              onChange={
                event =>
                  setMarking(
                    event.target.value
                  )
              }
              placeholder="Ej.: PC_16_115"
              helperText="Se carga automáticamente desde el SKU seleccionado."
              fullWidth
            />

          </Grid>


          {/* ==================================================
              CLIENTE
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                6
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
              xs:
                12,
              md:
                6
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
              xs:
                12,
              md:
                6
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
                        )
                      ||
                      product.description
                        .toLowerCase()
                        .includes(
                          search
                        )
                      ||
                      String(
                        product.marking ??
                        ""
                      )
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
                            color="success.main"
                            fontWeight={700}
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
                    helperText="Busca por código SAP, descripción o marcaje."
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
              xs:
                12,
              md:
                6
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
              CANTIDAD POR ROLLO / BOBINA
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                4
            }}
          >

            <TextField
              label={
                quantityUnit ===
                  "UN"

                  ? "Unidades por rollo / bobina"

                  : "Metros por rollo / bobina"
              }
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
                    0,
                  step:
                    1
                }
              }}
              helperText={
                quantityUnit ===
                  "UN"

                  ? "Ej.: 2500 unidades para MicroTube CUT."

                  : "Ej.: 2500, 3000, 500 o 400 metros."
              }
              fullWidth
            />

          </Grid>


          {/* ==================================================
              UNIDAD
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                2
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
              Nº ROLLOS / BOBINAS
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                3
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
                    9999,
                  step:
                    1
                }
              }}
              helperText="Cantidad total de rollos / bobinas."
              fullWidth
            />

          </Grid>


          {/* ==================================================
              PRIMER COIL
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                3
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
              TOTAL CALCULADO
              ================================================== */}

          <Grid
            size={{
              xs:
                12
            }}
          >

            <Paper
              variant="outlined"
              sx={{
                p:
                  2.2,

                borderColor:
                  "#A5D6A7",

                backgroundColor:
                  "#F1F8F3"
              }}
            >

              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={700}
                sx={{
                  mb:
                    0.7
                }}
              >
                TOTAL DE LA ORDEN
              </Typography>


              <Typography
                variant="h5"
                fontWeight={900}
                sx={{
                  color:
                    "#0B7A3B"
                }}
              >
                {
                  formatQuantity(
                    totalQuantity,
                    quantityUnit
                  )
                }
              </Typography>


              <Divider
                sx={{
                  my:
                    1
                }}
              />


              <Typography
                variant="body2"
                fontWeight={700}
              >
                {
                  `${formatNumber(
                    safeRolls
                  )} rollos / bobinas × ${formatQuantity(
                    safeQuantity,
                    quantityUnit
                  )} = ${formatQuantity(
                    totalQuantity,
                    quantityUnit
                  )}`
                }
              </Typography>

            </Paper>

          </Grid>


          {/* ==================================================
              PLANTILLA
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                6
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
              helperText="Se obtiene automáticamente del producto."
            />

          </Grid>


          {/* ==================================================
              IMPRESORA
              ================================================== */}

          <Grid
            size={{
              xs:
                12,
              md:
                6
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
              COMENTARIOS
              ================================================== */}

          <Grid
            size={{
              xs:
                12
            }}
          >

            <TextField
              label="Comentarios de planificación"
              value={
                comments
              }
              onChange={
                event =>
                  setComments(
                    event.target.value
                  )
              }
              placeholder="Ej.: Palets nuevos 20 bobinas"
              multiline
              minRows={2}
              maxRows={4}
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
                  xs:
                    12,
                  md:
                    6
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
                  helperText="El orden se modificará desde Planificación."
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
                  xs:
                    12
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


                    <Typography
                      variant="body2"
                    >
                      Marcaje:{" "}

                      <strong>
                        {
                          marking ||
                          "-"
                        }
                      </strong>
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