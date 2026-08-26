import { useRef, useState } from "react";

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
  DialogActions,
  Autocomplete
} from "@mui/material";

import LabelPreview from "../../components/print/LabelPreview";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  findOrder,
  getOrders
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

  const [autocompleteOpen, setAutocompleteOpen] =
    useState(false);

  const orderInputRef =
    useRef<HTMLInputElement | null>(null);

  //--------------------------------------------------
  // ULTIMAS ORDENES
  //--------------------------------------------------

  const orders =
    getOrders();

  const orderHistory =
    [...orders]
      .sort((a, b) => b.id - a.id)
      .map(order => order.order);

  //--------------------------------------------------
  // ENFOCAR CAMPO ORDEN
  //--------------------------------------------------

  function focusOrderInput() {

    setTimeout(() => {

      orderInputRef.current?.focus();

      orderInputRef.current?.select();

    }, 100);

  }

  //--------------------------------------------------
  // CARGAR ORDEN
  //--------------------------------------------------

  function loadOrder() {

    const number =
      orderNumber.trim();

    if (!number) {

      setError(
        "Introduce una orden de producción"
      );

      focusOrderInput();

      return;

    }

    const productionOrder =
      findOrder(number);

    if (!productionOrder) {

      setError(
        "Orden no encontrada"
      );

      setOrder(null);

      focusOrderInput();

      return;

    }

    setError("");

    setOrder(
      productionOrder
    );

    setAutocompleteOpen(false);

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

      focusOrderInput();

      return;

    }

    setLabel(
      result.label ?? []
    );

    setPreviewOpen(true);

    const updated =
      findOrder(order.order);

    if (updated) {

      setOrder(updated);

    }

    //------------------------------------------------
    // CERRAR VISTA PREVIA
    //------------------------------------------------

    setTimeout(() => {

      setPreviewOpen(false);

      setOrderNumber("");

      setOrder(null);

      focusOrderInput();

      //------------------------------------------------
      // ULTIMA ETIQUETA
      //------------------------------------------------

      if (result.finished) {

        setFinishedOpen(true);

      }

    }, 2000);

  }

  //--------------------------------------------------
  // REIMPRIMIR
  //--------------------------------------------------

  function repeatLabel() {

    if (!order) return;

    const coil =
      prompt(
        "¿Qué bobina desea reimprimir?"
      );

    if (!coil) return;

    alert(
      "Reimpresión de la bobina " +
      coil
    );

    focusOrderInput();

  }

  //--------------------------------------------------
  // PENDIENTES
  //--------------------------------------------------

  const pending =
    order
      ? Math.max(
          0,
          order.rolls - order.printed
        )
      : 0;

  //--------------------------------------------------
  // ORDEN FINALIZADA
  //--------------------------------------------------

  const finished =
    order?.status === "FINALIZADA";

  //--------------------------------------------------
  // PROXIMA BOBINA
  //--------------------------------------------------

  const nextCoil =
    order && pending > 0
      ? order.firstCoil +
        order.printed
      : null;

  //--------------------------------------------------
  // PANTALLA
  //--------------------------------------------------

  return (

    <Box>

      {/* TITULO */}

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >

        👷 Operario

      </Typography>


      {/* CARGAR ORDEN */}

      <Card>

        <CardContent>

          <Grid
            container
            spacing={2}
          >

            <Grid
              size={{
                xs: 12,
                md: 8
              }}
            >

              <Autocomplete
                freeSolo
                open={autocompleteOpen}
                onOpen={() =>
                  setAutocompleteOpen(true)
                }
                onClose={() =>
                  setAutocompleteOpen(false)
                }
                options={orderHistory}
                value={orderNumber}
                inputValue={orderNumber}
                onInputChange={(
                  _event,
                  value
                ) => {

                  setOrderNumber(value);

                  if (error) {

                    setError("");

                  }

                }}
                renderInput={(params) => (

                  <TextField
                    {...params}
                    inputRef={
                      orderInputRef
                    }
                    fullWidth
                    label="Orden de Producción"
                    placeholder="Introduce la orden"
                    onKeyDown={(e) => {

                      if (
                        e.key === " " ||
                        e.code === "Space"
                      ) {

                        e.preventDefault();

                        setAutocompleteOpen(
                          true
                        );

                        return;

                      }

                      if (
                        e.key === "Enter"
                      ) {

                        e.preventDefault();

                        loadOrder();

                      }

                    }}
                  />

                )}
              />

            </Grid>


            <Grid
              size={{
                xs: 12,
                md: 4
              }}
            >

              <Button
                variant="contained"
                fullWidth
                sx={{
                  height: "56px"
                }}
                onClick={loadOrder}
              >

                CARGAR ORDEN

              </Button>

            </Grid>

          </Grid>


          {/* ERROR */}

          {error && (

            <Alert
              severity="error"
              sx={{
                mt: 2
              }}
            >

              {error}

            </Alert>

          )}

        </CardContent>

      </Card>


      {/* INFORMACION DE LA ORDEN */}

      {order && (

        <Box mt={3}>

          <Card>

            <CardContent>

              <Grid
                container
                spacing={3}
              >

                {/* DATOS DE LA ORDEN */}

                <Grid
                  size={{
                    xs: 12,
                    md: 8
                  }}
                >

                  <Typography>
                    <b>SKU:</b>{" "}
                    {order.sku}
                  </Typography>

                  <Typography>
                    <b>Producto:</b>{" "}
                    {order.product}
                  </Typography>

                  <Typography>
                    <b>Plantilla:</b>{" "}
                    {order.template}
                  </Typography>

                  <Typography>
                    <b>Impresora:</b>{" "}
                    {order.printer}
                  </Typography>

                  <Typography>
                    <b>Estado:</b>{" "}
                    {order.status}
                  </Typography>

                </Grid>


                {/* CONTADORES */}

                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}
                >

                  {/* TARJETA VERDE */}

                  <Card
                    sx={{
                      backgroundColor:
                        "#0B7A3B",
                      color: "white",
                      textAlign:
                        "center",
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

                      Impresos:{" "}
                      {order.printed}

                    </Typography>


                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: 18
                      }}
                    >

                      Pendientes

                    </Typography>


                    <Typography
                      sx={{
                        fontSize: 58,
                        fontWeight: 400,
                        lineHeight: 1,
                        color:
                          pending === 0
                            ? "#4CAF50"
                            : "#FF2B2B"
                      }}
                    >

                      {pending}

                    </Typography>

                  </Card>


                  {/* PROXIMA BOBINA */}

                  <Card
                    sx={{
                      mt: 2,
                      p: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      border:
                        "2px solid #1976D2",
                      backgroundColor:
                        "#FFFFFF"
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#555"
                      }}
                    >

                      Próxima bobina

                    </Typography>


                    {nextCoil !== null ? (

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 58,
                          fontWeight: 700,
                          lineHeight: 1,
                          color: "#1976D2"
                        }}
                      >

                        {nextCoil}

                      </Typography>

                    ) : (

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#4CAF50"
                        }}
                      >

                        FINALIZADA

                      </Typography>

                    )}

                  </Card>

                </Grid>

              </Grid>


              {/* BOTONES */}

              <Box
                display="flex"
                gap={2}
                mt={4}
              >

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  disabled={finished}
                  onClick={
                    printCurrentLabel
                  }
                >

                  🖨 Imprimir

                </Button>


                <Button
                  variant="outlined"
                  size="large"
                  onClick={
                    repeatLabel
                  }
                >

                  🔁 Repetir etiqueta

                </Button>

              </Box>

            </CardContent>

          </Card>

        </Box>

      )}


      {/* VISTA PREVIA */}

      <Dialog
        open={previewOpen}
        onClose={() =>
          setPreviewOpen(false)
        }
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


      {/* PEDIDO FINALIZADO */}

      <Dialog
        open={finishedOpen}
        onClose={() =>
          setFinishedOpen(false)
        }
      >

        <DialogTitle>

          ✅ Pedido finalizado

        </DialogTitle>


        <DialogContent>

          <Typography>

            Se ha impreso la última
            etiqueta de esta orden
            de producción.

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

            Ya no es posible imprimir
            más etiquetas para esta orden.

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

      </Dialog>

    </Box>

  );

}