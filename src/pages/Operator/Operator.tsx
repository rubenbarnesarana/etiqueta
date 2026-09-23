import type {
  ReactNode
} from "react";

import {
  Box,
  Card,
  Typography
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import {
  useNavigate
} from "react-router-dom";


export default function Operator() {

  const navigate =
    useNavigate();


  return (

    <Box
      sx={{
        width: "100%",
        minHeight:
          "calc(100vh - 128px)",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        pt: 7,
        pb: 5,

        boxSizing: "border-box"
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
          maxWidth: 220,
          height: 220,
          objectFit: "contain",
          mb: 2
        }}
      />


      {/* =============================================
          TÍTULO
          ============================================= */}

      <Typography
        variant="h4"
        sx={{
          color: "#0B7A3B",
          textAlign: "center",
          fontWeight: 800,

          fontSize: {
            xs: 42,
            md: 54
          },

          lineHeight: 1.1,

          mb: 1
        }}
      >

        PROGRAMA ETIQUETAS

      </Typography>


      {/* =============================================
          SUBTÍTULO
          ============================================= */}

      <Typography
        sx={{
          color: "text.secondary",
          textAlign: "center",

          fontSize: {
            xs: 18,
            md: 22
          },

          mb: 5
        }}
      >

        Rivulis Irrigation · QI02

      </Typography>


      {/* =============================================
          OPCIONES
          ============================================= */}

      <Box
        sx={{
          width: "100%",
          maxWidth: 800,

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)"
          },

          gap: 2
        }}
      >

        {/* PLANIFICACIÓN */}

        <OperatorCard
          title="Planificación"
          description="Planificación de las líneas"
          icon={
            <CalendarMonthIcon
              sx={{
                fontSize: 46
              }}
            />
          }
          onClick={
            () =>
              navigate(
                "/operator/planning"
              )
          }
        />


        {/* CARGAR ORDEN */}

        <OperatorCard
          title="Cargar Orden"
          description="Introducir una orden de producción manualmente"
          icon={
            <PrecisionManufacturingIcon
              sx={{
                fontSize: 46
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

      </Box>

    </Box>

  );

}


/*
 * ==================================================
 * TARJETA
 * ==================================================
 */

function OperatorCard({
  title,
  description,
  icon,
  onClick
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {

  return (

    <Card
      onClick={
        onClick
      }
      elevation={0}
      sx={{
        minHeight: 240,

        p: 3,

        display: "flex",
        flexDirection: "column",

        alignItems: "center",
        justifyContent: "center",

        textAlign: "center",

        cursor: "pointer",

        border:
          "1px solid #E0E0E0",

        borderRadius: 3,

        backgroundColor:
          "#FFFFFF",

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

      {/* ICONO */}

      <Box
        sx={{
          color:
            "#0B7A3B",

          mb: 2
        }}
      >

        {icon}

      </Box>


      {/* TÍTULO TARJETA */}

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          fontSize: 24
        }}
      >

        {title}

      </Typography>


      {/* DESCRIPCIÓN */}

      <Typography
        color="text.secondary"
        sx={{
          mt: 1,

          fontSize: 17,

          lineHeight: 1.35,

          maxWidth: 250
        }}
      >

        {description}

      </Typography>

    </Card>

  );

}