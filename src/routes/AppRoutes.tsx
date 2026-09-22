import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "../pages/Home/Home";
import Planning from "../pages/Planning/Planning";

import Products from "../pages/Products/Products";
import Templates from "../pages/Templates/Templates";
import TemplateDesigner from "../pages/Templates/TemplateDesigner";
import Production from "../pages/Production/Production";

import Operator from "../pages/Operator/Operator";
import OperatorLoad from "../pages/Operator/OperatorLoad";
import OrderPrint from "../pages/Operator/OrderPrint";

import Preview from "../pages/Preview/Preview";
import Printers from "../pages/Printers/Printers";
import Settings from "../pages/Settings/Settings";
import PrintHistory from "../pages/PrintHistory/PrintHistory";

import {
  DesignerProvider
} from "../components/designer/DesignerContext";


export default function AppRoutes() {

  return (

    <Routes>

      {/* =============================================
          INICIO ADMIN
          ============================================= */}

      <Route
        path="/"
        element={
          <Home />
        }
      />


      {/* =============================================
          PLANIFICACIÓN
          ============================================= */}

      <Route
        path="/planning"
        element={
          <Planning />
        }
      />


      {/* =============================================
          PRODUCTOS
          ============================================= */}

      <Route
        path="/products"
        element={
          <Products />
        }
      />


      {/* =============================================
          PLANTILLAS
          ============================================= */}

      <Route
        path="/templates"
        element={
          <Templates />
        }
      />


      <Route
        path="/templates/designer"
        element={

          <DesignerProvider>

            <TemplateDesigner />

          </DesignerProvider>

        }
      />


      {/* =============================================
          PRODUCCIÓN
          ============================================= */}

      <Route
        path="/production"
        element={
          <Production />
        }
      />


      {/* =============================================
          HISTORIAL DE IMPRESIÓN
          ============================================= */}

      <Route
        path="/print-history"
        element={
          <PrintHistory />
        }
      />


      {/* =============================================
          PORTADA OPERARIO
          ============================================= */}

      <Route
        path="/operator"
        element={
          <Operator />
        }
      />


      {/* =============================================
          CARGAR ORDEN MANUAL
          ============================================= */}

      <Route
        path="/operator/load"
        element={
          <OperatorLoad />
        }
      />


      {/* =============================================
          IMPRIMIR ORDEN
          ============================================= */}

      <Route
        path="/operator/print"
        element={
          <OrderPrint />
        }
      />


      {/* =============================================
          PREVIEW
          ============================================= */}

      <Route
        path="/preview"
        element={
          <Preview />
        }
      />


      {/* =============================================
          IMPRESORAS
          ============================================= */}

      <Route
        path="/printers"
        element={
          <Printers />
        }
      />


      {/* =============================================
          CONFIGURACIÓN
          ============================================= */}

      <Route
        path="/settings"
        element={
          <Settings />
        }
      />


      {/* =============================================
          RUTA DESCONOCIDA
          ============================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>

  );

}