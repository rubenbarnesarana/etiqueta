import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@mui/material";

import {
  useEffect,
  useState
} from "react";

import PrintIcon from "@mui/icons-material/Print";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import PalletLabelPreview from "./PalletLabelPreview";

import type {
  ProductionOrder
} from "../../services/OrderStorage";


interface Props {

  open: boolean;

  order: ProductionOrder;

  productTitle: string;

  onClose: () => void;

}


export default function PalletLabelDialog({

  open,

  order,

  productTitle,

  onClose

}: Props) {


  /*
   * ==================================================
   * ESTADO
   * ==================================================
   */

  const [
    quantity,
    setQuantity
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  const [
    previewVisible,
    setPreviewVisible
  ] = useState(false);


  /*
   * ==================================================
   * REINICIAR AL ABRIR / CERRAR
   * ==================================================
   */

  useEffect(
    () => {

      if (
        open
      ) {

        setQuantity("");

        setError("");

        setPreviewVisible(false);

      }

    },
    [
      open
    ]
  );


  /*
   * ==================================================
   * CANTIDAD NUMÉRICA
   * ==================================================
   */

  const numericQuantity =
    Number(
      quantity
    );


  /*
   * ==================================================
   * VALIDAR CANTIDAD
   * ==================================================
   */

  function validateQuantity():
    number | null {

    const value =
      Number(
        quantity
      );


    if (
      !Number.isInteger(
        value
      ) ||
      value <= 0
    ) {

      setError(
        "Introduce una cantidad válida de bobinas."
      );

      return null;

    }


    setError("");

    return value;

  }


  /*
   * ==================================================
   * MOSTRAR VISTA PREVIA
   * ==================================================
   */

  function showPreview() {

    const value =
      validateQuantity();


    if (
      value === null
    ) {

      return;

    }


    setPreviewVisible(
      true
    );

  }


  /*
   * ==================================================
   * IMPRIMIR ETIQUETA DE PALET
   * ==================================================
   *
   * IMPORTANTE:
   *
   * Se comporta igual que la generación de
   * etiqueta de bobina dentro de la aplicación:
   *
   * - No abre una pestaña nueva.
   * - No abre window.print().
   * - No modifica la orden.
   *
   * NO modifica:
   *
   * - order.printed
   * - pendientes
   * - próxima bobina
   * - estado
   * - planificación
   *
   * Tampoco utiliza printLabel(), porque esa función
   * incrementa el contador de bobinas.
   * ==================================================
   */

  function printPalletLabel() {

    const value =
      validateQuantity();


    if (
      value === null
    ) {

      return;

    }


    /*
     * Por ahora la acción de imprimir la etiqueta
     * de palet genera y muestra la etiqueta dentro
     * de la aplicación, igual que el flujo actual
     * de etiquetas.
     *
     * No se modifica ningún contador.
     */

    setPreviewVisible(
      true
    );

  }


  /*
   * ==================================================
   * CERRAR
   * ==================================================
   */

  function handleClose() {

    setQuantity("");

    setError("");

    setPreviewVisible(false);

    onClose();

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
        handleClose
      }

      fullWidth

      maxWidth="lg"
    >

      {/* =============================================
          CABECERA
          ============================================= */}

      <DialogTitle
        sx={{
          fontWeight:
            800,

          fontSize:
            26,

          color:
            "#0B7A3B",

          display:
            "flex",

          alignItems:
            "center",

          gap:
            1.5
        }}
      >

        <Inventory2OutlinedIcon
          sx={{
            fontSize:
              34
          }}
        />

        Etiqueta de palet

      </DialogTitle>


      {/* =============================================
          CONTENIDO
          ============================================= */}

      <DialogContent>

        <Typography
          sx={{
            mb:
              0.5
          }}
        >

          Orden de producción:{" "}

          <b>
            {order.order}
          </b>

        </Typography>


        <Typography
          sx={{
            mb:
              0.5
          }}
        >

          SKU:{" "}

          <b>
            {order.sku}
          </b>

        </Typography>


        <Typography
          sx={{
            mb:
              0.5
          }}
        >

          Producto:{" "}

          <b>
            {order.product}
          </b>

        </Typography>


        <Typography
          sx={{
            mb:
              3
          }}
        >

          Cliente:{" "}

          <b>
            {order.customer || "-"}
          </b>

        </Typography>


        {/* =============================================
            AVISO SI NO HAY CLIENTE
            ============================================= */}

        {
          !order.customer?.trim()
          &&
          (

            <Alert
              severity="warning"
              sx={{
                mb:
                  3
              }}
            >

              Esta orden no tiene cliente informado.
              La etiqueta de palet mostrará "-" en el campo Cliente.

            </Alert>

          )
        }


        {/* =============================================
            CANTIDAD
            ============================================= */}

        <Box
          sx={{
            maxWidth:
              420,

            mb:
              3
          }}
        >

          <TextField
            autoFocus
            fullWidth
            type="number"

            label="Bobinas en el palet"

            placeholder="Ejemplo: 20"

            value={
              quantity
            }

            onChange={
              event => {

                setQuantity(
                  event.target.value
                );

                setError("");

                setPreviewVisible(false);

              }
            }

            onKeyDown={
              event => {

                if (
                  event.key ===
                  "Enter"
                ) {

                  showPreview();

                }

              }
            }

            error={
              Boolean(
                error
              )
            }

            helperText={
              error ||
              "Introduce el número real de bobinas que contiene este palet."
            }

            slotProps={{
              htmlInput: {

                min:
                  1,

                step:
                  1

              }
            }}

            sx={{

              "& input": {

                fontSize:
                  28,

                fontWeight:
                  700,

                textAlign:
                  "center"

              }

            }}
          />

        </Box>


        {/* =============================================
            BOTÓN VISTA PREVIA
            ============================================= */}

        {
          !previewVisible
          &&
          (

            <Button
              variant="outlined"

              onClick={
                showPreview
              }

              sx={{
                minHeight:
                  48,

                px:
                  3,

                mb:
                  2,

                fontWeight:
                  700,

                color:
                  "#0B7A3B",

                borderColor:
                  "#0B7A3B",

                "&:hover": {

                  borderColor:
                    "#086530",

                  backgroundColor:
                    "#F2F8F4"

                }
              }}
            >

              VER ETIQUETA

            </Button>

          )
        }


        {/* =============================================
            VISTA PREVIA
            ============================================= */}

        {
          previewVisible &&
          Number.isInteger(
            numericQuantity
          ) &&
          numericQuantity > 0
          &&
          (

            <Box
              sx={{
                mt:
                  2,

                pt:
                  3,

                borderTop:
                  "1px solid #E0E0E0"
              }}
            >

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  mb:
                    2
                }}
              >

                Vista previa

              </Typography>


              <PalletLabelPreview
                description={
                  order.product
                }

                sku={
                  order.sku
                }

                customer={
                  order.customer
                }

                quantity={
                  numericQuantity
                }

                productTitle={
                  productTitle
                }
              />

            </Box>

          )
        }

      </DialogContent>


      {/* =============================================
          ACCIONES
          ============================================= */}

      <DialogActions
        sx={{
          px:
            3,

          pb:
            3,

          pt:
            2,

          gap:
            1,

          flexWrap:
            "wrap"
        }}
      >

        <Button
          onClick={
            handleClose
          }

          sx={{
            fontWeight:
              700
          }}
        >

          CANCELAR

        </Button>


        <Button
          variant="contained"

          startIcon={
            <PrintIcon />
          }

          onClick={
            printPalletLabel
          }

          sx={{
            minHeight:
              48,

            px:
              3,

            fontWeight:
              800,

            backgroundColor:
              "#0B7A3B",

            "&:hover": {

              backgroundColor:
                "#086530"

            }
          }}
        >

          IMPRIMIR ETIQUETA DE PALET

        </Button>

      </DialogActions>

    </Dialog>

  );

}