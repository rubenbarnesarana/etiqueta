import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from "@mui/material";

import {
  DataGrid
} from "@mui/x-data-grid";

import type {
  GridColDef
} from "@mui/x-data-grid";

import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import BackupIcon from "@mui/icons-material/Backup";

import * as XLSX from "xlsx";

import {
  deleteAllPrintHistory,
  getPrintHistory
} from "../../services/PrintHistoryService";

import type {
  PrintHistoryRecord
} from "../../services/PrintHistoryService";

import {
  useAuth
} from "../../auth/AuthContext";


type DeleteMode =
  | "DELETE"
  | "EXPORT_DELETE"
  | null;


export default function PrintHistory() {

  const {
    user
  } = useAuth();


  const [
    records,
    setRecords
  ] = useState<PrintHistoryRecord[]>([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const [
    success,
    setSuccess
  ] = useState("");


  const [
    search,
    setSearch
  ] = useState("");


  const [
    deleteMode,
    setDeleteMode
  ] = useState<DeleteMode>(
    null
  );


  const [
    deleting,
    setDeleting
  ] = useState(false);


  /*
   * ==================================================
   * PERMISOS
   * ==================================================
   */

  const isSupervisor =
    user?.role === "supervisor";


  /*
   * ==================================================
   * CARGAR HISTORIAL
   * ==================================================
   */

  async function loadHistory() {

    setLoading(
      true
    );


    setError("");


    try {

      const data =
        await getPrintHistory(
          5000
        );


      setRecords(
        data
      );

    }
    catch (
      loadError
    ) {

      console.error(
        "Error cargando historial:",
        loadError
      );


      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el historial de impresión."
      );

    }
    finally {

      setLoading(
        false
      );

    }

  }


  useEffect(() => {

    void loadHistory();

  }, []);


  /*
   * ==================================================
   * FILTRAR
   * ==================================================
   */

  const filteredRecords =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase();


        if (
          !value
        ) {

          return records;

        }


        return records.filter(
          record => {

            const searchable =
              [
                record.username,
                record.production_order,
                record.sku,
                record.description,
                record.lot,
                record.coil_number,
                record.printer,
                record.template_name,
                record.print_type,
                record.production_line
              ]
                .filter(
                  item =>
                    item !== null &&
                    item !== undefined
                )
                .join(" ")
                .toLowerCase();


            return searchable.includes(
              value
            );

          }
        );

      },
      [
        records,
        search
      ]
    );


  /*
   * ==================================================
   * FECHA Y HORA
   * ==================================================
   */

  function formatDateTime(
    value?: string
  ) {

    if (
      !value
    ) {

      return "";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }


    return date.toLocaleString(
      "es-ES",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );

  }


  /*
   * ==================================================
   * EXPORTAR EXCEL
   * ==================================================
   */

  function exportHistory(
    dataToExport: PrintHistoryRecord[] = records
  ) {

    if (
      dataToExport.length === 0
    ) {

      setError(
        "No hay registros para exportar."
      );

      return false;

    }


    const excelRows =
      dataToExport.map(
        record => ({

          "Fecha / Hora":
            formatDateTime(
              record.printed_at
            ),

          "Usuario":
            record.username,

          "Orden":
            record.production_order,

          "SKU":
            record.sku,

          "Producto":
            record.description ??
            "",

          "Lote":
            record.lot ??
            "",

          "Bobina":
            record.coil_number ??
            "",

          "Cantidad":
            record.quantity ??
            1,

          "Impresora":
            record.printer ??
            "",

          "Plantilla ID":
            record.template_id ??
            "",

          "Plantilla":
            record.template_name ??
            "",

          "Línea":
            record.production_line ??
            "",

          "Tipo":
            record.print_type ===
              "REPRINT"
              ? "REIMPRESIÓN"
              : "IMPRESIÓN"

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        excelRows
      );


    worksheet["!cols"] = [

      { wch: 21 },
      { wch: 22 },
      { wch: 17 },
      { wch: 16 },
      { wch: 50 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 18 },
      { wch: 14 },
      { wch: 24 },
      { wch: 10 },
      { wch: 16 }

    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Historial"
    );


    const now =
      new Date();


    const date =
      [
        now.getFullYear(),
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        ),
        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        )
      ].join("-");


    const time =
      [
        String(
          now.getHours()
        ).padStart(
          2,
          "0"
        ),
        String(
          now.getMinutes()
        ).padStart(
          2,
          "0"
        )
      ].join("-");


    XLSX.writeFile(
      workbook,
      `historial-etiquetas-${date}_${time}.xlsx`
    );


    setError("");


    setSuccess(
      `${dataToExport.length} registros exportados correctamente.`
    );


    return true;

  }


  /*
   * ==================================================
   * EXPORTAR HISTORIAL COMPLETO
   * ==================================================
   */

  function handleExport() {

    exportHistory(
      records
    );

  }


  /*
   * ==================================================
   * SOLICITAR BORRADO
   * ==================================================
   */

  function requestDelete(
    mode:
      | "DELETE"
      | "EXPORT_DELETE"
  ) {

    if (
      !isSupervisor
    ) {

      setError(
        "Solo un Supervisor puede borrar el historial."
      );

      return;

    }


    if (
      records.length === 0
    ) {

      setError(
        "El historial ya está vacío."
      );

      return;

    }


    setDeleteMode(
      mode
    );

  }


  /*
   * ==================================================
   * CONFIRMAR BORRADO
   * ==================================================
   */

  async function confirmDelete() {

    if (
      !deleteMode ||
      deleting
    ) {

      return;

    }


    if (
      !isSupervisor
    ) {

      setDeleteMode(
        null
      );

      setError(
        "Solo un Supervisor puede borrar el historial."
      );

      return;

    }


    setDeleting(
      true
    );


    setError("");


    try {

      /*
       * EXPORTAR ANTES DE BORRAR
       */

      if (
        deleteMode ===
        "EXPORT_DELETE"
      ) {

        const exported =
          exportHistory(
            records
          );


        if (
          !exported
        ) {

          return;

        }

      }


      /*
       * BORRAR SUPABASE
       */

      const deleted =
        await deleteAllPrintHistory();


      setDeleteMode(
        null
      );


      setRecords(
        []
      );


      setSearch("");


      setSuccess(
        `${deleted} registros eliminados del historial correctamente.`
      );


      /*
       * Recargar desde Supabase para comprobar
       * que realmente está vacío.
       */

      await loadHistory();

    }
    catch (
      deleteError
    ) {

      console.error(
        "Error borrando historial:",
        deleteError
      );


      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo borrar el historial."
      );

    }
    finally {

      setDeleting(
        false
      );

    }

  }


  /*
   * ==================================================
   * COLUMNAS
   * ==================================================
   */

  const columns:
    GridColDef[] = [

      {
        field:
          "printed_at",

        headerName:
          "Fecha / Hora",

        width:
          175,

        valueFormatter:
          value =>
            formatDateTime(
              value
            )
      },

      {
        field:
          "username",

        headerName:
          "Usuario",

        width:
          160
      },

      {
        field:
          "production_order",

        headerName:
          "Orden",

        width:
          145
      },

      {
        field:
          "sku",

        headerName:
          "SKU",

        width:
          135
      },

      {
        field:
          "description",

        headerName:
          "Producto",

        minWidth:
          300,

        flex:
          1
      },

      {
        field:
          "lot",

        headerName:
          "Lote",

        width:
          110
      },

      {
        field:
          "coil_number",

        headerName:
          "Bobina",

        width:
          90,

        type:
          "number"
      },

      {
        field:
          "printer",

        headerName:
          "Impresora",

        width:
          130
      },

      {
        field:
          "production_line",

        headerName:
          "Línea",

        width:
          85,

        type:
          "number"
      },

      {
        field:
          "print_type",

        headerName:
          "Tipo",

        width:
          130,

        renderCell:
          params => (

            <Chip
              size="small"
              label={
                params.value ===
                  "REPRINT"
                  ? "REIMPRESIÓN"
                  : "IMPRESIÓN"
              }
              color={
                params.value ===
                  "REPRINT"
                  ? "warning"
                  : "success"
              }
              variant="outlined"
              sx={{
                fontWeight: 700
              }}
            />

          )
      }

    ];


  /*
   * ==================================================
   * CONTADORES
   * ==================================================
   */

  const normalPrints =
    records.filter(
      record =>
        record.print_type !==
        "REPRINT"
    ).length;


  const reprints =
    records.filter(
      record =>
        record.print_type ===
        "REPRINT"
    ).length;


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box>

      {/* =============================================
          CABECERA
          ============================================= */}

      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap"
        }}
      >

        <HistoryIcon
          sx={{
            fontSize: 46,
            color: "#0B7A3B"
          }}
        />


        <Box
          sx={{
            flexGrow: 1
          }}
        >

          <Typography
            variant="h4"
            fontWeight={700}
          >

            Historial de impresión

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >

            Registro centralizado de las etiquetas impresas

          </Typography>

        </Box>


        <Button
          variant="outlined"
          startIcon={
            <RefreshIcon />
          }
          onClick={
            () =>
              void loadHistory()
          }
          disabled={
            loading
          }
          sx={{
            color: "#0B7A3B",
            borderColor: "#0B7A3B",
            fontWeight: 700
          }}
        >

          ACTUALIZAR

        </Button>

      </Box>


      {/* =============================================
          RESUMEN
          ============================================= */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3
        }}
      >

        <Grid
          size={{
            xs: 12,
            md: 4
          }}
        >

          <Card
            elevation={0}
            sx={{
              border:
                "1px solid #E0E0E0",
              borderRadius: 2
            }}
          >

            <CardContent>

              <Typography
                color="text.secondary"
              >

                Registros totales

              </Typography>


              <Typography
                variant="h4"
                fontWeight={700}
                color="#0B7A3B"
              >

                {records.length}

              </Typography>

            </CardContent>

          </Card>

        </Grid>


        <Grid
          size={{
            xs: 12,
            md: 4
          }}
        >

          <Card
            elevation={0}
            sx={{
              border:
                "1px solid #E0E0E0",
              borderRadius: 2
            }}
          >

            <CardContent>

              <Typography
                color="text.secondary"
              >

                Impresiones

              </Typography>


              <Typography
                variant="h4"
                fontWeight={700}
              >

                {normalPrints}

              </Typography>

            </CardContent>

          </Card>

        </Grid>


        <Grid
          size={{
            xs: 12,
            md: 4
          }}
        >

          <Card
            elevation={0}
            sx={{
              border:
                "1px solid #E0E0E0",
              borderRadius: 2
            }}
          >

            <CardContent>

              <Typography
                color="text.secondary"
              >

                Reimpresiones

              </Typography>


              <Typography
                variant="h4"
                fontWeight={700}
              >

                {reprints}

              </Typography>

            </CardContent>

          </Card>

        </Grid>

      </Grid>


      {/* =============================================
          ACCIONES
          ============================================= */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border:
            "1px solid #E0E0E0",
          borderRadius: 2
        }}
      >

        <CardContent
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >

          <Button
            variant="contained"
            startIcon={
              <DownloadIcon />
            }
            onClick={
              handleExport
            }
            disabled={
              records.length === 0
            }
            sx={{
              backgroundColor:
                "#0B7A3B",

              "&:hover": {
                backgroundColor:
                  "#086530"
              }
            }}
          >

            EXPORTAR EXCEL

          </Button>


          {
            isSupervisor
            &&
            (
              <>

                <Button
                  variant="outlined"
                  startIcon={
                    <BackupIcon />
                  }
                  onClick={
                    () =>
                      requestDelete(
                        "EXPORT_DELETE"
                      )
                  }
                  disabled={
                    records.length === 0
                  }
                  sx={{
                    color: "#0B7A3B",
                    borderColor: "#0B7A3B",
                    fontWeight: 700
                  }}
                >

                  EXPORTAR Y BORRAR

                </Button>


                <Button
                  variant="outlined"
                  color="error"
                  startIcon={
                    <DeleteForeverIcon />
                  }
                  onClick={
                    () =>
                      requestDelete(
                        "DELETE"
                      )
                  }
                  disabled={
                    records.length === 0
                  }
                  sx={{
                    fontWeight: 700
                  }}
                >

                  BORRAR HISTORIAL

                </Button>

              </>
            )
          }


          <Typography
            color="text.secondary"
            sx={{
              ml: {
                xs: 0,
                md: "auto"
              }
            }}
          >

            {
              isSupervisor
                ? "Supervisor: exportación y mantenimiento habilitados."
                : "La eliminación del historial está reservada al Supervisor."
            }

          </Typography>

        </CardContent>

      </Card>


      {/* =============================================
          MENSAJES
          ============================================= */}

      {
        success
        &&
        (

          <Alert
            severity="success"
            onClose={
              () =>
                setSuccess("")
            }
            sx={{
              mb: 3
            }}
          >

            {success}

          </Alert>

        )
      }


      {
        error
        &&
        (

          <Alert
            severity="error"
            onClose={
              () =>
                setError("")
            }
            sx={{
              mb: 3
            }}
          >

            {error}

          </Alert>

        )
      }


      {/* =============================================
          TABLA
          ============================================= */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid #E0E0E0",
          borderRadius: 3,
          overflow: "hidden"
        }}
      >

        <Box
          sx={{
            height: 6,
            backgroundColor:
              "#0B7A3B"
          }}
        />


        <CardContent
          sx={{
            p: 3
          }}
        >

          <TextField
            fullWidth
            label="Buscar"
            placeholder="Usuario, orden, SKU, producto, lote, bobina..."
            value={
              search
            }
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
            sx={{
              mb: 3
            }}
          />


          {
            loading
            ? (

              <Box
                sx={{
                  py: 8,
                  display: "flex",
                  justifyContent: "center"
                }}
              >

                <CircularProgress
                  sx={{
                    color: "#0B7A3B"
                  }}
                />

              </Box>

            )
            : (

              <Box
                sx={{
                  width: "100%"
                }}
              >

                <DataGrid
                  rows={
                    filteredRecords
                  }
                  columns={
                    columns
                  }
                  getRowId={
                    row =>
                      row.id
                  }
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 25,
                        page: 0
                      }
                    }
                  }}
                  pageSizeOptions={[
                    25,
                    50,
                    100
                  ]}
                  disableRowSelectionOnClick
                  autoHeight
                  sx={{
                    border: 0,

                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor:
                        "#F5F7FA",
                      fontWeight:
                        700
                    }
                  }}
                />

              </Box>

            )
          }

        </CardContent>

      </Card>


      {/* =============================================
          CONFIRMACIÓN DE BORRADO
          ============================================= */}

      <Dialog
        open={
          deleteMode !==
          null
        }
        onClose={
          deleting
            ? undefined
            : () =>
                setDeleteMode(
                  null
                )
        }
        maxWidth="sm"
        fullWidth
      >

        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#D32F2F"
          }}
        >

          {
            deleteMode ===
              "EXPORT_DELETE"
              ? "Exportar y borrar historial"
              : "Borrar historial"
          }

        </DialogTitle>


        <DialogContent>

          <DialogContentText>

            {
              deleteMode ===
                "EXPORT_DELETE"
                ? (
                  <>
                    Se exportarán los{" "}
                    <b>
                      {records.length}
                    </b>{" "}
                    registros actuales a un archivo Excel y,
                    a continuación, se eliminarán de la base
                    de datos.
                  </>
                )
                : (
                  <>
                    Vas a eliminar permanentemente{" "}
                    <b>
                      {records.length}
                    </b>{" "}
                    registros del historial de impresión.
                  </>
                )
            }

            <br />
            <br />

            Esta operación no se puede deshacer desde el programa.

          </DialogContentText>


          {
            deleteMode ===
              "DELETE"
            &&
            (

              <Alert
                severity="warning"
                sx={{
                  mt: 3
                }}
              >

                Se recomienda exportar el historial antes de borrarlo.

              </Alert>

            )
          }

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              () =>
                setDeleteMode(
                  null
                )
            }
            disabled={
              deleting
            }
          >

            CANCELAR

          </Button>


          <Button
            variant="contained"
            color="error"
            startIcon={
              deleting
                ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                )
                : (
                  <DeleteForeverIcon />
                )
            }
            onClick={
              () =>
                void confirmDelete()
            }
            disabled={
              deleting
            }
          >

            {
              deleting
                ? "PROCESANDO..."
                : deleteMode ===
                    "EXPORT_DELETE"
                  ? "EXPORTAR Y BORRAR"
                  : "BORRAR DEFINITIVAMENTE"
            }

          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}