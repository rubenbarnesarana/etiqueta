import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useLocation
} from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Divider
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PrintIcon from "@mui/icons-material/Print";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import AppRoutes from "../routes/AppRoutes";

import Operator from "../pages/Operator/Operator";
import OperatorPlanning from "../pages/Operator/OperatorPlanning";
import OperatorLoad from "../pages/Operator/OperatorLoad";
import OrderPrint from "../pages/Operator/OrderPrint";

import {
  useAuth
} from "../auth/AuthContext";


const drawerWidth = 250;


export default function MainLayout() {

  const {
    user,
    logout
  } = useAuth();


  const location =
    useLocation();


  const isOperator =
    user?.role === "operator";


  /*
   * ==================================================
   * FECHA Y HORA
   * ==================================================
   */

  const [
    currentDate,
    setCurrentDate
  ] = useState(
    new Date()
  );


  useEffect(() => {

    const timer =
      window.setInterval(
        () => {

          setCurrentDate(
            new Date()
          );

        },
        1000
      );


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, []);


  const dateText =
    currentDate.toLocaleDateString(
      "es-ES",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );


  const timeText =
    currentDate.toLocaleTimeString(
      "es-ES",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );


  /*
   * ==================================================
   * MENÚ ADMINISTRADOR
   * ==================================================
   */

  const menu = [

    {
      text: "Inicio",
      path: "/",
      icon: <HomeIcon />
    },

    {
      text: "Planificación",
      path: "/planning",
      icon: <CalendarMonthIcon />
    },

    {
      text: "Productos",
      path: "/products",
      icon: <Inventory2Icon />
    },

    {
      text: "Producción",
      path: "/production",
      icon: <PrecisionManufacturingIcon />
    },

    {
      text: "Imprimir Orden",
      path: "/operator/load",
      icon: <PrintIcon />
    },

    {
      text: "Plantillas",
      path: "/templates",
      icon: <LabelIcon />
    },

    {
      text: "Impresoras",
      path: "/printers",
      icon: <PrintIcon />
    },

    {
      text: "Configuración",
      path: "/settings",
      icon: <SettingsIcon />
    }

  ];


  /*
   * ==================================================
   * CONTENIDO OPERARIO
   * ==================================================
   */

  function renderOperatorPage() {

    if (
      location.pathname ===
      "/operator/print"
    ) {

      return (
        <OrderPrint />
      );

    }


    if (
      location.pathname ===
      "/operator/planning"
    ) {

      return (
        <OperatorPlanning />
      );

    }


    if (
      location.pathname ===
      "/operator/load"
    ) {

      return (
        <OperatorLoad />
      );

    }


    return (
      <Operator />
    );

  }


  /*
   * ==================================================
   * MENÚ SELECCIONADO
   * ==================================================
   */

  function isMenuSelected(
    path: string
  ) {

    if (
      path === "/"
    ) {

      return (
        location.pathname === "/"
      );

    }


    if (
      path === "/operator/load"
    ) {

      return (
        location.pathname ===
          "/operator/load"
        ||
        location.pathname ===
          "/operator/print"
      );

    }


    return (
      location.pathname.startsWith(
        path
      )
    );

  }


  return (

    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        overflowX: "hidden"
      }}
    >

      {/* =============================================
          BARRA SUPERIOR
          ============================================= */}

      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          width: "100%",
          backgroundColor: "#0B7A3B",
          zIndex: 1300
        }}
      >

        <Toolbar
          sx={{
            minHeight: {
              xs: 64,
              md: 68
            },

            gap: 2
          }}
        >

          {/* MARCA */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0
            }}
          >

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 1.4,
                py: 0.6,
                borderRadius: 1.5,
                backgroundColor:
                  "rgba(255,255,255,0.12)"
              }}
            >

              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: 24,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.5px"
                }}
              >

                Rivulis

              </Typography>

            </Box>


            <Box>

              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >

                Programa Etiquetas

              </Typography>


              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,0.75)",

                  fontSize: 11,

                  lineHeight: 1.2,

                  mt: 0.3
                }}
              >

                Rivulis Irrigation · QI02

              </Typography>

            </Box>

          </Box>


          {/* FECHA Y HORA */}

          <Box
            sx={{
              flexGrow: 1,

              display: {
                xs: "none",
                md: "flex"
              },

              justifyContent: "center",

              alignItems: "center",

              gap: 1,

              minWidth: 0
            }}
          >

            <AccessTimeIcon
              sx={{
                fontSize: 20,

                color:
                  "rgba(255,255,255,0.85)"
              }}
            />


            <Typography
              sx={{
                color: "#FFFFFF",

                fontSize: 14,

                fontWeight: 500,

                textTransform:
                  "capitalize",

                whiteSpace:
                  "nowrap"
              }}
            >

              {dateText}

              {" · "}

              <Box
                component="span"
                sx={{
                  fontWeight: 700
                }}
              >

                {timeText}

              </Box>

            </Typography>

          </Box>


          {/* USUARIO */}

          <Box
            sx={{
              display: "flex",

              alignItems: "center",

              gap: 1,

              ml: "auto",

              flexShrink: 0
            }}
          >

            <PersonIcon
              sx={{
                fontSize: 21
              }}
            />


            <Typography
              sx={{
                fontWeight: 600,

                display: {
                  xs: "none",
                  sm: "block"
                }
              }}
            >

              {user?.fullName}

            </Typography>


            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,

                borderColor:
                  "rgba(255,255,255,0.30)"
              }}
            />


            <Button
              color="inherit"
              onClick={logout}
              sx={{
                fontWeight: 700
              }}
            >

              SALIR

            </Button>

          </Box>

        </Toolbar>

      </AppBar>


      {/* =============================================
          MENÚ LATERAL
          ============================================= */}

      {!isOperator && (

        <Drawer
          variant="permanent"
          sx={{

            width: drawerWidth,

            flexShrink: 0,

            "& .MuiDrawer-paper": {

              width: drawerWidth,

              boxSizing: "border-box",

              borderRight:
                "1px solid #E0E0E0",

              backgroundColor:
                "#FFFFFF"

            }

          }}
        >

          <Toolbar />

          <Divider />


          <List
            sx={{
              mt: 1
            }}
          >

            {menu.map(
              item => {

                const selected =
                  isMenuSelected(
                    item.path
                  );


                return (

                  <ListItemButton
                    key={item.text}

                    component={Link}

                    to={item.path}

                    selected={selected}

                    sx={{
                      mx: 1,

                      my: 0.5,

                      borderRadius: 2,

                      "&:hover": {
                        backgroundColor:
                          "#E8F5E9"
                      },

                      "&.Mui-selected": {

                        backgroundColor:
                          "#E8F5E9",

                        color:
                          "#0B7A3B",

                        "&:hover": {
                          backgroundColor:
                            "#DDEFE2"
                        }

                      }
                    }}
                  >

                    <ListItemIcon
                      sx={{
                        color: "#0B7A3B",
                        minWidth: 42
                      }}
                    >

                      {item.icon}

                    </ListItemIcon>


                    <ListItemText
                      primary={item.text}

                      primaryTypographyProps={{
                        fontWeight:
                          selected
                            ? 700
                            : 400
                      }}
                    />

                  </ListItemButton>

                );

              }
            )}

          </List>

        </Drawer>

      )}


      {/* =============================================
          CONTENIDO PRINCIPAL
          ============================================= */}

      <Box
        component="main"
        sx={{

          position: "absolute",

          top: 0,

          left: isOperator
            ? 0
            : `${drawerWidth}px`,

          width: isOperator
            ? "100vw"
            : `calc(100vw - ${drawerWidth}px)`,

          minHeight: "100vh",

          boxSizing: "border-box",

          backgroundColor:
            "#F5F7FA",

          overflowX: "hidden",

          px: {
            xs: 2,
            md: 3
          },

          pb: {
            xs: 2,
            md: 4
          }

        }}
      >

        {/* espacio para AppBar */}

        <Toolbar />


        {/* =========================================
            PÁGINA
            ========================================= */}

        <Box
          sx={{
            width: "100%",
            maxWidth: "none",
            minWidth: 0,
            boxSizing: "border-box"
          }}
        >

          {isOperator
            ? renderOperatorPage()
            : <AppRoutes />
          }

        </Box>

      </Box>

    </Box>

  );

}