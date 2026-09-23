import {
  Box,
  Button
} from "@mui/material";

import ArrowBackRoundedIcon
  from "@mui/icons-material/ArrowBackRounded";

import HomeRoundedIcon
  from "@mui/icons-material/HomeRounded";

import {
  useNavigate
} from "react-router-dom";


interface BackButtonProps {

  label?: string;

  onClick?: () => void;

  showHome?: boolean;

  showBack?: boolean;

}


export default function BackButton({
  label = "VOLVER",
  onClick,
  showHome = true,
  showBack = true
}: BackButtonProps) {

  const navigate =
    useNavigate();


  /*
   * ==================================================
   * VOLVER
   * ==================================================
   */

  function handleBack() {

    if (
      onClick
    ) {

      onClick();

      return;

    }


    navigate(-1);

  }


  /*
   * ==================================================
   * IR A INICIO
   * ==================================================
   */

  function handleHome() {

    navigate("/");

  }


  /*
   * ==================================================
   * ESTILO COMÚN DE LOS BOTONES
   * ==================================================
   */

  const buttonStyle = {

    height: 68,

    px: 2.5,

    display: "flex",

    justifyContent:
      "flex-start",

    alignItems:
      "center",

    gap: 1.8,

    border:
      "2px solid #0B7A3B",

    borderRadius:
      "16px",

    backgroundColor:
      "#FFFFFF",

    color:
      "#0B7A3B",

    fontSize:
      19,

    fontWeight:
      800,

    letterSpacing:
      "0.4px",

    textTransform:
      "uppercase",

    boxShadow:
      "0 5px 14px rgba(11, 122, 59, 0.16)",

    transition:
      "all 0.18s ease",

    "&:hover": {

      backgroundColor:
        "#EAF6EE",

      borderColor:
        "#086530",

      color:
        "#086530",

      boxShadow:
        "0 7px 18px rgba(11, 122, 59, 0.24)",

      transform:
        "translateY(-2px)"

    },

    "&:active": {

      transform:
        "translateY(0)",

      boxShadow:
        "0 3px 9px rgba(11, 122, 59, 0.18)"

    }

  };


  /*
   * ==================================================
   * ICONO CIRCULAR
   * ==================================================
   */

  const iconStyle = {

    width: 46,

    height: 46,

    flexShrink: 0,

    borderRadius:
      "50%",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    backgroundColor:
      "#0B7A3B",

    color:
      "#FFFFFF",

    boxShadow:
      "0 3px 8px rgba(11, 122, 59, 0.25)",

    transition:
      "all 0.18s ease"

  };


  return (

    <Box
      sx={{
        mt: 3,
        mb: 4,

        display: "flex",

        alignItems:
          "center",

        gap: 2,

        flexWrap:
          "wrap"
      }}
    >

      {/* =============================================
          INICIO
          ============================================= */}

      {showHome && (

        <Button
          onClick={
            handleHome
          }
          sx={{
            ...buttonStyle,

            minWidth:
              205,

            "&:hover .homeIcon": {

              backgroundColor:
                "#086530",

              transform:
                "scale(1.08)"

            }

          }}
        >

          <Box
            className="homeIcon"
            sx={
              iconStyle
            }
          >

            <HomeRoundedIcon
              sx={{
                fontSize: 29
              }}
            />

          </Box>


          <Box
            component="span"
            sx={{
              flexGrow: 1,

              textAlign:
                "center",

              pr: 2
            }}
          >

            INICIO

          </Box>

        </Button>

      )}


      {/* =============================================
          VOLVER
          ============================================= */}

      {showBack && (

        <Button
          onClick={
            handleBack
          }
          sx={{
            ...buttonStyle,

            minWidth:
              225,

            "&:hover .backIcon": {

              backgroundColor:
                "#086530",

              transform:
                "translateX(-3px)"

            }

          }}
        >

          <Box
            className="backIcon"
            sx={
              iconStyle
            }
          >

            <ArrowBackRoundedIcon
              sx={{
                fontSize: 30
              }}
            />

          </Box>


          <Box
            component="span"
            sx={{
              flexGrow: 1,

              textAlign:
                "center",

              pr: 2.5
            }}
          >

            {label}

          </Box>

        </Button>

      )}

    </Box>

  );

}