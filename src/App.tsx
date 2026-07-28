import Login from "./auth/Login";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import MainLayout from "./layouts/MainLayout";

function Application() {

  const { user } = useAuth();

  if (!user) {

    return <Login />;

  }

  return <MainLayout />;

}

export default function App() {

  return (

    <AuthProvider>

      <Application />

    </AuthProvider>

  );

}
