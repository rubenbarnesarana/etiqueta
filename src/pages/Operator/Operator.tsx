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
          maxWidth: 360,
          maxHeight: 150,
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
          textAlign: "center",
          mb: 5
        }}
      >

        PROGRAMA ETIQUETAS

      </Typography>


      {/* =============================================
          OPCIONES
          ============================================= */}

      <Box
        sx={{
          width: "100%",
          maxWidth: 620,

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)"
          },

          gap: 2.5
        }}
      >

        {/* PLANIFICACIÓN */}

        <OperatorCard
          title="Planificación"
          description="Seleccionar una orden de producción planificada"
          icon={
            <CalendarMonthIcon
              sx={{
                fontSize: 52
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
                fontSize: 52
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

        Rivulis Irrigation · QI02

      </Typography>

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
        minHeight: 210,

        p: 3,

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

          mb: 2
        }}
      >

        {icon}

      </Box>


      <Typography
        variant="h5"
        fontWeight={700}
      >

        {title}

      </Typography>


      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 1,
          maxWidth: 220
        }}
      >

        {description}

      </Typography>

    </Card>

  );

}