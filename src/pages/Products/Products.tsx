import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";

import {
  DataGrid,
  type GridColDef
} from "@mui/x-data-grid";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import ProductDialog from "./ProductDialog";

import type {
  Product
} from "../../models/Product";

import {
  getProducts,
  saveProducts
} from "../../services/ProductStorage";

import {
  getTemplates
} from "../../services/TemplateStorage";

import {
  assignTemplateToSku
} from "../../services/ProductTemplateStorage";

import {
  previewSapProducts,
  confirmSapProducts,
  type SapProductPreview,
  type SapPreviewResult
} from "../../services/SapProductImport";


export default function Products() {

  const [
    products,
    setProducts
  ] = useState<Product[]>([]);


  const [
    templates,
    setTemplates
  ] = useState<any[]>([]);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    dialogOpen,
    setDialogOpen
  ] = useState(false);


  const [
    selectedProduct,
    setSelectedProduct
  ] = useState<
    Product | undefined
  >(undefined);


  /*
   * ==================================================
   * IMPORTACIÓN SAP
   * ==================================================
   */

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [
    importFile,
    setImportFile
  ] = useState<File | null>(
    null
  );


  const [
    preview,
    setPreview
  ] = useState<
    SapPreviewResult | null
  >(null);


  const [
    previewOpen,
    setPreviewOpen
  ] = useState(false);


  const [
    previewSearch,
    setPreviewSearch
  ] = useState("");


  const [
    previewFilter,
    setPreviewFilter
  ] = useState<
    "ALL" |
    "NEW" |
    "UPDATE" |
    "INCOMPLETE"
  >("ALL");


  const [
    readingFile,
    setReadingFile
  ] = useState(false);


  const [
    importing,
    setImporting
  ] = useState(false);


  const [
    message,
    setMessage
  ] = useState("");


  const [
    messageType,
    setMessageType
  ] = useState<
    "success" |
    "error" |
    "warning"
  >("success");


  /*
   * ==================================================
   * CARGA INICIAL
   * ==================================================
   */

  function loadData() {

    setProducts(
      getProducts()
    );


    setTemplates(
      getTemplates()
    );

  }


  useEffect(() => {

    loadData();

  }, []);


  /*
   * ==================================================
   * NUEVO PRODUCTO
   * ==================================================
   */

  function handleNewProduct() {

    setSelectedProduct(
      undefined
    );


    setDialogOpen(
      true
    );

  }


  /*
   * ==================================================
   * EDITAR PRODUCTO
   * ==================================================
   */

  function handleEditProduct(
    product: Product
  ) {

    setSelectedProduct(
      product
    );


    setDialogOpen(
      true
    );

  }


  /*
   * ==================================================
   * GUARDAR PRODUCTO
   * ==================================================
   */

  function handleSaveProduct(
    product: Product
  ) {

    const current =
      getProducts();


    const exists =
      current.some(
        item =>
          item.id ===
          product.id
      );


    let updated:
      Product[];


    if (
      exists
    ) {

      updated =
        current.map(
          item =>
            item.id ===
            product.id
              ? product
              : item
        );

    } else {

      updated = [
        ...current,
        product
      ];

    }


    saveProducts(
      updated
    );


    if (
      product.templateId
    ) {

      assignTemplateToSku(
        product.sapCode,
        product.templateId
      );

    }


    setProducts(
      updated
    );


    setDialogOpen(
      false
    );


    setSelectedProduct(
      undefined
    );

  }


  /*
   * ==================================================
   * ELIMINAR PRODUCTO
   * ==================================================
   */

  function handleDeleteProduct(
    product: Product
  ) {

    const confirmed =
      window.confirm(
        `¿Eliminar el producto ${product.sapCode}?`
      );


    if (
      !confirmed
    ) {

      return;

    }


    const updated =
      getProducts().filter(
        item =>
          item.id !==
          product.id
      );


    saveProducts(
      updated
    );


    setProducts(
      updated
    );

  }


  /*
   * ==================================================
   * CAMBIAR PLANTILLA
   * ==================================================
   */

  function handleTemplateChange(
    product: Product,
    templateId: number
  ) {

    const updatedProduct: Product = {
      ...product,
      templateId
    };


    const updated =
      getProducts().map(
        item =>
          item.id ===
          product.id
            ? updatedProduct
            : item
      );


    saveProducts(
      updated
    );


    assignTemplateToSku(
      product.sapCode,
      templateId
    );


    setProducts(
      updated
    );

  }


  /*
   * ==================================================
   * ABRIR SELECTOR DE ARCHIVO
   * ==================================================
   */

  function handleImportButton() {

    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";


      fileInputRef.current.click();

    }

  }


  /*
   * ==================================================
   * SELECCIONAR ARCHIVO SAP
   * ==================================================
   */

  async function handleFileSelected(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (
      !file
    ) {

      return;

    }


    const fileName =
      file.name.toLowerCase();


    const validFile =
      fileName.endsWith(
        ".xls"
      )
      ||
      fileName.endsWith(
        ".xlsx"
      )
      ||
      fileName.endsWith(
        ".xlsm"
      )
      ||
      fileName.endsWith(
        ".csv"
      )
      ||
      fileName.endsWith(
        ".txt"
      );


    if (
      !validFile
    ) {

      setMessageType(
        "error"
      );


      setMessage(
        "Formato no admitido. Selecciona un archivo XLS, XLSX, XLSM, CSV o TXT."
      );


      return;

    }


    setImportFile(
      file
    );


    setReadingFile(
      true
    );


    setPreviewSearch(
      ""
    );


    setPreviewFilter(
      "ALL"
    );


    try {

      const result =
        await previewSapProducts(
          file,
          getProducts()
        );


      setPreview(
        result
      );


      setPreviewOpen(
        true
      );

    } catch (
      error
    ) {

      console.error(
        error
      );


      setImportFile(
        null
      );


      setPreview(
        null
      );


      setMessageType(
        "error"
      );


      setMessage(
        error instanceof Error
          ? error.message
          : "No se ha podido analizar el archivo SAP."
      );

    } finally {

      setReadingFile(
        false
      );

    }

  }


  /*
   * ==================================================
   * CERRAR PREVISUALIZACIÓN
   * ==================================================
   */

  function handleClosePreview() {

    if (
      importing
    ) {

      return;

    }


    setPreviewOpen(
      false
    );


    setPreview(
      null
    );


    setImportFile(
      null
    );


    setPreviewSearch(
      ""
    );


    setPreviewFilter(
      "ALL"
    );

  }


  /*
   * ==================================================
   * CONFIRMAR IMPORTACIÓN
   * ==================================================
   */

  function handleConfirmImport() {

    if (
      !preview
    ) {

      return;

    }


    setImporting(
      true
    );


    try {

      const currentProducts =
        getProducts();


      const result =
        confirmSapProducts(
          preview.rows,
          currentProducts
        );


      saveProducts(
        result.products
      );


      /*
       * Conservamos / sincronizamos
       * las plantillas asignadas.
       */

      result.products.forEach(
        product => {

          if (
            product.templateId
          ) {

            assignTemplateToSku(
              product.sapCode,
              product.templateId
            );

          }

        }
      );


      setProducts(
        result.products
      );


      setPreviewOpen(
        false
      );


      setPreview(
        null
      );


      setImportFile(
        null
      );


      setPreviewSearch(
        ""
      );


      setPreviewFilter(
        "ALL"
      );


      setMessageType(
        "success"
      );


      setMessage(
        `Importación completada: ${result.created} nuevos · ${result.updated} actualizados · Total en Productos: ${result.products.length}.`
      );

    } catch (
      error
    ) {

      console.error(
        error
      );


      setMessageType(
        "error"
      );


      setMessage(
        error instanceof Error
          ? error.message
          : "No se ha podido completar la importación."
      );

    } finally {

      setImporting(
        false
      );

    }

  }


  /*
   * ==================================================
   * FILTRO PRODUCTOS
   * ==================================================
   */

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();


  const filteredProducts =
    products.filter(
      product => {

        if (
          !normalizedSearch
        ) {

          return true;

        }


        return (
          product.sapCode
            .toLowerCase()
            .includes(
              normalizedSearch
            )
          ||
          product.description
            .toLowerCase()
            .includes(
              normalizedSearch
            )
        );

      }
    );


  /*
   * ==================================================
   * FILTRO PREVISUALIZACIÓN
   * ==================================================
   */

  const normalizedPreviewSearch =
    previewSearch
      .trim()
      .toLowerCase();


  const filteredPreviewRows =
    (
      preview?.rows ??
      []
    ).filter(
      row => {

        const matchesSearch =
          !normalizedPreviewSearch
          ||
          row.sku
            .toLowerCase()
            .includes(
              normalizedPreviewSearch
            )
          ||
          row.description
            .toLowerCase()
            .includes(
              normalizedPreviewSearch
            );


        if (
          !matchesSearch
        ) {

          return false;

        }


        if (
          previewFilter ===
          "NEW"
        ) {

          return (
            row.status ===
            "NEW"
          );

        }


        if (
          previewFilter ===
          "UPDATE"
        ) {

          return (
            row.status ===
            "UPDATE"
          );

        }


        if (
          previewFilter ===
          "INCOMPLETE"
        ) {

          return (
            !row.completeTechnicalData
          );

        }


        return true;

      }
    );


  /*
   * ==================================================
   * COLUMNAS PRODUCTOS
   * ==================================================
   */

  const columns:
    GridColDef<Product>[] = [

      {
        field: "sapCode",
        headerName: "SKU",
        width: 150
      },

      {
        field: "description",
        headerName: "Descripción",
        flex: 1,
        minWidth: 420
      },

      {
        field: "diameter",
        headerName: "Ø",
        width: 70
      },

      {
        field: "thickness",
        headerName: "Mil",
        width: 75
      },

      {
        field: "flow",
        headerName: "l/h",
        width: 80
      },

      {
        field: "spacing",
        headerName: "Esp.",
        width: 80
      },

      {
        field: "templateId",
        headerName: "Plantilla",
        width: 250,

        sortable: false,

        renderCell: params => (

          <TextField
            select
            size="small"
            value={
              params.row.templateId ||
              0
            }
            onClick={
              event =>
                event.stopPropagation()
            }
            onChange={
              event => {

                handleTemplateChange(
                  params.row,
                  Number(
                    event.target.value
                  )
                );

              }
            }
            sx={{
              width: "100%",

              "& .MuiInputBase-root": {
                fontSize: 13
              }
            }}
          >

            <MenuItem
              value={0}
            >

              Sin plantilla

            </MenuItem>


            {templates.map(
              template => (

                <MenuItem
                  key={
                    template.id
                  }
                  value={
                    template.id
                  }
                >

                  {template.name}

                </MenuItem>

              )
            )}

          </TextField>

        )

      },

      {
        field: "actions",
        headerName: "Acciones",
        width: 120,

        sortable: false,

        filterable: false,

        align: "center",

        headerAlign: "center",

        renderCell: params => (

          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            sx={{
              width: "100%"
            }}
          >

            <Tooltip
              title="Editar"
            >

              <IconButton
                size="small"
                onClick={
                  event => {

                    event.stopPropagation();


                    handleEditProduct(
                      params.row
                    );

                  }
                }
              >

                <EditIcon
                  fontSize="small"
                />

              </IconButton>

            </Tooltip>


            <Tooltip
              title="Eliminar"
            >

              <IconButton
                size="small"
                color="error"
                onClick={
                  event => {

                    event.stopPropagation();


                    handleDeleteProduct(
                      params.row
                    );

                  }
                }
              >

                <DeleteIcon
                  fontSize="small"
                />

              </IconButton>

            </Tooltip>

          </Stack>

        )

      }

    ];


  /*
   * ==================================================
   * COLUMNAS PREVISUALIZACIÓN
   * ==================================================
   */

  const previewColumns:
    GridColDef<SapProductPreview>[] = [

      {
        field: "sku",
        headerName: "SKU",
        width: 135
      },

      {
        field: "description",
        headerName: "Descripción SAP",
        flex: 1,
        minWidth: 360
      },

      {
        field: "diameter",
        headerName: "Ø",
        width: 65,

        renderCell: params =>
          params.value ||
          "-"
      },

      {
        field: "thickness",
        headerName: "Mil",
        width: 70,

        renderCell: params =>
          params.value ||
          "-"
      },

      {
        field: "flow",
        headerName: "l/h",
        width: 70,

        renderCell: params =>
          params.value ||
          "-"
      },

      {
        field: "spacing",
        headerName: "Esp.",
        width: 70,

        renderCell: params =>
          params.value ||
          "-"
      },

      {
        field: "status",
        headerName: "Estado",
        width: 125,

        renderCell: params => (

          <Chip
            size="small"
            label={
              params.row.status ===
              "NEW"
                ? "NUEVO"
                : "ACTUALIZAR"
            }
            color={
              params.row.status ===
              "NEW"
                ? "success"
                : "info"
            }
            variant="outlined"
            sx={{
              fontWeight: 700
            }}
          />

        )

      },

      {
        field: "completeTechnicalData",
        headerName: "Datos",
        width: 120,

        sortable: false,

        renderCell: params => (

          params.row.completeTechnicalData
            ? (
              <Chip
                size="small"
                icon={
                  <CheckCircleIcon />
                }
                label="OK"
                color="success"
                variant="outlined"
                sx={{
                  fontWeight: 700
                }}
              />
            )
            : (
              <Chip
                size="small"
                icon={
                  <WarningAmberIcon />
                }
                label="REVISAR"
                color="warning"
                variant="outlined"
                sx={{
                  fontWeight: 700
                }}
              />
            )

        )

      }

    ];


  return (

    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        minWidth: 0,
        boxSizing: "border-box"
      }}
    >

      {/* =============================================
          CABECERA
          ============================================= */}

      <Stack
        direction={{
          xs: "column",
          sm: "row"
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center"
        }}
        spacing={2}
        sx={{
          mb: 2.5
        }}
      >

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >

          <Inventory2Icon
            sx={{
              fontSize: 46,
              color: "#0B7A3B"
            }}
          />


          <Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700
              }}
            >

              Productos

            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
            >

              Gestión de productos y asignación de plantillas

            </Typography>

          </Box>

        </Stack>


        <Stack
          direction="row"
          spacing={1.5}
        >

          <Button
            variant="outlined"
            startIcon={
              <UploadFileIcon />
            }
            onClick={
              handleImportButton
            }
            disabled={
              readingFile
            }
            sx={{
              whiteSpace: "nowrap",
              fontWeight: 700,
              borderColor: "#0B7A3B",
              color: "#0B7A3B",

              "&:hover": {
                borderColor: "#086832",
                backgroundColor: "#E8F5E9"
              }
            }}
          >

            {readingFile
              ? "ANALIZANDO..."
              : "IMPORTAR SAP"
            }

          </Button>


          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              handleNewProduct
            }
            sx={{
              whiteSpace: "nowrap",
              backgroundColor: "#0B7A3B",
              fontWeight: 700,

              "&:hover": {
                backgroundColor: "#086832"
              }
            }}
          >

            NUEVO PRODUCTO

          </Button>

        </Stack>

      </Stack>


      <input
        ref={
          fileInputRef
        }
        type="file"
        accept=".xls,.xlsx,.xlsm,.csv,.txt"
        onChange={
          handleFileSelected
        }
        style={{
          display: "none"
        }}
      />


      {/* =============================================
          BUSCADOR
          ============================================= */}

      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid #E0E0E0",
          borderRadius: 2
        }}
      >

        <CardContent
          sx={{
            p: 2,

            "&:last-child": {
              pb: 2
            }
          }}
        >

          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por SKU o descripción..."
            value={
              search
            }
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
            InputProps={{
              startAdornment: (
                <SearchIcon
                  sx={{
                    mr: 1,
                    color: "text.secondary"
                  }}
                />
              )
            }}
          />

        </CardContent>

      </Card>


      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1
        }}
      >

        {filteredProducts.length}
        {" "}
        productos

      </Typography>


      {/* =============================================
          TABLA PRODUCTOS
          ============================================= */}

      <Card
        elevation={0}
        sx={{
          width: "100%",
          border: "1px solid #E0E0E0",
          borderRadius: 2,
          overflow: "hidden"
        }}
      >

        <Box
          sx={{
            width: "100%",
            height: "calc(100vh - 315px)",
            minHeight: 480
          }}
        >

          <DataGrid
            rows={
              filteredProducts
            }
            columns={
              columns
            }
            disableRowSelectionOnClick
            pageSizeOptions={[
              25,
              50,
              100
            ]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                  page: 0
                }
              }
            }}
            sx={{
              border: 0,
              width: "100%",

              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#F7F9FA",
                fontWeight: 700
              },

              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700
              },

              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center"
              },

              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#F5FBF7"
              }
            }}
          />

        </Box>

      </Card>


      {/* =============================================
          PRODUCT DIALOG
          ============================================= */}

      <ProductDialog
        open={
          dialogOpen
        }
        product={
          selectedProduct
        }
        onClose={
          () => {

            setDialogOpen(
              false
            );


            setSelectedProduct(
              undefined
            );

          }
        }
        onSave={
          handleSaveProduct
        }
      />


      {/* =============================================
          VISTA PREVIA IMPORTACIÓN SAP
          ============================================= */}

      <Dialog
        open={
          previewOpen
        }
        onClose={
          importing
            ? undefined
            : handleClosePreview
        }
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: "95vw",
            maxWidth: "1500px",
            height: "90vh",
            maxHeight: "90vh"
          }
        }}
      >

        <DialogTitle
          sx={{
            pb: 1
          }}
        >

          <Stack
            direction={{
              xs: "column",
              md: "row"
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center"
            }}
            spacing={1}
          >

            <Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700
                }}
              >

                Vista previa de importación SAP

              </Typography>


              <Typography
                variant="body2"
                color="text.secondary"
              >

                {importFile?.name}

              </Typography>

            </Box>


            <Typography
              variant="body2"
              color="text.secondary"
            >

              Revisa los productos antes de confirmar

            </Typography>

          </Stack>

        </DialogTitle>


        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            pt: "12px !important"
          }}
        >

          {preview && (

            <>

              {/* =====================================
                  RESUMEN
                  ===================================== */}

              <Stack
                direction={{
                  xs: "column",
                  lg: "row"
                }}
                spacing={1}
                sx={{
                  mb: 2
                }}
              >

                <Chip
                  label={
                    `TOTAL ${preview.totalRows}`
                  }
                  sx={{
                    fontWeight: 700
                  }}
                />


                <Chip
                  label={
                    `NUEVOS ${preview.newProducts}`
                  }
                  color="success"
                  variant="outlined"
                  sx={{
                    fontWeight: 700
                  }}
                />


                <Chip
                  label={
                    `ACTUALIZAR ${preview.existingProducts}`
                  }
                  color="info"
                  variant="outlined"
                  sx={{
                    fontWeight: 700
                  }}
                />


                <Chip
                  label={
                    `DATOS OK ${preview.completeProducts}`
                  }
                  color="success"
                  variant="outlined"
                  sx={{
                    fontWeight: 700
                  }}
                />


                <Chip
                  label={
                    `REVISAR ${preview.incompleteProducts}`
                  }
                  color={
                    preview.incompleteProducts > 0
                      ? "warning"
                      : "default"
                  }
                  variant="outlined"
                  sx={{
                    fontWeight: 700
                  }}
                />

              </Stack>


              {preview.incompleteProducts > 0 && (

                <Alert
                  severity="warning"
                  sx={{
                    mb: 2
                  }}
                >

                  Hay productos en los que no se han podido identificar automáticamente todos los datos técnicos. Puedes importarlos igualmente: los campos no detectados quedarán vacíos y podrás completarlos posteriormente.

                </Alert>

              )}


              {/* =====================================
                  BUSCADOR + FILTRO
                  ===================================== */}

              <Stack
                direction={{
                  xs: "column",
                  md: "row"
                }}
                spacing={1.5}
                sx={{
                  mb: 2
                }}
              >

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar SKU o descripción en la importación..."
                  value={
                    previewSearch
                  }
                  onChange={
                    event =>
                      setPreviewSearch(
                        event.target.value
                      )
                  }
                  InputProps={{
                    startAdornment: (
                      <SearchIcon
                        sx={{
                          mr: 1,
                          color: "text.secondary"
                        }}
                      />
                    )
                  }}
                />


                <TextField
                  select
                  size="small"
                  label="Mostrar"
                  value={
                    previewFilter
                  }
                  onChange={
                    event =>
                      setPreviewFilter(
                        event.target.value as
                          | "ALL"
                          | "NEW"
                          | "UPDATE"
                          | "INCOMPLETE"
                      )
                  }
                  sx={{
                    minWidth: 210
                  }}
                >

                  <MenuItem
                    value="ALL"
                  >

                    Todos

                  </MenuItem>


                  <MenuItem
                    value="NEW"
                  >

                    Solo nuevos

                  </MenuItem>


                  <MenuItem
                    value="UPDATE"
                  >

                    Solo actualizar

                  </MenuItem>


                  <MenuItem
                    value="INCOMPLETE"
                  >

                    Solo revisar

                  </MenuItem>

                </TextField>

              </Stack>


              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1
                }}
              >

                Mostrando
                {" "}
                {filteredPreviewRows.length}
                {" "}
                de
                {" "}
                {preview.totalRows}
                {" "}
                productos

              </Typography>


              {/* =====================================
                  TABLA PREVISUALIZACIÓN
                  ===================================== */}

              <Box
                sx={{
                  flex: 1,
                  minHeight: 350,
                  border: "1px solid #E0E0E0",
                  borderRadius: 1,
                  overflow: "hidden"
                }}
              >

                <DataGrid
                  getRowId={
                    row =>
                      row.sku
                  }
                  rows={
                    filteredPreviewRows
                  }
                  columns={
                    previewColumns
                  }
                  disableRowSelectionOnClick
                  pageSizeOptions={[
                    25,
                    50,
                    100
                  ]}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 50,
                        page: 0
                      }
                    }
                  }}
                  sx={{
                    border: 0,

                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "#F7F9FA"
                    },

                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontWeight: 700
                    },

                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: "#F5FBF7"
                    }
                  }}
                />

              </Box>

            </>

          )}

        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #E0E0E0"
          }}
        >

          <Button
            disabled={
              importing
            }
            onClick={
              handleClosePreview
            }
          >

            CANCELAR

          </Button>


          <Button
            variant="contained"
            disabled={
              importing
              ||
              !preview
              ||
              preview.totalRows === 0
            }
            onClick={
              handleConfirmImport
            }
            sx={{
              backgroundColor: "#0B7A3B",
              fontWeight: 700,
              px: 3,

              "&:hover": {
                backgroundColor: "#086832"
              }
            }}
          >

            {importing
              ? "IMPORTANDO..."
              : `CONFIRMAR IMPORTACIÓN (${preview?.totalRows ?? 0})`
            }

          </Button>

        </DialogActions>

      </Dialog>


      {/* =============================================
          MENSAJES
          ============================================= */}

      <Snackbar
        open={
          message !== ""
        }
        autoHideDuration={9000}
        onClose={
          () =>
            setMessage("")
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
      >

        <Alert
          severity={
            messageType
          }
          variant="filled"
          onClose={
            () =>
              setMessage("")
          }
          sx={{
            width: "100%"
          }}
        >

          {message}

        </Alert>

      </Snackbar>

    </Box>

  );

}