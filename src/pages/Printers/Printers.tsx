import {
  Box,
  Card,
  CardContent,
  Typography
} from "@mui/material";

import PrintIcon from "@mui/icons-material/Print";


export default function Printers() {

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

        <PrintIcon
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
            Impresoras
          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >
            Configuración y gestión de impresoras de etiquetas
          </Typography>

        </Box>

      </Box>


      {/* =============================================
          CONFIGURACIÓN DE IMPRESORAS
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

            <PrintIcon
              sx={{
                color: "#0B7A3B",
                fontSize: 30
              }}
            />


            <Typography
              variant="h6"
              fontWeight={700}
            >
              Impresoras
            </Typography>

          </Box>


          <Typography
            color="text.secondary"
          >
            Desde esta sección se gestionará la configuración de las
            impresoras utilizadas para la impresión de etiquetas.
          </Typography>

        </CardContent>

      </Card>

    </Box>

  );

}