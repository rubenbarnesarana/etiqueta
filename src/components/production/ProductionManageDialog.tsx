import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  Divider,
  Paper,
  Box
} from "@mui/material";

import { useEffect, useState } from "react";

import type { ProductionOrder } from "../../services/OrderStorage";
import { updateOrder } from "../../services/OrderStorage";

import { findTemplate } from "../../services/TemplateStorage";

import { useDesigner } from "../designer/DesignerContext";
import Canvas from "../designer/Canvas";


interface Props {
  open: boolean;
  order: ProductionOrder | null;
  onClose: () => void;
  onSaved?: () => void;
}


export default function ProductionManageDialog({
  open,
  order,
  onClose,
  onSaved
}: Props) {

  const {
    setElements,
    setSelected,
    setLabelData
  } = useDesigner();


  const [printed, setPrinted] =
    useState(0);

  const [showPreview, setShowPreview] =
    useState(false);

  const [labelFormat, setLabelFormat] =
    useState<"FORMATO_1" | "FORMATO_2">(
      "FORMATO_1"
    );

  const [backgroundImage, setBackgroundImage] =
    useState<string | undefined>(
      undefined
    );


  /*
   * ==================================================
   * VALORES DE LA ORDEN
   * ==================================================
   */

  const totalRolls =
    Number(order?.rolls ?? 0);

  const firstCoil =
    Number(order?.firstCoil ?? 1);

  const safePrinted =
    Math.min(
      totalRolls,
      Math.max(
        0,
        Number(printed)
      )
    );

  const pending =
    Math.max(
      0,
      totalRolls -
        safePrinted
    );

  const nextCoil =
    firstCoil +
    safePrinted;


  /*
   * ==================================================
   * AL ABRIR UNA ORDEN
   * ==================================================
   */

  useEffect(() => {

    if (!order) {
      return;
    }

    setPrinted(
      Number(order.printed ?? 0)
    );

    setShowPreview(false);

  }, [
    order,
    open
  ]);


  /*
   * ==================================================
   * ACTUALIZAR BOBINA DE LA ETIQUETA
   * ==================================================
   *
   * IMPORTANTE:
   * Este Hook está ANTES del return.
   * Así React ejecuta siempre los mismos Hooks.
   */

  useEffect(() => {

    if (
      !order ||
      !showPreview
    ) {
      return;
    }

    const coil =
      Number(order.firstCoil) +
      Math.min(
        Number(order.rolls),
        Math.max(
          0,
          Number(printed)
        )
      );

    setLabelData(prev => ({
      ...prev,

      COIL:
        String(coil)
          .padStart(
            3,
            "0"
          )
    }));

  }, [
    printed,
    order,
    showPreview,
    setLabelData
  ]);


  /*
   * ==================================================
   * SI NO HAY ORDEN
   * ==================================================
   */

  if (!order) {
    return null;
  }


  /*
   * ==================================================
   * CARGAR ETIQUETA
   * ==================================================
   */

  function loadLabel() {

    const template =
      findTemplate(
        Number(order.templateId)
      );


    if (!template) {

      alert(
        "No se ha encontrado la plantilla asignada a esta orden."
      );

      return;
    }


    /*
     * Cargar elementos de la plantilla
     */

    setElements(
      template.elements.map(
        element => ({
          ...element
        })
      )
    );


    setSelected(null);


    /*
     * Formato
     */

    setLabelFormat(
      template.labelFormat ??
      "FORMATO_1"
    );


    setBackgroundImage(
      template.backgroundImage
    );


    /*
     * Datos reales de la orden
     */

    setLabelData(prev => ({
      ...prev,

      ORDER:
        String(order.order),

      SKU:
        String(order.sku),

      DESCRIPTION:
        String(order.product),

      BARCODE:
        String(order.sku),

      QR:
        String(order.sku),

      COIL:
        String(nextCoil)
          .padStart(
            3,
            "0"
          ),

      ROLLS:
        String(totalRolls)
    }));


    /*
     * Mostrar preview
     */

    setShowPreview(true);
  }


  /*
   * ==================================================
   * GUARDAR
   * ==================================================
   */

  function save() {

    const newPrinted =
      Math.min(
        totalRolls,
        Math.max(
          0,
          Number(printed)
        )
      );


    const newStatus:
      "ABIERTA" | "FINALIZADA" =
      newPrinted >= totalRolls
        ? "FINALIZADA"
        : "ABIERTA";


    updateOrder({
      ...order,

      printed:
        newPrinted,

      status:
        newStatus
    });


    onSaved?.();

    onClose();
  }


  /*
   * ==================================================
   * REINICIAR
   * ==================================================
   */

  function restart() {

    updateOrder({
      ...order,

      printed: 0,

      status:
        "ABIERTA"
    });


    setPrinted(0);


    setLabelData(prev => ({
      ...prev,

      COIL:
        String(firstCoil)
          .padStart(
            3,
            "0"
          )
    }));


    onSaved?.();
  }


  /*
   * ==================================================
   * MARCAR ETIQUETA COMO IMPRESA
   * ==================================================
   *
   * Todavía NO imprime físicamente.
   */

  function nextLabel() {

    if (
      safePrinted >=
      totalRolls
    ) {

      alert(
        "La orden ya está finalizada."
      );

      return;
    }


    const newPrinted =
      safePrinted + 1;


    const newStatus:
      "ABIERTA" | "FINALIZADA" =
      newPrinted >= totalRolls
        ? "FINALIZADA"
        : "ABIERTA";


    updateOrder({
      ...order,

      printed:
        newPrinted,

      status:
        newStatus
    });


    setPrinted(
      newPrinted
    );


    const newCoil =
      firstCoil +
      newPrinted;


    setLabelData(prev => ({
      ...prev,

      COIL:
        String(newCoil)
          .padStart(
            3,
            "0"
          )
    }));


    onSaved?.();
  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={
        showPreview
          ? "lg"
          : "sm"
      }
    >

      <DialogTitle>
        Gestionar producción
      </DialogTitle>


      <DialogContent>

        <Stack spacing={2}>

          {/* DATOS DE LA ORDEN */}

          <Paper
            variant="outlined"
            sx={{
              p: 2
            }}
          >

            <Stack spacing={1}>

              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Orden SAP
              </Typography>


              <Typography
                variant="h6"
                fontWeight="bold"
              >
                {order.order}
              </Typography>


              <Divider />


              <Typography
                variant="body2"
              >
                <strong>
                  SKU:
                </strong>{" "}
                {order.sku}
              </Typography>


              <Typography
                variant="body2"
              >
                <strong>
                  Producto:
                </strong>{" "}
                {order.product}
              </Typography>


              <Typography
                variant="body2"
              >
                <strong>
                  Impresora:
                </strong>{" "}
                {order.printer || "-"}
              </Typography>

            </Stack>

          </Paper>


          {/* PRODUCCIÓN */}

          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            Producción
          </Typography>


          <TextField
            label="Total de rollos"
            value={totalRolls}
            disabled
            fullWidth
          />


          <TextField
            label="Rollos impresos"
            type="number"
            value={printed}
            onChange={(e) => {

              const value =
                Number(
                  e.target.value
                );

              setPrinted(
                Math.min(
                  totalRolls,
                  Math.max(
                    0,
                    value
                  )
                )
              );

            }}
            inputProps={{
              min: 0,
              max: totalRolls
            }}
            fullWidth
          />


          <TextField
            label="Rollos pendientes"
            value={pending}
            disabled
            fullWidth
          />


          <TextField
            label="Siguiente bobina"
            value={
              String(nextCoil)
                .padStart(
                  3,
                  "0"
                )
            }
            disabled
            fullWidth
          />


          <Divider />


          {/* ESTADO */}

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              textAlign:
                "center"
            }}
          >

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Estado
            </Typography>


            <Typography
              variant="h6"
              fontWeight="bold"
            >
              {pending === 0
                ? "FINALIZADA"
                : "ABIERTA"}
            </Typography>

          </Paper>


          {/* BOTÓN CARGAR */}

          {!showPreview && (

            <Button
              variant="contained"
              onClick={loadLabel}
              fullWidth
            >
              CARGAR ETIQUETA DE ESTA ORDEN
            </Button>

          )}


          {/* VISTA PREVIA */}

          {showPreview && (

            <>

              <Divider />


              <Typography
                variant="h6"
                fontWeight="bold"
              >
                Vista previa de etiqueta
              </Typography>


              <Paper
                variant="outlined"
                sx={{
                  p: 2,

                  backgroundColor:
                    "#eeeeee",

                  overflow:
                    "auto"
                }}
              >

                <Box
                  sx={{
                    display:
                      "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "flex-start",

                    minHeight:
                      "400px"
                  }}
                >

                  <Canvas
                    addText={false}
                    insertField=""
                    zoom={70}
                    backgroundImage={
                      backgroundImage
                    }
                    labelFormat={
                      labelFormat
                    }
                  />

                </Box>

              </Paper>


              {/* INFORMACIÓN DE LA ETIQUETA */}

              <Paper
                variant="outlined"
                sx={{
                  p: 2
                }}
              >

                <Stack spacing={1}>

                  <Typography
                    fontWeight="bold"
                  >
                    Etiqueta actual
                  </Typography>


                  <Typography>
                    Orden SAP:{" "}
                    <strong>
                      {order.order}
                    </strong>
                  </Typography>


                  <Typography>
                    SKU:{" "}
                    <strong>
                      {order.sku}
                    </strong>
                  </Typography>


                  <Typography>
                    Bobina:{" "}
                    <strong>
                      {String(nextCoil)
                        .padStart(
                          3,
                          "0"
                        )}
                    </strong>
                  </Typography>


                  <Typography>
                    Pendientes:{" "}
                    <strong>
                      {pending}
                    </strong>
                  </Typography>

                </Stack>

              </Paper>


              {/* SIMULACIÓN DE IMPRESIÓN */}

              <Button
                variant="contained"
                size="large"
                onClick={
                  nextLabel
                }
                disabled={
                  pending === 0
                }
                fullWidth
              >
                MARCAR ETIQUETA COMO IMPRESA
              </Button>


              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                Este botón todavía no envía
                nada a la Toshiba BA420.
                Sirve para comprobar el
                contador automático antes
                de conectar la impresión.
              </Typography>

            </>

          )}

        </Stack>

      </DialogContent>


      <DialogActions>

        <Button
          onClick={
            restart
          }
          color="warning"
        >
          Reiniciar
        </Button>


        <Button
          onClick={
            onClose
          }
        >
          Cancelar
        </Button>


        <Button
          variant="contained"
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