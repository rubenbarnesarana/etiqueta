import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box
} from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PrintIcon from "@mui/icons-material/Print";
import LabelIcon from "@mui/icons-material/Label";

import { getProducts } from "../../services/ProductStorage";
import { getOrders } from "../../services/OrderStorage";

export default function Dashboard() {

  const products = getProducts();

  const orders = getOrders();

  const openOrders = orders.filter(
    o => o.status === "ABIERTA"
  ).length;

  const printedLabels = orders.reduce(
    (acc, o) => acc + o.printed,
    0
  );

  const cards = [

    {
      title: "Productos",
      value: products.length,
      icon: <Inventory2Icon sx={{ fontSize: 50 }} />,
      color: "#1976D2"
    },

    {
      title: "Órdenes abiertas",
      value: openOrders,
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 50 }} />,
      color: "#2E7D32"
    },

    {
      title: "Etiquetas impresas",
      value: printedLabels,
      icon: <PrintIcon sx={{ fontSize: 50 }} />,
      color: "#EF6C00"
    },

    {
      title: "Plantillas",
      value: products.filter(
        p => p.template !== ""
      ).length,
      icon: <LabelIcon sx={{ fontSize: 50 }} />,
      color: "#6A1B9A"
    }

  ];

  return (

    <Box>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={4}
      >

        Dashboard

      </Typography>

      <Grid container spacing={3}>

        {cards.map(card => (

          <Grid
            key={card.title}
            size={{ xs: 12, sm: 6, lg: 3 }}
          >

            <Card
              elevation={4}
              sx={{
                borderRadius: 3
              }}
            >

              <CardContent>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >

                  <Box>

                    <Typography
                      color="text.secondary"
                    >

                      {card.title}

                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight="bold"
                    >

                      {card.value}

                    </Typography>

                  </Box>

                  <Box
                    sx={{
                      color: card.color
                    }}
                  >

                    {card.icon}

                  </Box>

                </Box>

              </CardContent>

            </Card>

          </Grid>

        ))}

      </Grid>

    </Box>

  );

}