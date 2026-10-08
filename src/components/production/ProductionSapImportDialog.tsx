import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import type {
  SapProductionPreviewResult,
  SapProductionPreviewRow
} from "../../services/SapProductionImport";


interface Props {

  open: boolean;

  preview: SapProductionPreviewResult | null;

  onClose: () => void;

  onRowsChange: (
    rows: SapProductionPreviewRow[]
  ) => void;

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
 * ESTADO
 * ==================================================
 */

function getStatusLabel(
  status: SapProductionPreviewRow["status"]
): string {

  switch (
    status
  ) {

    case "READY":
      return "Preparada";

    case "DUPLICATE":
      return "Duplicada";

    case "SKU_MISSING":
      return "SKU no existe";

    case "QUANTITY_UNKNOWN":
      return "Cantidad no detectada";

    case "ROLLS_NOT_INTEGER":
      return "Revisar bobinas";

    default:
      return status;

  }

}


function getStatusColor(
  status: SapProductionPreviewRow["status"]
):
  | "success"
  | "warning"
  | "error"
  | "default" {

  switch (
    status
  ) {

    case "READY":
      return "success";

    case "DUPLICATE":
      return "default";

    case "SKU_MISSING":
      return "error";

    case "QUANTITY_UNKNOWN":
      return "warning";

    case "ROLLS_NOT_INTEGER":
      return "warning";

    default:
      return "default";

  }

}


/*
 * ==================================================
 * COMPONENTE
 * ==================================================
 */

export default function ProductionSapImportDialog({

  open,

  preview,

  onClose,

  onRowsChange

}: Props) {

  if (
    !preview
  ) {

    return null;

  }


  /*
   * ==================================================
   * CAMBIAR LÍNEA
   * ==================================================
   */

  function changeLine(
    rowId: string,
    line: number
  ) {

    const updated =
      preview.rows.map(
        row => {

          if (
            row.id !==
            rowId
          ) {

            return row;

          }


          return {

            ...row,

            productionLine:
              line

          };

        }
      );


    onRowsChange(
      updated
    );

  }


  /*
   * ==================================================
   * CAMBIAR CANTIDAD POR BOBINA
   * ==================================================
   */

  function changeQuantityPerRoll(
    rowId: string,
    quantity: number
  ) {

    const updated =
      preview.rows.map(
        row => {

          if (
            row.id !==
            rowId
          ) {

            return row;

          }


          const safeQuantity =
            Number.isFinite(
              quantity
            )
              ? Math.max(
                  0,
                  quantity
                )
              : 0;


          const calculatedRolls =
            safeQuantity >
              0

              ? row.sapTotalQuantity /
                safeQuantity

              : 0;


          const integerRolls =
            Math.abs(
              calculatedRolls -
              Math.round(
                calculatedRolls
              )
            ) <
            0.000001;


          let status:
            SapProductionPreviewRow["status"] =
            row.status;


          let message =
            row.message;


          if (
            row.alreadyExists
          ) {

            status =
              "DUPLICATE";


            message =
              "Esta orden de fabricación ya existe en la aplicación.";

          }
          else if (
            !row.productExists
          ) {

            status =
              "SKU_MISSING";


            message =
              "El SKU no existe en Productos. Debe crearse antes de importar la OF.";

          }
          else if (
            safeQuantity <=
              0
          ) {

            status =
              "QUANTITY_UNKNOWN";


            message =
              "No se ha podido detectar automáticamente la cantidad por rollo / bobina.";

          }
          else if (
            !integerRolls
          ) {

            status =
              "ROLLS_NOT_INTEGER";


            message =
              "La cantidad SAP no da un número entero de rollos / bobinas. Debe revisarse.";

          }
          else {

            status =
              "READY";


            message =
              "Orden preparada para importar.";

          }


          return {

            ...row,

            quantityPerRoll:
              safeQuantity,

            calculatedRolls:
              integerRolls

                ? Math.round(
                    calculatedRolls
                  )

                : calculatedRolls,

            status,

            message

          };

        }
      );


    onRowsChange(
      updated
    );

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
      maxWidth="xl"
      PaperProps={{
        sx: {
          width:
            "98vw",

          maxWidth:
            "98vw",

          height:
            "92vh"
        }
      }}
    >

      <DialogTitle>

        <Stack
          spacing={0.5}
        >

          <Typography
            variant="h6"
            fontWeight={800}
          >
            Importar órdenes SAP
          </Typography>


          <Typography
            variant="body2"
            color="text.secondary"
          >
            {preview.fileName}
            {" · "}
            Hoja: {preview.sheetName}
          </Typography>

        </Stack>

      </DialogTitle>


      <DialogContent
        dividers
        sx={{
          p: 2
        }}
      >

        {/* ==========================================
            RESUMEN
            ========================================== */}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{
            mb: 2
          }}
        >

          <Chip
            label={
              `${preview.totalRows} filas`
            }
            variant="outlined"
          />


          <Chip
            label={
              `${preview.readyRows} preparadas`
            }
            color="success"
            variant="outlined"
          />


          <Chip
            label={
              `${preview.duplicateRows} duplicadas`
            }
            variant="outlined"
          />


          <Chip
            label={
              `${preview.missingProductRows} SKU no existentes`
            }
            color={
              preview.missingProductRows >
                0

                ? "error"

                : "default"
            }
            variant="outlined"
          />


          <Chip
            label={
              `${preview.incompleteRows} pendientes de revisar`
            }
            color={
              preview.incompleteRows >
                0

                ? "warning"

                : "default"
            }
            variant="outlined"
          />

        </Stack>


        <Alert
          severity="info"
          sx={{
            mb: 2
          }}
        >
          Esta pantalla todavía no crea ninguna orden. Revisa los datos, corrige la cantidad por bobina si fuera necesario y asigna la línea de producción.
        </Alert>


        {/* ==========================================
            TABLA
            ========================================== */}

        <Paper
          variant="outlined"
          sx={{
            overflow: "auto",
            maxHeight: "calc(92vh - 210px)"
          }}
        >

          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 1650
            }}
          >

            <TableHead>

              <TableRow>

                <TableCell>
                  Estado
                </TableCell>

                <TableCell>
                  OF
                </TableCell>

                <TableCell>
                  Puesto SAP
                </TableCell>

                <TableCell>
                  SKU
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 320
                  }}
                >
                  Descripción SAP
                </TableCell>

                <TableCell
                  align="right"
                >
                  Total SAP
                </TableCell>

                <TableCell
                  align="center"
                >
                  Unidad
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 150
                  }}
                >
                  Cant. / R-B
                </TableCell>

                <TableCell
                  align="right"
                >
                  R/B calculadas
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 140
                  }}
                >
                  Línea
                </TableCell>

                <TableCell>
                  Marcaje
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: 280
                  }}
                >
                  Observación
                </TableCell>

              </TableRow>

            </TableHead>


            <TableBody>

              {
                preview.rows.map(
                  row => (

                    <TableRow
                      key={
                        row.id
                      }
                      hover
                      sx={{
                        backgroundColor:
                          row.status ===
                            "READY"

                            ? "#F4FBF6"

                            : row.status ===
                                "SKU_MISSING"

                              ? "#FFF5F5"

                              : row.status ===
                                  "DUPLICATE"

                                ? "#FAFAFA"

                                : "#FFFBEA"
                      }}
                    >

                      {/* ESTADO */}

                      <TableCell>

                        <Chip
                          label={
                            getStatusLabel(
                              row.status
                            )
                          }
                          color={
                            getStatusColor(
                              row.status
                            )
                          }
                          size="small"
                          variant={
                            row.status ===
                              "READY"

                              ? "filled"

                              : "outlined"
                          }
                        />

                      </TableCell>


                      {/* OF */}

                      <TableCell>

                        <Typography
                          fontWeight={800}
                          sx={{
                            whiteSpace: "nowrap"
                          }}
                        >
                          {row.order}
                        </Typography>

                      </TableCell>


                      {/* PUESTO */}

                      <TableCell>

                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "nowrap"
                          }}
                        >
                          {
                            row.workCenter ||
                            "-"
                          }
                        </Typography>

                      </TableCell>


                      {/* SKU */}

                      <TableCell>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            whiteSpace: "nowrap"
                          }}
                        >
                          {row.sku}
                        </Typography>

                      </TableCell>


                      {/* DESCRIPCIÓN */}

                      <TableCell>

                        <Typography
                          variant="body2"
                        >
                          {
                            row.sapDescription ||
                            "-"
                          }
                        </Typography>

                      </TableCell>


                      {/* TOTAL SAP */}

                      <TableCell
                        align="right"
                      >

                        <Typography
                          fontWeight={800}
                          sx={{
                            whiteSpace: "nowrap"
                          }}
                        >
                          {
                            formatNumber(
                              row.sapTotalQuantity
                            )
                          }
                        </Typography>

                      </TableCell>


                      {/* UNIDAD */}

                      <TableCell
                        align="center"
                      >
                        {
                          row.quantityUnit ===
                            "UN"

                            ? "UN"

                            : "M"
                        }
                      </TableCell>


                      {/* CANTIDAD POR ROLLO */}

                      <TableCell>

                        <TextField
                          type="number"
                          size="small"
                          value={
                            row.quantityPerRoll
                          }
                          onChange={
                            event =>
                              changeQuantityPerRoll(
                                row.id,
                                Number(
                                  event.target.value
                                )
                              )
                          }
                          disabled={
                            row.status ===
                              "DUPLICATE" ||
                            row.status ===
                              "SKU_MISSING"
                          }
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              step: 1
                            }
                          }}
                          sx={{
                            width: 130
                          }}
                        />

                      </TableCell>


                      {/* BOBINAS */}

                      <TableCell
                        align="right"
                      >

                        <Typography
                          fontWeight={800}
                          color={
                            Number.isInteger(
                              row.calculatedRolls
                            )

                              ? "text.primary"

                              : "warning.main"
                          }
                        >
                          {
                            formatNumber(
                              row.calculatedRolls
                            )
                          }
                        </Typography>

                      </TableCell>


                      {/* LÍNEA */}

                      <TableCell>

                        <TextField
                          select
                          size="small"
                          value={
                            row.productionLine
                          }
                          onChange={
                            event =>
                              changeLine(
                                row.id,
                                Number(
                                  event.target.value
                                )
                              )
                          }
                          disabled={
                            row.status !==
                              "READY"
                          }
                          sx={{
                            width: 120
                          }}
                        >

                          <MenuItem
                            value={0}
                          >
                            Sin línea
                          </MenuItem>


                          {
                            [
                              1,
                              2,
                              3,
                              4,
                              5,
                              6,
                              7,
                              8
                            ].map(
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

                      </TableCell>


                      {/* MARCAJE */}

                      <TableCell>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            whiteSpace: "nowrap"
                          }}
                        >
                          {
                            row.marking ||
                            "-"
                          }
                        </Typography>

                      </TableCell>


                      {/* OBSERVACIÓN */}

                      <TableCell>

                        <Typography
                          variant="body2"
                          color={
                            row.status ===
                              "READY"

                              ? "success.main"

                              : row.status ===
                                  "SKU_MISSING"

                                ? "error.main"

                                : "text.secondary"
                          }
                        >
                          {row.message}
                        </Typography>

                      </TableCell>

                    </TableRow>

                  )
                )
              }

            </TableBody>

          </Table>

        </Paper>

      </DialogContent>


      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5
        }}
      >

        <Button
          onClick={
            onClose
          }
        >
          CERRAR
        </Button>


        <Button
          variant="contained"
          color="success"
          disabled
        >
          IMPORTAR ÓRDENES
        </Button>

      </DialogActions>

    </Dialog>

  );

}