import {
  useRef,
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Typography
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BackupIcon from "@mui/icons-material/Backup";
import StorageIcon from "@mui/icons-material/Storage";

import {
  getPrintHistory,
  registerPrint
} from "../../services/PrintHistoryService";


interface BackupFile {

  application: string;

  version: number;

  createdAt: string;

  data: Record<string, string>;

}


export default function Settings() {


  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [
    message,
    setMessage
  ] = useState("");


  const [
    confirmOpen,
    setConfirmOpen
  ] = useState(false);


  const [
    pendingBackup,
    setPendingBackup
  ] = useState<BackupFile | null>(
    null
  );


  const [
    testingDatabase,
    setTestingDatabase
  ] = useState(false);


  const [
    databaseStatus,
    setDatabaseStatus
  ] = useState<
    "idle" |
    "success" |
    "error"
  >("idle");


  const [
    databaseMessage,
    setDatabaseMessage
  ] = useState("");


  /*
   * ==================================================
   * EXPORTAR DATOS
   * ==================================================
   */

  function exportData() {

    const data: Record<string, string> = {};


    for (
      let i = 0;
      i < localStorage.length;
      i++
    ) {

      const key =
        localStorage.key(i);


      if (
        !key
      ) {

        continue;

      }


      const value =
        localStorage.getItem(
          key
        );


      if (
        value !== null
      ) {

        data[key] =
          value;

      }

    }


    const backup: BackupFile = {

      application:
        "Rivulis Programa Etiquetas",

      version:
        1,

      createdAt:
        new Date().toISOString(),

      data

    };


    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
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


    link.href =
      url;


    link.download =
      `etiquetas-backup-${date}_${time}.json`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );


    setMessage(
      "Copia de seguridad creada correctamente."
    );

  }


  /*
   * ==================================================
   * SELECCIONAR ARCHIVO
   * ==================================================
   */

  function selectImportFile() {

    fileInputRef.current?.click();

  }


  /*
   * ==================================================
   * LEER ARCHIVO
   * ==================================================
   */

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    event.target.value =
      "";


    if (
      !file
    ) {

      return;

    }


    try {

      const text =
        await file.text();


      const parsed =
        JSON.parse(
          text
        ) as BackupFile;


      if (
        parsed.application !==
          "Rivulis Programa Etiquetas"
        ||
        parsed.version !==
          1
        ||
        !parsed.data
        ||
        typeof parsed.data !==
          "object"
      ) {

        throw new Error(
          "Archivo no válido"
        );

      }


      setPendingBackup(
        parsed
      );


      setConfirmOpen(
        true
      );

    }
    catch {

      setMessage(
        "El archivo seleccionado no es una copia de seguridad válida."
      );

    }

  }


  /*
   * ==================================================
   * IMPORTAR DATOS
   * ==================================================
   */

  function importData() {

    if (
      !pendingBackup
    ) {

      return;

    }


    localStorage.clear();


    Object.entries(
      pendingBackup.data
    ).forEach(
      ([key, value]) => {

        localStorage.setItem(
          key,
          value
        );

      }
    );


    setConfirmOpen(
      false
    );


    setPendingBackup(
      null
    );


    window.location.reload();

  }


  /*
   * ==================================================
   * PROBAR SUPABASE
   * ==================================================
   */

  async function testDatabase() {

    if (
      testingDatabase
    ) {

      return;

    }


    setTestingDatabase(
      true
    );


    setDatabaseStatus(
      "idle"
    );


    setDatabaseMessage(
      ""
    );


    try {

      const testOrder =
        `TEST-${Date.now()}`;


      const inserted =
        await registerPrint({

          username:
            "Rubén - PRUEBA",

          productionOrder:
            testOrder,

          sku:
            "TEST-SUPABASE",

          description:
            "Registro de prueba de conexión",

          lot:
            "TEST",

          coilNumber:
            1,

          quantity:
            1,

          printer:
            "PRUEBA",

          templateName:
            "PRUEBA",

          printType:
            "PRINT",

          productionLine:
            1

        });


      const history =
        await getPrintHistory(
          20
        );


      const found =
        history.some(
          record =>
            record.id ===
              inserted.id
            ||
            record.production_order ===
              testOrder
        );


      if (
        !found
      ) {

        throw new Error(
          "El registro se guardó, pero no se pudo recuperar al consultar el historial."
        );

      }


      setDatabaseStatus(
        "success"
      );


      setDatabaseMessage(
        "Conexión correcta. La aplicación ha guardado y leído un registro en Supabase."
      );

    }
    catch (
      error
    ) {

      console.error(
        "Error probando Supabase:",
        error
      );


      setDatabaseStatus(
        "error"
      );


      setDatabaseMessage(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con Supabase."
      );

    }
    finally {

      setTestingDatabase(
        false
      );

    }

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box
      sx={{
        maxWidth: 1050,
        mx: "auto"
      }}
    >

      {/* =============================================
          CABECERA
          ============================================= */}

      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2
        }}
      >

        <SettingsIcon
          sx={{
            fontSize: 46,
            color: "#0B7A3B"
          }}
        />


        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
          >

            Configuración

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >

            Ajustes y copia de seguridad de la aplicación

          </Typography>

        </Box>

      </Box>


      {/* =============================================
          BASE DE DATOS
          ============================================= */}

      <Card
        sx={{
          borderRadius: 2,
          mb: 3
        }}
      >

        <CardContent
          sx={{
            p: 4
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2
            }}
          >

            <StorageIcon
              sx={{
                color: "#0B7A3B",
                fontSize: 30
              }}
            />


            <Typography
              variant="h6"
              fontWeight={700}
            >

              Base de datos

            </Typography>

          </Box>


          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
              maxWidth: 750
            }}
          >

            Comprueba la conexión entre el Programa de Etiquetas
            y la base de datos de historial de impresión.

          </Typography>


          <Button
            variant="contained"
            disabled={
              testingDatabase
            }
            startIcon={
              testingDatabase
                ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                )
                : (
                  <StorageIcon />
                )
            }
            onClick={
              testDatabase
            }
            sx={{
              backgroundColor:
                "#0B7A3B",

              "&:hover": {
                backgroundColor:
                  "#08652F"
              }
            }}
          >

            {
              testingDatabase
                ? "PROBANDO..."
                : "PROBAR CONEXIÓN"
            }

          </Button>


          {
            databaseStatus ===
              "success"
            &&
            (
              <Alert
                severity="success"
                sx={{
                  mt: 3
                }}
              >

                {
                  databaseMessage
                }

              </Alert>
            )
          }


          {
            databaseStatus ===
              "error"
            &&
            (
              <Alert
                severity="error"
                sx={{
                  mt: 3
                }}
              >

                {
                  databaseMessage
                }

              </Alert>
            )
          }

        </CardContent>

      </Card>


      {/* =============================================
          COPIA DE SEGURIDAD
          ============================================= */}

      <Card
        sx={{
          borderRadius: 2
        }}
      >

        <CardContent
          sx={{
            p: 4
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2
            }}
          >

            <BackupIcon
              sx={{
                color: "#0B7A3B",
                fontSize: 30
              }}
            />


            <Typography
              variant="h6"
              fontWeight={700}
            >

              Copia de seguridad

            </Typography>

          </Box>


          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
              maxWidth: 750
            }}
          >

            Exporta todos los datos almacenados en este navegador
            para poder restaurarlos posteriormente o trasladarlos
            a otro equipo.

          </Typography>


          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap"
            }}
          >

            <Button
              variant="contained"
              startIcon={
                <DownloadIcon />
              }
              onClick={
                exportData
              }
              sx={{
                backgroundColor:
                  "#0B7A3B",

                "&:hover": {
                  backgroundColor:
                    "#08652F"
                }
              }}
            >

              EXPORTAR DATOS

            </Button>


            <Button
              variant="outlined"
              startIcon={
                <UploadFileIcon />
              }
              onClick={
                selectImportFile
              }
              sx={{
                color:
                  "#0B7A3B",

                borderColor:
                  "#0B7A3B",

                "&:hover": {

                  borderColor:
                    "#08652F",

                  backgroundColor:
                    "#E8F5E9"

                }
              }}
            >

              IMPORTAR DATOS

            </Button>


            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".json,application/json"
              hidden
              onChange={
                handleFileChange
              }
            />

          </Box>


          <Alert
            severity="info"
            sx={{
              mt: 3
            }}
          >

            La importación sustituirá los datos actuales de este navegador
            por los incluidos en la copia de seguridad.

          </Alert>

        </CardContent>

      </Card>


      {/* =============================================
          CONFIRMACIÓN IMPORTACIÓN
          ============================================= */}

      <Dialog
        open={
          confirmOpen
        }
        onClose={
          () =>
            setConfirmOpen(
              false
            )
        }
      >

        <DialogTitle>

          Importar copia de seguridad

        </DialogTitle>


        <DialogContent>

          <DialogContentText>

            Los datos actuales de este navegador serán sustituidos
            por los datos de la copia de seguridad seleccionada.

            <br />
            <br />

            Después de importar, la aplicación se recargará
            automáticamente.

          </DialogContentText>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              () =>
                setConfirmOpen(
                  false
                )
            }
          >

            CANCELAR

          </Button>


          <Button
            variant="contained"
            onClick={
              importData
            }
            sx={{
              backgroundColor:
                "#0B7A3B"
            }}
          >

            IMPORTAR

          </Button>

        </DialogActions>

      </Dialog>


      {/* =============================================
          MENSAJE
          ============================================= */}

      <Snackbar
        open={
          Boolean(
            message
          )
        }
        autoHideDuration={
          4000
        }
        onClose={
          () =>
            setMessage("")
        }
        message={
          message
        }
      />

    </Box>

  );

}