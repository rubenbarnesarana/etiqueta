import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography
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

export default function Products() {

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    setProducts(getProducts());
  }

  function newProduct() {
    setEditing(undefined);
    setOpenDialog(true);
  }

  function editProduct(product: Product) {
    setEditing(product);
    setOpenDialog(true);
  }

  function saveProduct(product: Product) {

    if (editing) {

      updateProduct(product);

    } else {

      addProduct(product);

    }

    loadProducts();

    setEditing(undefined);

    setOpenDialog(false);

  }

  function deleteProduct(id: number) {

    if (!window.confirm("¿Eliminar este producto?")) return;

    removeProduct(id);

    loadProducts();

  }

  const templates = getTemplates();

  const rows = useMemo(() => {

    return products.map(product => ({

      ...product,

      template:

        templates.find(t => t.id === product.templateId)?.name ?? ""

    }));

  }, [products]);

  const filteredProducts = useMemo(() => {

    return rows.filter((p) =>

      p.sapCode.toLowerCase().includes(search.toLowerCase()) ||

      p.description.toLowerCase().includes(search.toLowerCase())

    );

  }, [rows, search]);

  const columns: GridColDef[] = [

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

    {
      field: "template",
      headerName: "Plantilla",
      flex: 1.2
    },

    {
      field: "actions",
      headerName: "",
      width: 120,
      sortable: false,

      renderCell: (params) => (

        <Stack direction="row">

          <Button
            onClick={() => editProduct(params.row as Product)}
          >
            <EditIcon />
          </Button>

          <Button
            color="error"
            onClick={() => deleteProduct(params.row.id)}
          >
            <DeleteIcon />
          </Button>

        </Stack>

      )

    }

  ];

  return (

    <Box>

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

      <Card sx={{ mb: 3 }}>

        <CardContent>

          <TextField
            fullWidth
            label="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </CardContent>

      </Card>

      <Card>

        <Box sx={{ height: 650 }}>

          <DataGrid

            rows={filteredProducts}

            columns={columns}

            pageSizeOptions={[10, 25, 50, 100]}

            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                  page: 0
                }
              }
            }}

            disableRowSelectionOnClick

            onRowDoubleClick={(params) =>
              editProduct(params.row as Product)
            }

          />

        </Box>

      </Card>

      <ProductDialog

        open={openDialog}

        editing={editing}

        onClose={() => {

          setEditing(undefined);

          setOpenDialog(false);

        }}

        onSave={saveProduct}

      />

    </Box>

  );

}