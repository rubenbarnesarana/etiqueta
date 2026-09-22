import {
  Box,
  Card,
  Typography
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PrintIcon from "@mui/icons-material/Print";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import {
  useNavigate
} from "react-router-dom";


export default function Home() {

  const navigate =
    useNavigate();


  return (

    <Box
      sx={{
        minHeight:
          "calc(100vh - 128px)",

        display: "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        py: 4
      }}
    >

      {/* =============================================
          LOGO RIVULIS
          ============================================= */}

      <Box
        component="img"
        src="/images/rivulis-logo.png"
        alt="Rivulis"
        sx={{
          width: "100%",
          maxWidth: 430,
          maxHeight: 180,
          objectFit: "contain",
          mb: 2
        }}
      />


      {/* =============================================
          TÍTULO
          ============================================= */}

      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          color: "#0B7A3B",
          textAlign: "center"
        }}
      >

        PROGRAMA ETIQUETAS

      </Typography>


      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          mt: 1,
          mb: 5,
          textAlign: "center",
          fontWeight: 400
        }}
      >

        Rivulis Irrigation · QI02

      </Typography>


      {/* =============================================
          ACCESOS RÁPIDOS
          ============================================= */}

      <Box
        sx={{
          width: "100%",
          maxWidth: 900,

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)"
          },

          gap: 2
        }}
      >

        {/* PLANIFICACIÓN */}

        <HomeCard
          title="Planificación"
          description="Planificación de las líneas"
          icon={
            <CalendarMonthIcon
              sx={{
                fontSize: 42
              }}
            />
          }
          onClick={
            () =>
              navigate(
                "/planning"
              )
          }
        />


        {/* PRODUCCIÓN */}

        <HomeCard
          title="Producción"
          description="Órdenes de producción"
          icon={
            <PrecisionManufacturingIcon
              sx={{
                fontSize: 42
              }}
            />
          }
          onClick={
            () =>
              navigate(
                "/production"
              )
          }
        />


        {/* IMPRIMIR */}

        <HomeCard
          title="Imprimir Orden"
          description="Impresión de etiquetas"
          icon={
            <PrintIcon
              sx={{
                fontSize: 42
              }}
            />
          }
          onClick={
            () =>
              navigate(
                "/operator/load"
              )
          }
        />


        {/* PRODUCTOS */}

        <HomeCard
          title="Productos"
          description="Gestión de productos"
          icon={
            <Inventory2Icon
              sx={{
                fontSize: 42
              }}
            />
          }
          onClick={
            () =>
              navigate(
                "/products"
              )
          }
        />

      </Box>


      {/* =============================================
          PIE
          ============================================= */}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: 5
        }}
      >

        Rivulis Irrigation

      </Typography>

    </Box>

  );

}


/*
 * ==================================================
 * TARJETA DE ACCESO
 * ==================================================
 */

function HomeCard({
  title,
  description,
  icon,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {

  return (

    <Card
      onClick={
        onClick
      }
      elevation={0}
      sx={{
        minHeight: 160,

        p: 2.5,

        display: "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        textAlign:
          "center",

        cursor:
          "pointer",

        border:
          "1px solid #E0E0E0",

        borderRadius: 3,

        transition:
          "all 0.2s ease",

        "&:hover": {
          transform:
            "translateY(-4px)",

          boxShadow:
            "0 8px 24px rgba(0,0,0,0.10)",

          borderColor:
            "#0B7A3B",

          backgroundColor:
            "#F7FBF8"
        }
      }}
    >

      <Box
        sx={{
          color:
            "#0B7A3B",

          mb: 1.5
        }}
      >

        {icon}

      </Box>


      <Typography
        variant="h6"
        fontWeight={700}
      >

        {title}

      </Typography>


      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.5
        }}
      >

        {description}

      </Typography>

    </Card>

  );

}