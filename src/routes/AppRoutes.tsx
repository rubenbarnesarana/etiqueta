import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Products from "../pages/Products/Products";
import Templates from "../pages/Templates/Templates";
import TemplateDesigner from "../pages/Templates/TemplateDesigner";
import Production from "../pages/Production/Production";
import Operator from "../pages/Operator/Operator";
import Preview from "../pages/Preview/Preview";
import Printers from "../pages/Printers/Printers";
import Settings from "../pages/Settings/Settings";

import { DesignerProvider } from "../components/designer/DesignerContext";

export default function AppRoutes() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Dashboard />}
      />

      <Route
        path="/products"
        element={<Products />}
      />

      <Route
        path="/templates"
        element={<Templates />}
      />

      <Route
        path="/templates/designer"
        element={
          <DesignerProvider>
            <TemplateDesigner />
          </DesignerProvider>
        }
      />

      <Route
        path="/production"
        element={<Production />}
      />

      <Route
        path="/operator"
        element={<Operator />}
      />

      <Route
        path="/preview"
        element={<Preview />}
      />

      <Route
        path="/printers"
        element={<Printers />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />

    </Routes>

  );

}