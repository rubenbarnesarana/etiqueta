import { Link } from "react-router-dom";

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

import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PrintIcon from "@mui/icons-material/Print";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";

import AppRoutes from "../routes/AppRoutes";
import Operator from "../pages/Operator/Operator";
import { useAuth } from "../auth/AuthContext";

const drawerWidth = 250;

export default function MainLayout() {

  const { user, logout } = useAuth();

  const isOperator = user?.role === "operator";

  const menu = [

    {
      text: "Dashboard",
      path: "/",
      icon: <DashboardIcon />
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
      path: "/operator",
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

  return (

    <Box sx={{ display: "flex" }}>

      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          backgroundColor: "#0B7A3B",
          zIndex: 1300
        }}
      >

        <Toolbar>

          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ flexGrow: 1 }}
          >

            ETIQUETA

          </Typography>

          <PersonIcon sx={{ mr: 1 }} />

          <Typography mr={3}>

            {user?.fullName}

          </Typography>

          <Button
            color="inherit"
            onClick={logout}
          >

            SALIR

          </Button>

        </Toolbar>

      </AppBar>

      {!isOperator && (

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #E0E0E0",
              backgroundColor: "#FFFFFF"
            }
          }}
        >

          <Toolbar />

          <Divider />

          <List sx={{ mt: 1 }}>

            {menu.map((item) => (

              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#E8F5E9"
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

                <ListItemText primary={item.text} />

              </ListItemButton>

            ))}

          </List>

        </Drawer>

      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#F5F7FA",
          minHeight: "100vh",
          p: 4
        }}
      >

        <Toolbar />

        {isOperator ? <Operator /> : <AppRoutes />}

      </Box>

    </Box>

  );

}