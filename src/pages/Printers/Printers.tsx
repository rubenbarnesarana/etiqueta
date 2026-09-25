import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";

import {
  useEffect,
  useState
} from "react";

import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ComputerIcon from "@mui/icons-material/Computer";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";

import BackButton from "../../components/common/BackButton";

import {
  getDefaultPrinter,
  getInstalledPrinters,
  printTestPage
} from "../../services/QzPrintService";


/*
 * ==================================================
 * CLAVE LOCAL
 * ==================================================
 *
 * Esta configuración pertenece exclusivamente
 * a este navegador / ordenador.
 *
 * NO se guarda en Supabase.
 * NO afecta a otros PCs de producción.
 * ==================================================
 */

const LABEL_PRINTER_STORAGE_KEY =
  "labelPrinter";


export default function Printers() {


  /*
   * ==================================================
   * ESTADO
   * ==================================================
   */

  const [
    printers,
    setPrinters
  ] = useState<string[]>([]);


  const [
    defaultPrinter,
    setDefaultPrinter
  ] = useState<string | null>(
    null
  );


  const [
    selectedPrinter,
    setSelectedPrinter
  ] = useState("");


  const [
    savedPrinter,
    setSavedPrinter
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    connected,
    setConnected
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  const [
    testPrinting,
    setTestPrinting
  ] = useState(false);


  /*
   * ==================================================
   * CARGAR CONFIGURACIÓN LOCAL
   * ==================================================
   */

  useEffect(
    () => {

      const storedPrinter =
        localStorage.getItem(
          LABEL_PRINTER_STORAGE_KEY
        ) || "";


      setSavedPrinter(
        storedPrinter
      );


      setSelectedPrinter(
        storedPrinter
      );

    },
    []
  );


  /*
   * ==================================================
   * DETECTAR IMPRESORAS
   * ==================================================
   */

  async function detectPrinters() {

    setLoading(
      true
    );

    setError("");

    setSuccessMessage("");


    try {

      const [
        installedPrinters,
        windowsDefaultPrinter
      ] =
        await Promise.all([
          getInstalledPrinters(),
          getDefaultPrinter()
        ]);


      setPrinters(
        installedPrinters
      );


      setDefaultPrinter(
        windowsDefaultPrinter
      );


      setConnected(
        true
      );


      if (
        !savedPrinter &&
        windowsDefaultPrinter
      ) {

        setSelectedPrinter(
          windowsDefaultPrinter
        );

      }

    }
    catch (
      err
    ) {

      console.error(
        "Error conectando con QZ Tray:",
        err
      );


      setConnected(
        false
      );


      setPrinters(
        []
      );


      setDefaultPrinter(
        null
      );


      setError(
        "No se ha podido conectar con QZ Tray. Comprueba que QZ Tray está abierto en este ordenador."
      );

    }
    finally {

      setLoading(
        false
      );

    }

  }


  /*
   * ==================================================
   * GUARDAR IMPRESORA DE ETIQUETAS
   * ==================================================
   */

  function savePrinter() {

    setError("");

    setSuccessMessage("");


    if (
      !selectedPrinter
    ) {

      setError(
        "Selecciona una impresora antes de guardar."
      );

      return;

    }


    localStorage.setItem(
      LABEL_PRINTER_STORAGE_KEY,
      selectedPrinter
    );


    setSavedPrinter(
      selectedPrinter
    );


    setSuccessMessage(
      "Impresora de etiquetas guardada correctamente para este ordenador."
    );

  }


  /*
   * ==================================================
   * IMPRESIÓN DE PRUEBA
   * ==================================================
   */

  async function handleTestPrint() {

    setError("");

    setSuccessMessage("");

    setTestPrinting(
      true
    );


    try {

      await printTestPage();


      setSuccessMessage(
        "Prueba enviada correctamente a la impresora."
      );

    }
    catch (
      err
    ) {

      console.error(
        "Error realizando impresión de prueba:",
        err
      );


      const message =
        err instanceof Error
          ? err.message
          : "No se ha podido realizar la impresión de prueba.";


      setError(
        message
      );

    }
    finally {

      setTestPrinting(
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
        maxWidth:
          1050,

        mx:
          "auto"
      }}
    >

      {/* =============================================
          INICIO
          ============================================= */}

      <BackButton
        showBack={false}
      />


      {/* =============================================
          CABECERA
          ============================================= */}

      <Box
        sx={{
          mb:
            4,

          display:
            "flex",

          alignItems:
            "center",

          gap:
            2
        }}
      >

        <PrintIcon
          sx={{
            fontSize:
              46,

            color:
              "#0B7A3B"
          }}
        />


        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
          >

            Impresoras

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt:
                0.5
            }}
          >

            Configuración y gestión de impresoras de etiquetas

          </Typography>

        </Box>

      </Box>


      {/* =============================================
          CONEXIÓN LOCAL
          ============================================= */}

      <Card
        sx={{
          borderRadius:
            2,

          mb:
            3
        }}
      >

        <CardContent
          sx={{
            p:
              4
          }}
        >

          <Stack
            direction={{
              xs:
                "column",

              sm:
                "row"
            }}

            alignItems={{
              xs:
                "flex-start",

              sm:
                "center"
            }}

            justifyContent="space-between"

            spacing={2}
          >

            <Box
              sx={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  1.5
              }}
            >

              <ComputerIcon
                sx={{
                  color:
                    "#0B7A3B",

                  fontSize:
                    30
                }}
              />


              <Box>

                <Typography
                  variant="h6"
                  fontWeight={700}
                >

                  Impresoras de este ordenador

                </Typography>


                <Typography
                  color="text.secondary"
                  sx={{
                    mt:
                      0.5
                  }}
                >

                  Detecta las impresoras instaladas en Windows mediante QZ Tray.

                </Typography>

              </Box>

            </Box>


            <Button
              variant="contained"

              startIcon={
                loading
                  ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  )
                  : (
                    <RefreshIcon />
                  )
              }

              disabled={
                loading
              }

              onClick={
                detectPrinters
              }

              sx={{
                minHeight:
                  44,

                px:
                  3,

                fontWeight:
                  700,

                whiteSpace:
                  "nowrap",

                backgroundColor:
                  "#0B7A3B",

                "&:hover": {

                  backgroundColor:
                    "#086530"

                }
              }}
            >

              {
                loading
                  ? "CONECTANDO..."
                  : "DETECTAR IMPRESORAS"
              }

            </Button>

          </Stack>


          {
            connected
            &&
            (

              <Alert
                severity="success"
                sx={{
                  mt:
                    3
                }}
              >

                QZ Tray conectado correctamente.

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
                  mt:
                    3
                }}
              >

                {error}

              </Alert>

            )
          }

        </CardContent>

      </Card>


      {/* =============================================
          IMPRESORA ASIGNADA
          ============================================= */}

      {
        printers.length > 0
        &&
        (

          <Card
            sx={{
              borderRadius:
                2,

              mb:
                3,

              border:
                savedPrinter
                  ? "2px solid #0B7A3B"
                  : undefined
            }}
          >

            <CardContent
              sx={{
                p:
                  4
              }}
            >

              <Box
                sx={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    1.5,

                  mb:
                    3
                }}
              >

                <SettingsIcon
                  sx={{
                    color:
                      "#0B7A3B",

                    fontSize:
                      30
                  }}
                />


                <Box>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >

                    Impresora de etiquetas de este ordenador

                  </Typography>


                  <Typography
                    color="text.secondary"
                    sx={{
                      mt:
                        0.5
                    }}
                  >

                    Selecciona la impresora que utilizará este PC para imprimir las etiquetas.

                  </Typography>

                </Box>

              </Box>


              {
                savedPrinter
                &&
                (

                  <Alert
                    severity="info"
                    sx={{
                      mb:
                        3
                    }}
                  >

                    Impresora configurada:{" "}

                    <b>
                      {savedPrinter}
                    </b>

                  </Alert>

                )
              }


              <FormControl
                fullWidth
              >

                <InputLabel
                  id="label-printer-select-label"
                >

                  Impresora de etiquetas

                </InputLabel>


                <Select
                  labelId="label-printer-select-label"

                  label="Impresora de etiquetas"

                  value={
                    selectedPrinter
                  }

                  onChange={
                    event => {

                      setSelectedPrinter(
                        event.target.value
                      );

                      setSuccessMessage("");

                    }
                  }
                >

                  {
                    printers.map(
                      printer => (

                        <MenuItem
                          key={
                            printer
                          }

                          value={
                            printer
                          }
                        >

                          {printer}

                          {
                            printer ===
                            defaultPrinter
                            &&
                            " (Predeterminada)"
                          }

                        </MenuItem>

                      )
                    )
                  }

                </Select>

              </FormControl>


              {/* =========================================
                  ACCIONES DE IMPRESORA
                  ========================================= */}

              <Box
                sx={{
                  display:
                    "flex",

                  justifyContent:
                    "flex-end",

                  gap:
                    2,

                  mt:
                    2,

                  flexWrap:
                    "wrap"
                }}
              >

                {
                  savedPrinter
                  &&
                  (

                    <Button
                      variant="outlined"

                      startIcon={
                        testPrinting
                          ? (
                            <CircularProgress
                              size={18}
                              color="inherit"
                            />
                          )
                          : (
                            <PrintIcon />
                          )
                      }

                      disabled={
                        testPrinting
                      }

                      onClick={
                        handleTestPrint
                      }

                      sx={{
                        minHeight:
                          48,

                        px:
                          3,

                        fontWeight:
                          800,

                        color:
                          "#0B7A3B",

                        borderColor:
                          "#0B7A3B",

                        whiteSpace:
                          "nowrap",

                        "&:hover": {

                          borderColor:
                            "#086530",

                          backgroundColor:
                            "#F2F8F4"

                        }
                      }}
                    >

                      {
                        testPrinting
                          ? "IMPRIMIENDO..."
                          : "IMPRIMIR PRUEBA"
                      }

                    </Button>

                  )
                }


                <Button
                  variant="contained"

                  startIcon={
                    <SaveIcon />
                  }

                  onClick={
                    savePrinter
                  }

                  sx={{
                    minHeight:
                      48,

                    px:
                      3,

                    fontWeight:
                      800,

                    whiteSpace:
                      "nowrap",

                    backgroundColor:
                      "#0B7A3B",

                    "&:hover": {

                      backgroundColor:
                        "#086530"

                    }
                  }}
                >

                  GUARDAR IMPRESORA

                </Button>

              </Box>


              {
                successMessage
                &&
                (

                  <Alert
                    severity="success"
                    sx={{
                      mt:
                        3
                    }}
                  >

                    {successMessage}

                  </Alert>

                )
              }

            </CardContent>

          </Card>

        )
      }


      {/* =============================================
          LISTADO DE IMPRESORAS
          ============================================= */}

      <Card
        sx={{
          borderRadius:
            2
        }}
      >

        <CardContent
          sx={{
            p:
              4
          }}
        >

          <Box
            sx={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                1.5,

              mb:
                2
            }}
          >

            <PrintIcon
              sx={{
                color:
                  "#0B7A3B",

                fontSize:
                  30
              }}
            />


            <Typography
              variant="h6"
              fontWeight={700}
            >

              Impresoras detectadas

            </Typography>

          </Box>


          {
            printers.length === 0
            &&
            !loading
            &&
            (

              <Typography
                color="text.secondary"
              >

                Pulsa "Detectar impresoras" para consultar las impresoras instaladas en este ordenador.

              </Typography>

            )
          }


          {
            printers.length > 0
            &&
            (

              <>

                <Typography
                  color="text.secondary"
                  sx={{
                    mb:
                      2
                  }}
                >

                  Se han detectado{" "}

                  <b>
                    {printers.length}
                  </b>

                  {" "}impresora
                  {printers.length !== 1 ? "s" : ""}.

                </Typography>


                <Divider />


                <List
                  disablePadding
                >

                  {
                    printers.map(
                      printer => {

                        const isDefault =
                          printer ===
                          defaultPrinter;


                        const isLabelPrinter =
                          printer ===
                          savedPrinter;


                        return (

                          <ListItem
                            key={
                              printer
                            }

                            sx={{
                              py:
                                2
                            }}
                          >

                            <ListItemIcon>

                              {
                                isLabelPrinter
                                  ? (
                                    <CheckCircleIcon
                                      sx={{
                                        color:
                                          "#0B7A3B"
                                      }}
                                    />
                                  )
                                  : (
                                    <PrintIcon
                                      color="action"
                                    />
                                  )
                              }

                            </ListItemIcon>


                            <ListItemText
                              primary={
                                printer
                              }

                              secondary={
                                isLabelPrinter
                                  ? "Impresora de etiquetas configurada para este ordenador"
                                  : isDefault
                                    ? "Impresora predeterminada de Windows"
                                    : "Impresora instalada en este ordenador"
                              }

                              slotProps={{
                                primary: {

                                  fontWeight:
                                    700

                                }
                              }}
                            />


                            <Stack
                              direction="row"
                              spacing={1}
                            >

                              {
                                isDefault
                                &&
                                (

                                  <Chip
                                    label="WINDOWS"
                                    size="small"

                                    sx={{
                                      fontWeight:
                                        700
                                    }}
                                  />

                                )
                              }


                              {
                                isLabelPrinter
                                &&
                                (

                                  <Chip
                                    label="ETIQUETAS"
                                    size="small"

                                    sx={{
                                      fontWeight:
                                        700,

                                      color:
                                        "#0B7A3B",

                                      backgroundColor:
                                        "#E8F3EB"
                                    }}
                                  />

                                )
                              }

                            </Stack>

                          </ListItem>

                        );

                      }
                    )
                  }

                </List>

              </>

            )
          }

        </CardContent>

      </Card>

    </Box>

  );

}