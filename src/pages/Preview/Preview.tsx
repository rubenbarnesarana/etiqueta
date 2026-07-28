import {
  Box,
  Paper,
  Typography,
  Button
} from "@mui/material";

import { useNavigate } from "react-router-dom";

export default function Preview() {

  const navigate = useNavigate();

  return (

    <Box>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >

        Vista previa

      </Typography>

      <Paper

        elevation={4}

        sx={{

          width:520,

          height:340,

          p:3,

          background:"#ffffff",

          border:"2px solid #0B7A3B",

          position:"relative"

        }}

      >

        <Typography fontWeight="bold">

          SKU

        </Typography>

        <Typography mb={2}>

          TD16PC16

        </Typography>

        <Typography fontWeight="bold">

          PRODUCTO

        </Typography>

        <Typography mb={2}>

          TOPDRIP PC 1.6

        </Typography>

        <Typography fontWeight="bold">

          LOTE

        </Typography>

        <Typography mb={2}>

          260727

        </Typography>

        <Typography fontWeight="bold">

          BOBINA

        </Typography>

        <Typography mb={2}>

          125

        </Typography>

        <Typography>

██████████████████████████████

        </Typography>

      </Paper>

      <Box mt={3}>

        <Button

          variant="contained"

          color="success"

        >

          Imprimir

        </Button>

        <Button

          sx={{ml:2}}

          onClick={()=>navigate(-1)}

        >

          Volver

        </Button>

      </Box>

    </Box>

  );

}