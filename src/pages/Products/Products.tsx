import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  MenuItem
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import ProductDialog from "./ProductDialog";

import type { Product } from "../../models/Product";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct as removeProduct
} from "../../services/ProductStorage";

import {
  getTemplates
} from "../../services/TemplateStorage";

import {
  getTemplateForSku,
  assignTemplateToSku,
  removeAssignment
} from "../../services/ProductTemplateStorage";

export default function Products() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [editing, setEditing] =
    useState<Product | undefined>();

  const [templateRefresh, setTemplateRefresh] =
    useState(0);

  //--------------------------------------------------
  // CARGAR PRODUCTOS
  //--------------------------------------------------

  useEffect(() => {

    loadProducts();

  }, []);

  function loadProducts() {

    setProducts(
      getProducts()
    );

  }

  //--------------------------------------------------
  // NUEVO PRODUCTO
  //--------------------------------------------------

  function newProduct() {

    setEditing(undefined);

    setOpenDialog(true);

  }

  //--------------------------------------------------
  // EDITAR PRODUCTO
  //--------------------------------------------------

  function editProduct(
    product: Product
  ) {

    setEditing(product);

    setOpenDialog(true);

  }

  //--------------------------------------------------
  // GUARDAR PRODUCTO
  //--------------------------------------------------

  function saveProduct(
    product: Product
  ) {

    if (editing) {

      updateProduct(product);

    } else {

      addProduct(product);

    }

    loadProducts();

    setEditing(undefined);

    setOpenDialog(false);

    setTemplateRefresh(
      value => value + 1
    );

  }

  //--------------------------------------------------
  // ELIMINAR PRODUCTO
  //--------------------------------------------------

  function deleteProduct(
    id: number
  ) {

    if (
      !window.confirm(
        "¿Eliminar este producto?"
      )
    ) {

      return;

    }

    const product =
      products.find(
        item =>
          Number(item.id) ===
          Number(id)
      );

    if (product) {

      removeAssignment(
        product.sapCode
      );

    }

    removeProduct(id);

    loadProducts();

    setTemplateRefresh(
      value => value + 1
    );

  }

  //--------------------------------------------------
  // PLANTILLAS
  //--------------------------------------------------

  const templates =
    useMemo(
      () => getTemplates(),
      [templateRefresh]
    );

  //--------------------------------------------------
  // CAMBIAR PLANTILLA
  //--------------------------------------------------

  function changeTemplate(
    sku: string,
    value: string
  ) {

    if (!value) {

      removeAssignment(sku);

    } else {

      assignTemplateToSku(
        sku,
        Number(value)
      );

    }

    setTemplateRefresh(
      refresh => refresh + 1
    );

  }

  //--------------------------------------------------
  // FILAS
  //--------------------------------------------------

  const rows =
    useMemo(() => {

      return products.map(
        product => {

          const assignedTemplateId =
            getTemplateForSku(
              product.sapCode
            );

          const productTemplateId =
            assignedTemplateId ??
            product.templateId;

          const template =
            templates.find(
              item =>
                Number(item.id) ===
                Number(productTemplateId)
            );

          return {

            ...product,

            template:
              template?.name ?? "",

            assignedTemplateId:
              productTemplateId ?? ""

          };

        }
      );

    }, [
      products,
      templates,
      templateRefresh
    ]);

  //--------------------------------------------------
  // FILTRAR
  //--------------------------------------------------

  const filteredProducts =
    useMemo(() => {

      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {

        return rows;

      }

      return rows.filter(
        product =>

          product.sapCode
            .toLowerCase()
            .includes(value)

          ||

          product.description
            .toLowerCase()
            .includes(value)

      );

    }, [
      rows,
      search
    ]);

  //--------------------------------------------------
  // COLUMNAS
  //--------------------------------------------------

  const columns:
    GridColDef[] = [

    {
      field: "sapCode",
      headerName: "SKU",
      flex: 1
    },

    {
      field: "description",
      headerName: "Descripción",
      flex: 2
    },

    {
      field: "diameter",
      headerName: "Ø",
      width: 90
    },

    {
      field: "thickness",
      headerName: "Mil",
      width: 90
    },

    {
      field: "flow",
      headerName: "l/h",
      width: 90
    },

    {
      field: "spacing",
      headerName: "Esp.",
      width: 90
    },

    {
      field: "dripper",
      headerName: "Gotero",
      flex: 1.3
    },

    //------------------------------------------------
    // PLANTILLA
    //------------------------------------------------

    {
      field: "assignedTemplateId",

      headerName: "Plantilla",

      flex: 1.5,

      sortable: false,

      renderCell: (params) => {

        const sku =
          String(
            params.row.sapCode
          );

        const current =
          params.row.assignedTemplateId
            ? String(
                params.row.assignedTemplateId
              )
            : "";

        return (

          <TextField
            select
            size="small"
            fullWidth
            value={current}
            onChange={(event) => {

              changeTemplate(
                sku,
                event.target.value
              );

            }}
            sx={{
              minWidth: 170,
              mt: 0.5
            }}
          >

            <MenuItem value="">
              Sin plantilla
            </MenuItem>

            {templates
              .filter(
                template =>
                  template.active
              )
              .map(
                template => (

                  <MenuItem
                    key={template.id}
                    value={
                      String(
                        template.id
                      )
                    }
                  >

                    {template.name}

                  </MenuItem>

                )
              )}

          </TextField>

        );

      }

    },

    //------------------------------------------------
    // ACCIONES
    //------------------------------------------------

    {
      field: "actions",

      headerName: "",

      width: 120,

      sortable: false,

      renderCell: (params) => (

        <Stack
          direction="row"
        >

          <Button
            onClick={() =>
              editProduct(
                params.row as Product
              )
            }
          >

            <EditIcon />

          </Button>

          <Button
            color="error"
            onClick={() =>
              deleteProduct(
                params.row.id
              )
            }
          >

            <DeleteIcon />

          </Button>

        </Stack>

      )

    }

  ];

  //--------------------------------------------------
  // PANTALLA
  //--------------------------------------------------

  return (

    <Box>

      {/* CABECERA */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >

        <Typography
          variant="h4"
          fontWeight="bold"
        >

          Productos

        </Typography>

        <Button
          variant="contained"
          color="success"
          onClick={newProduct}
        >

          Nuevo producto

        </Button>

      </Stack>

      {/* BUSCADOR */}

      <Card
        sx={{
          mb: 3
        }}
      >

        <CardContent>

          <TextField
            fullWidth
            label="Buscar producto..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </CardContent>

      </Card>

      {/* TABLA */}

      <Card>

        <Box
          sx={{
            height: 650
          }}
        >

          <DataGrid

            rows={
              filteredProducts
            }

            columns={
              columns
            }

            pageSizeOptions={[
              10,
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

            disableRowSelectionOnClick

            onRowDoubleClick={
              (params) =>
                editProduct(
                  params.row as Product
                )
            }

          />

        </Box>

      </Card>

      {/* DIALOGO PRODUCTO */}

      <ProductDialog

        open={
          openDialog
        }

        editing={
          editing
        }

        onClose={() => {

          setEditing(
            undefined
          );

          setOpenDialog(
            false
          );

        }}

        onSave={
          saveProduct
        }

      />

    </Box>

  );

}