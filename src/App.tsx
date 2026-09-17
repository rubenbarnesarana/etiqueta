import Login from "./auth/Login";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import MainLayout from "./layouts/MainLayout";
import { DesignerProvider } from "./components/designer/DesignerContext";

function Application() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <DesignerProvider>
      <MainLayout />
    </DesignerProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Application />
    </AuthProvider>
  );
}