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
  useRef,
  useState
} from "react";

import PrintIcon from "@mui/icons-material/Print";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import PalletLabelPreview from "./PalletLabelPreview";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  renderLabelToPng
} from "../../services/LabelImageService";

import {
  getConfiguredLabelPrinter,
  printLabelImage
} from "../../services/QzPrintService";

import {
  registerPrint
} from "../../services/PrintHistoryService";

import {
  useAuth
} from "../../auth/AuthContext";


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


  const {
    user
  } = useAuth();


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
    success,
    setSuccess
  ] = useState("");


  const [
    previewVisible,
    setPreviewVisible
  ] = useState(false);


  const [
    printing,
    setPrinting
  ] = useState(false);


  /*
   * ==================================================
   * RENDER OCULTO PARA IMPRESIÓN FÍSICA
   * ==================================================
   */

  const printRenderRef =
    useRef<HTMLDivElement>(null);


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

        setSuccess("");

        setPreviewVisible(false);

        setPrinting(false);

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

      setSuccess("");

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


    setSuccess("");

    setPreviewVisible(
      true
    );

  }


  /*
   * ==================================================
   * ESPERAR RENDER DE LA ETIQUETA
   * ==================================================
   */

  async function waitForLabelRender():
    Promise<void> {

    await new Promise<void>(
      resolve => {

        requestAnimationFrame(
          () => {

            requestAnimationFrame(
              () => {

                resolve();

              }
            );

          }
        );

      }
    );

  }


  /*
   * ==================================================
   * OBTENER ELEMENTO FÍSICO 240 x 110 MM
   * ==================================================
   */

  function getPhysicalLabelElement():
    HTMLElement | null {

    const wrapper =
      printRenderRef.current;


    if (
      !wrapper
    ) {

      return null;

    }


    const previewWrapper =
      wrapper.firstElementChild;


    const physicalLabel =
      previewWrapper?.firstElementChild;


    return physicalLabel instanceof HTMLElement
      ? physicalLabel
      : null;

  }


  /*
   * ==================================================
   * REGISTRAR HISTORIAL EN SUPABASE
   * ==================================================
   */

  async function savePalletPrintHistory(
    palletQuantity: number
  ) {

    const configuredPrinter =
      getConfiguredLabelPrinter();


    await registerPrint({

      username:
        user?.fullName ??
        "Usuario desconocido",

      productionOrder:
        order.order,

      sku:
        order.sku,

      description:
        order.product,

      lot:
        order.lot,

      quantity:
        palletQuantity,

      printer:
        configuredPrinter ??
        order.printer,

      templateId:
        order.templateId,

      templateName:
        productTitle,

      printType:
        "PALLET",

      productionLine:
        order.productionLine

    });

  }


  /*
   * ==================================================
   * VOLVER A LA ORDEN
   * ==================================================
   */

  function returnToOrder() {

    setQuantity("");

    setError("");

    setSuccess("");

    setPreviewVisible(false);

    onClose();

  }


  /*
   * ==================================================
   * IMPRIMIR ETIQUETA DE PALET
   * ==================================================
   */

  async function printPalletLabel() {

    if (
      printing
    ) {

      return;

    }


    const value =
      validateQuantity();


    if (
      value === null
    ) {

      return;

    }


    setPrinting(
      true
    );

    setError("");

    setSuccess("");

    setPreviewVisible(
      true
    );


    let physicalPrintCompleted =
      false;


    try {

      /*
       * Esperar a que React pinte
       * correctamente la etiqueta.
       */

      await waitForLabelRender();


      /*
       * Obtener etiqueta física.
       */

      const physicalLabel =
        getPhysicalLabelElement();


      if (
        !physicalLabel
      ) {

        throw new Error(
          "No se ha podido preparar la etiqueta de palet para imprimir."
        );

      }


      /*
       * Convertir 240 x 110 mm
       * a PNG a 203 dpi.
       */

      const imageDataUrl =
        await renderLabelToPng(
          physicalLabel,
          {

            widthMm:
              240,

            heightMm:
              110,

            dpi:
              203

          }
        );


      /*
       * ==================================================
       * IMPRESIÓN FÍSICA QZ
       * ==================================================
       */

      await printLabelImage(
        imageDataUrl,
        240,
        110,
        `Rivulis ${order.order} - Etiqueta de palet`
      );


      physicalPrintCompleted =
        true;


      /*
       * ==================================================
       * HISTORIAL SUPABASE
       * ==================================================
       */

      try {

        await savePalletPrintHistory(
          value
        );


        /*
         * Impresión correcta y registrada.
         *
         * Cerramos automáticamente la ventana
         * y volvemos a la orden de producción.
         */

        returnToOrder();

      }
      catch (
        historyError
      ) {

        console.error(
          "La etiqueta de palet se imprimió, pero no se pudo registrar en el historial:",
          historyError
        );


        setError(
          historyError instanceof Error
            ? `La etiqueta se imprimió correctamente, pero no se pudo registrar en Supabase: ${historyError.message}`
            : "La etiqueta se imprimió correctamente, pero no se pudo registrar en Supabase."
        );

      }

    }
    catch (
      printError
    ) {

      console.error(
        "Error imprimiendo etiqueta de palet:",
        printError
      );


      if (
        physicalPrintCompleted
      ) {

        setError(
          "La etiqueta se ha enviado a la impresora, pero se ha producido un error posterior."
        );

      }
      else {

        setError(
          printError instanceof Error
            ? printError.message
            : "No se ha podido imprimir la etiqueta de palet."
        );

      }

    }
    finally {

      setPrinting(
        false
      );

    }

  }


  /*
   * ==================================================
   * CERRAR
   * ==================================================
   */

  function handleClose() {

    if (
      printing
    ) {

      return;

    }


    returnToOrder();

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <>

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


          {
            error
            &&
            (

              <Alert
                severity="error"
                sx={{
                  mb:
                    3
                }}
              >

                {error}

              </Alert>

            )
          }


          {
            success
            &&
            (

              <Alert
                severity="success"
                sx={{
                  mb:
                    3
                }}
              >

                {success}

              </Alert>

            )
          }


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

              disabled={
                printing
              }

              onChange={
                event => {

                  setQuantity(
                    event.target.value
                  );

                  setError("");

                  setSuccess("");

                  setPreviewVisible(false);

                }
              }

              onKeyDown={
                event => {

                  if (
                    event.key ===
                    "Enter" &&
                    !printing
                  ) {

                    showPreview();

                  }

                }
              }

              error={
                Boolean(
                  error &&
                  !success
                )
              }

              helperText={
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


          {
            !previewVisible
            &&
            (

              <Button
                variant="outlined"

                disabled={
                  printing
                }

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
            disabled={
              printing
            }

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

            disabled={
              printing
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

            {
              printing
                ? "IMPRIMIENDO..."
                : "IMPRIMIR ETIQUETA DE PALET"
            }

          </Button>

        </DialogActions>

      </Dialog>


      {/* =============================================
          RENDER OCULTO PARA IMPRESIÓN QZ
          ============================================= */}

      {
        open &&
        Number.isInteger(
          numericQuantity
        ) &&
        numericQuantity > 0
        &&
        (

          <Box
            ref={
              printRenderRef
            }
            sx={{
              position:
                "fixed",

              left:
                "-10000px",

              top:
                0,

              pointerEvents:
                "none",

              zIndex:
                -1
            }}
          >

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

    </>

  );

}