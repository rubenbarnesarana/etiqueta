import {
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import { useDesigner } from "./DesignerContext";

export default function PropertyPanel() {

  const {
    elements,
    selected,
    setElements,
    setSelected,
    labelData,
    setLabelData
  } = useDesigner();

  const element = elements.find(
    e => e.id === selected
  );

  function update(
    field: string,
    value: any
  ) {

    if (!element) return;

    setElements(prev =>
      prev.map(el =>
        el.id === element.id
          ? {
              ...el,
              [field]: value
            }
          : el
      )
    );
  }

  function updateLabelData(
    field: keyof typeof labelData,
    value: string
  ) {

    setLabelData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function deleteElement() {

    if (!element) return;

    setElements(prev =>
      prev.filter(
        el => el.id !== element.id
      )
    );

    setSelected(null);
  }

  if (!element) {

    return (
      <Card>

        <CardContent>

          <Typography>
            Seleccione un objeto
          </Typography>

        </CardContent>

      </Card>
    );
  }

  return (

    <Card>

      <CardContent>

        <Stack spacing={2}>

          {/* CABECERA */}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >

            <Typography
              variant="h6"
              fontWeight="bold"
            >
              Propiedades
            </Typography>

            <Tooltip title="Eliminar objeto">

              <IconButton
                color="error"
                onClick={deleteElement}
              >

                <DeleteIcon />

              </IconButton>

            </Tooltip>

          </Stack>

          <Divider />

          {/* TIPO */}

          <TextField
            label="Tipo"
            value={element.type}
            disabled
            fullWidth
          />

          {/* TEXTO */}

          <TextField
            label="Texto"
            value={element.text}
            onChange={(e) =>
              update(
                "text",
                e.target.value
              )
            }
            fullWidth
          />

          {/* ==================================================
              VINCULACIÓN
             ================================================== */}

          {(element.type === "field" ||
            element.type === "barcode" ||
            element.type === "qr") && (

            <TextField
              select
              label="Campo vinculado"
              value={element.binding ?? ""}
              onChange={(e) =>
                update(
                  "binding",
                  e.target.value
                )
              }
              fullWidth
            >

              <MenuItem value="">
                Sin vinculación
              </MenuItem>

              <MenuItem value="ORDER">
                Orden SAP
              </MenuItem>

              <MenuItem value="SKU">
                SKU
              </MenuItem>

              <MenuItem value="DESCRIPTION">
                Descripción
              </MenuItem>

              <MenuItem value="BARCODE">
                Código de barras
              </MenuItem>

              <MenuItem value="QR">
                QR
              </MenuItem>

              <MenuItem value="DATE">
                Fecha
              </MenuItem>

              <MenuItem value="LOT">
                Lote
              </MenuItem>

              <MenuItem value="COIL">
                Bobina
              </MenuItem>

              <MenuItem value="ROLLS">
                Rollos
              </MenuItem>

            </TextField>

          )}

          {/* ==================================================
              VALOR DE PRUEBA
             ================================================== */}

          {element.binding === "ORDER" && (

            <TextField
              label="Valor orden SAP"
              value={labelData.ORDER}
              onChange={(e) =>
                updateLabelData(
                  "ORDER",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "SKU" && (

            <TextField
              label="Valor SKU"
              value={labelData.SKU}
              onChange={(e) =>
                updateLabelData(
                  "SKU",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "DESCRIPTION" && (

            <TextField
              label="Valor descripción"
              value={labelData.DESCRIPTION}
              onChange={(e) =>
                updateLabelData(
                  "DESCRIPTION",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "BARCODE" && (

            <TextField
              label="Valor código de barras"
              value={labelData.BARCODE}
              onChange={(e) =>
                updateLabelData(
                  "BARCODE",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "QR" && (

            <TextField
              label="Valor QR"
              value={labelData.QR}
              onChange={(e) =>
                updateLabelData(
                  "QR",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "DATE" && (

            <TextField
              label="Valor fecha"
              value={labelData.DATE}
              onChange={(e) =>
                updateLabelData(
                  "DATE",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "LOT" && (

            <TextField
              label="Valor lote"
              value={labelData.LOT}
              onChange={(e) =>
                updateLabelData(
                  "LOT",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "COIL" && (

            <TextField
              label="Valor bobina"
              value={labelData.COIL}
              onChange={(e) =>
                updateLabelData(
                  "COIL",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          {element.binding === "ROLLS" && (

            <TextField
              label="Valor rollos"
              value={labelData.ROLLS}
              onChange={(e) =>
                updateLabelData(
                  "ROLLS",
                  e.target.value
                )
              }
              fullWidth
            />

          )}

          <Divider />

          {/* ==================================================
              POSICIÓN Y TAMAÑO
             ================================================== */}

          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            Posición y tamaño
          </Typography>

          <TextField
            label="Posición X"
            type="number"
            value={element.x}
            onChange={(e) =>
              update(
                "x",
                Number(e.target.value)
              )
            }
            fullWidth
          />

          <TextField
            label="Posición Y"
            type="number"
            value={element.y}
            onChange={(e) =>
              update(
                "y",
                Number(e.target.value)
              )
            }
            fullWidth
          />

          <TextField
            label="Ancho"
            type="number"
            value={element.width}
            onChange={(e) =>
              update(
                "width",
                Number(e.target.value)
              )
            }
            fullWidth
          />

          <TextField
            label="Alto"
            type="number"
            value={element.height}
            onChange={(e) =>
              update(
                "height",
                Number(e.target.value)
              )
            }
            fullWidth
          />

          <TextField
            label="Rotación"
            type="number"
            value={element.rotation}
            onChange={(e) =>
              update(
                "rotation",
                Number(e.target.value)
              )
            }
            fullWidth
          />

          <Divider />

          {/* ==================================================
              APARIENCIA
             ================================================== */}

          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            Apariencia
          </Typography>

          <TextField
            label="Tamaño letra"
            type="number"
            value={element.fontSize}
            onChange={(e) =>
              update(
                "fontSize",
                Number(e.target.value)
              )
            }
            fullWidth
          />

          <TextField
            select
            label="Peso"
            value={element.fontWeight}
            onChange={(e) =>
              update(
                "fontWeight",
                Number(e.target.value)
              )
            }
            fullWidth
          >

            <MenuItem value={400}>
              Normal
            </MenuItem>

            <MenuItem value={700}>
              Negrita
            </MenuItem>

          </TextField>

          <TextField
            type="color"
            label="Color"
            value={element.color}
            onChange={(e) =>
              update(
                "color",
                e.target.value
              )
            }
            InputLabelProps={{
              shrink: true
            }}
            fullWidth
          />

          <Divider />

          {/* ==================================================
              OPCIONES
             ================================================== */}

          <FormControlLabel
            control={
              <Switch
                checked={!element.locked}
                onChange={(e) =>
                  update(
                    "locked",
                    !e.target.checked
                  )
                }
              />
            }
            label="Editable"
          />

          <FormControlLabel
            control={
              <Switch
                checked={element.visible}
                onChange={(e) =>
                  update(
                    "visible",
                    e.target.checked
                  )
                }
              />
            }
            label="Visible"
          />

          {/* ==================================================
              CÓDIGO DE BARRAS
             ================================================== */}

          {element.type === "barcode" && (

            <>

              <Divider />

              <Typography
                variant="subtitle2"
                fontWeight="bold"
              >
                Código de barras
              </Typography>

              <TextField
                select
                label="Formato"
                value={
                  element.barcodeFormat ??
                  "CODE128"
                }
                onChange={(e) =>
                  update(
                    "barcodeFormat",
                    e.target.value
                  )
                }
                fullWidth
              >

                <MenuItem value="CODE128">
                  CODE128
                </MenuItem>

                <MenuItem value="EAN13">
                  EAN13
                </MenuItem>

                <MenuItem value="CODE39">
                  CODE39
                </MenuItem>

              </TextField>

              <TextField
                label="Altura"
                type="number"
                value={
                  element.barcodeHeight ??
                  45
                }
                onChange={(e) =>
                  update(
                    "barcodeHeight",
                    Number(e.target.value)
                  )
                }
                fullWidth
              />

              <TextField
                label="Ancho"
                type="number"
                value={
                  element.barcodeWidth ??
                  1.5
                }
                onChange={(e) =>
                  update(
                    "barcodeWidth",
                    Number(e.target.value)
                  )
                }
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={
                      element.barcodeDisplayValue ??
                      true
                    }
                    onChange={(e) =>
                      update(
                        "barcodeDisplayValue",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Mostrar valor"
              />

            </>

          )}

        </Stack>

      </CardContent>

    </Card>

  );
}