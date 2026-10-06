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

import {
  useEffect,
  useState
} from "react";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  findTemplate
} from "../../services/TemplateStorage";

import {
  findProduct
} from "../../services/ProductStorage";

import {
  generateUpperText,
  generateBottomDescription,
  generateCoilDescription,
  generateCoilTechnicalText,
  generateCoilLegalText,
  generateCoilOriginText
} from "../../services/LabelTextGenerator";

import {
  useDesigner
} from "../designer/DesignerContext";

import Canvas from "../designer/Canvas";


interface Props {
  open: boolean;

  order: ProductionOrder | null;

  onClose: () => void;

  onSave: (
    order: ProductionOrder
  ) => void;
}


export default function ProductionManageDialog({
  open,
  order,
  onClose,
  onSave
}: Props) {

  const {
    setElements,
    setSelected,
    setLabelData
  } = useDesigner();


  const [
    printed,
    setPrinted
  ] = useState(
    0
  );


  const [
    comments,
    setComments
  ] = useState(
    ""
  );


  const [
    showPreview,
    setShowPreview
  ] = useState(
    false
  );


  const [
    labelFormat,
    setLabelFormat
  ] =
    useState<
      "FORMATO_1" |
      "FORMATO_2"
    >(
      "FORMATO_1"
    );


  const [
    backgroundImage,
    setBackgroundImage
  ] =
    useState<
      string |
      undefined
    >(
      undefined
    );


  /*
   * ==================================================
   * VALORES DE LA ORDEN
   * ==================================================
   */

  const totalRolls =
    Number(
      order?.rolls ??
      0
    );


  const firstCoil =
    Number(
      order?.firstCoil ??
      1
    );


  const safePrinted =
    Math.min(
      totalRolls,
      Math.max(
        0,
        Number(
          printed
        )
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
   * ABRIR ORDEN
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !order
      ) {

        return;

      }


      setPrinted(
        Number(
          order.printed ??
          0
        )
      );


      setComments(
        String(
          order.comments ??
          ""
        )
      );


      setShowPreview(
        false
      );


      setBackgroundImage(
        undefined
      );

    },
    [
      order,
      open
    ]
  );


  /*
   * ==================================================
   * ACTUALIZAR COIL EN LA ETIQUETA
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !order ||
        !showPreview
      ) {

        return;

      }


      const currentPrinted =
        Math.min(
          Number(
            order.rolls
          ),
          Math.max(
            0,
            Number(
              printed
            )
          )
        );


      const coil =
        Number(
          order.firstCoil
        ) +
        currentPrinted;


      if (
        currentPrinted >=
        Number(
          order.rolls
        )
      ) {

        return;

      }


      if (
        coil >
        9999
      ) {

        return;

      }


      setLabelData(
        prev => ({
          ...prev,

          COIL:
            String(
              coil
            )
        })
      );

    },
    [
      printed,
      order,
      showPreview,
      setLabelData
    ]
  );


  /*
   * ==================================================
   * SIN ORDEN
   * ==================================================
   */

  if (
    !order
  ) {

    return null;

  }


  /*
   * ==================================================
   * CARGAR ETIQUETA
   * ==================================================
   */

  function loadLabel() {

    /*
     * ==================================================
     * PLANTILLA
     * ==================================================
     */

    const template =
      findTemplate(
        Number(
          order.templateId
        )
      );


    if (
      !template
    ) {

      alert(
        "No se ha encontrado la plantilla asignada a esta orden."
      );


      return;

    }


    /*
     * ==================================================
     * PRODUCTO
     * ==================================================
     */

    const product =
      findProduct(
        String(
          order.sku
        )
      );


    if (
      !product
    ) {

      alert(
        `No se ha encontrado el SKU ${order.sku} en Productos.\n\nDebes crear el producto antes de cargar la etiqueta.`
      );


      return;

    }


    /*
     * ==================================================
     * FORMATO 1
     * ROLLOS
     * ==================================================
     */

    let upperText =
      "";


    let bottomDescription =
      "";


    /*
     * ==================================================
     * FORMATO 2
     * BOBINAS
     * ==================================================
     */

    let coilDescription =
      "";


    let coilTechnical =
      "";


    let coilLegal =
      "";


    let coilOrigin =
      "";


    /*
     * ==================================================
     * GENERAR DATOS SEGÚN FORMATO
     * ==================================================
     */

    if (
      template.labelFormat ===
      "FORMATO_2"
    ) {

      /*
       * DESCRIPCIÓN ORIGINAL DEL SKU
       */

      coilDescription =
        generateCoilDescription(
          product
        );


      /*
       * INFORMACIÓN TÉCNICA AUTOMÁTICA
       */

      coilTechnical =
        generateCoilTechnicalText(
          product,
          template
        );


      /*
       * TEXTO LEGAL
       */

      coilLegal =
        generateCoilLegalText();


      /*
       * MADE IN SPAIN / QI02
       */

      coilOrigin =
        generateCoilOriginText();

    }
    else {

      /*
       * ==================================================
       * FORMATO 1
       * ==================================================
       */

      upperText =
        generateUpperText(
          product,
          template
        );


      bottomDescription =
        generateBottomDescription(
          product,
          template
        );

    }


    /*
     * ==================================================
     * CARGAR DISEÑO
     * ==================================================
     */

    setElements(
      template.elements.map(
        element => ({
          ...element
        })
      )
    );


    setSelected(
      null
    );


    setLabelFormat(
      template.labelFormat ??
      "FORMATO_1"
    );


    setBackgroundImage(
      template.backgroundImage
    );


    /*
     * ==================================================
     * DATOS DE LA ETIQUETA
     * ==================================================
     */

    setLabelData(
      prev => ({
        ...prev,

        ORDER:
          String(
            order.order
          ),

        LOT:
          String(
            order.lot ??
            ""
          ),

        COIL:
          String(
            nextCoil
          ),

        SKU:
          String(
            order.sku
          ),

        DESCRIPTION:
          bottomDescription,

        UPPER_TEXT:
          upperText,

        COIL_DESCRIPTION:
          coilDescription,

        COIL_TECHNICAL:
          coilTechnical,

        COIL_LEGAL:
          coilLegal,

        COIL_ORIGIN:
          coilOrigin,

        BARCODE:
          String(
            order.sku
          ),

        QR:
          String(
            order.sku
          ),

        ROLLS:
          String(
            totalRolls
          )
      })
    );


    setShowPreview(
      true
    );

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
          Number(
            printed
          )
        )
      );


    const newStatus:
      "ABIERTA" |
      "FINALIZADA" =

      newPrinted >=
      totalRolls
        ? "FINALIZADA"
        : "ABIERTA";


    onSave({

      ...order,

      comments:
        comments.trim(),

      printed:
        newPrinted,

      status:
        newStatus,

      planningPosition:
        order.status ===
          "FINALIZADA" &&
        newStatus ===
          "ABIERTA"
          ? 0
          : order.planningPosition

    });


    onClose();

  }


  /*
   * ==================================================
   * REINICIAR
   * ==================================================
   */

  function restart() {

    setPrinted(
      0
    );


    setLabelData(
      prev => ({
        ...prev,

        ORDER:
          String(
            order.order
          ),

        LOT:
          String(
            order.lot ??
            ""
          ),

        COIL:
          String(
            firstCoil
          )
      })
    );

  }


  /*
   * ==================================================
   * SIGUIENTE ETIQUETA
   * ==================================================
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


    const currentCoil =
      firstCoil +
      safePrinted;


    if (
      currentCoil >
      9999
    ) {

      alert(
        "Se ha superado el Coil Number máximo: 9999."
      );


      return;

    }


    const newPrinted =
      safePrinted +
      1;


    setPrinted(
      newPrinted
    );


    /*
     * ==================================================
     * PREPARAR SIGUIENTE COIL
     * ==================================================
     */

    if (
      newPrinted <
      totalRolls
    ) {

      const newCoil =
        firstCoil +
        newPrinted;


      if (
        newCoil <=
        9999
      ) {

        setLabelData(
          prev => ({
            ...prev,

            COIL:
              String(
                newCoil
              )
          })
        );

      }

    }

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

        <Stack
          spacing={
            2
          }
        >

          {/* DATOS ETIQUETA */}

          <Paper
            variant="outlined"
            sx={{
              p:
                2
            }}
          >

            <Stack
              spacing={
                1.5
              }
            >

              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Datos de la etiqueta
              </Typography>


              <Typography>
                <strong>
                  Production Order:
                </strong>{" "}
                {order.order}
              </Typography>


              <Typography>
                <strong>
                  Lot Number:
                </strong>{" "}
                {
                  order.lot ||
                  "-"
                }
              </Typography>


              <Typography>
                <strong>
                  Coil Number:
                </strong>{" "}
                {
                  pending >
                  0
                    ? nextCoil
                    : "-"
                }
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
                {
                  order.printer ||
                  "-"
                }
              </Typography>

            </Stack>

          </Paper>


          {/* COMENTARIOS DE PLANIFICACIÓN */}

          <TextField
            label="Comentarios de planificación"
            value={
              comments
            }
            onChange={
              event => {

                setComments(
                  event.target.value
                );

              }
            }
            placeholder="Ej.: Palets nuevos 20 bobinas"
            multiline
            minRows={
              2
            }
            maxRows={
              4
            }
            fullWidth
            helperText="Este comentario se mostrará en la planificación de la línea."
          />


          <Divider />


          {/* PRODUCCIÓN */}

          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            Producción
          </Typography>


          <TextField
            label="Total de rollos / bobinas"
            value={
              totalRolls
            }
            disabled
            fullWidth
          />


          <TextField
            label="Etiquetas impresas"
            type="number"
            value={
              printed
            }
            onChange={
              event => {

                const value =
                  Number(
                    event.target.value
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

              }
            }
            inputProps={{
              min:
                0,

              max:
                totalRolls
            }}
            fullWidth
          />


          <TextField
            label="Etiquetas pendientes"
            value={
              pending
            }
            disabled
            fullWidth
          />


          <TextField
            label="Siguiente Coil Number"
            value={
              pending >
              0
                ? nextCoil
                : "-"
            }
            disabled
            fullWidth
          />


          <Divider />


          {/* ESTADO */}

          <Paper
            variant="outlined"
            sx={{
              p:
                2,

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
              {
                pending ===
                0
                  ? "FINALIZADA"
                  : "ABIERTA"
              }
            </Typography>

          </Paper>


          {/* CARGAR ETIQUETA */}

          {
            !showPreview &&
            (

              <Button
                variant="contained"
                onClick={
                  loadLabel
                }
                fullWidth
              >
                CARGAR ETIQUETA DE ESTA ORDEN
              </Button>

            )
          }


          {/* VISTA PREVIA */}

          {
            showPreview &&
            (

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
                    p:
                      2,

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
                        labelFormat ===
                        "FORMATO_2"
                          ? "320px"
                          : "400px"
                    }}
                  >

                    <Canvas
                      addText={
                        false
                      }
                      insertField=""
                      zoom={
                        labelFormat ===
                        "FORMATO_2"
                          ? 65
                          : 70
                      }
                      backgroundImage={
                        backgroundImage
                      }
                      labelFormat={
                        labelFormat
                      }
                    />

                  </Box>

                </Paper>


                {/* ETIQUETA ACTUAL */}

                <Paper
                  variant="outlined"
                  sx={{
                    p:
                      2
                  }}
                >

                  <Stack
                    spacing={
                      1
                    }
                  >

                    <Typography
                      fontWeight="bold"
                    >
                      Etiqueta actual
                    </Typography>


                    <Typography>
                      Production Order:{" "}
                      <strong>
                        {order.order}
                      </strong>
                    </Typography>


                    <Typography>
                      Lot Number:{" "}
                      <strong>
                        {
                          order.lot ||
                          "-"
                        }
                      </strong>
                    </Typography>


                    <Typography>
                      Coil Number:{" "}
                      <strong>
                        {
                          pending >
                          0
                            ? nextCoil
                            : "-"
                        }
                      </strong>
                    </Typography>


                    <Typography>
                      SKU:{" "}
                      <strong>
                        {order.sku}
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


                {/* SIMULACIÓN IMPRESIÓN */}

                <Button
                  variant="contained"
                  size="large"
                  onClick={
                    nextLabel
                  }
                  disabled={
                    pending ===
                    0
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
                  Cada etiqueta impresa aumenta automáticamente el Coil Number:
                  1, 2, 3... hasta 9999.
                </Typography>

              </>

            )
          }

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