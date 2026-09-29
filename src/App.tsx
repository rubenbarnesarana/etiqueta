import {
  useEffect,
  useState
} from "react";

import Login from "./auth/Login";

import {
  AuthProvider,
  useAuth
} from "./auth/AuthContext";

import MainLayout from "./layouts/MainLayout";

import {
  DesignerProvider
} from "./components/designer/DesignerContext";

import {
  saveOrders
} from "./services/OrderStorage";

import {
  getSupabaseOrders
} from "./services/SupabaseOrderService";


function Application() {

  const {
    user
  } = useAuth();


  const [
    dataReady,
    setDataReady
  ] = useState(false);


  /*
   * ==================================================
   * SINCRONIZAR DATOS AL ENTRAR
   * ==================================================
   *
   * Supabase es la fuente central.
   *
   * Al iniciar sesión:
   *
   * 1. Descargamos las órdenes de Supabase.
   * 2. Actualizamos la copia local del navegador.
   * 3. Las pantallas actuales pueden seguir utilizando
   *    OrderStorage sin necesidad de modificarlas todavía.
   *
   * Si Supabase falla, NO borramos los datos locales.
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !user
      ) {

        setDataReady(
          false
        );

        return;

      }


      let cancelled =
        false;


      async function synchronizeData() {

        try {

          const orders =
            await getSupabaseOrders();


          if (
            cancelled
          ) {

            return;

          }


          saveOrders(
            orders
          );

        }
        catch (
          error
        ) {

          console.error(
            "No se pudieron sincronizar las órdenes desde Supabase:",
            error
          );

        }
        finally {

          if (
            !cancelled
          ) {

            setDataReady(
              true
            );

          }

        }

      }


      setDataReady(
        false
      );


      void synchronizeData();


      return () => {

        cancelled =
          true;

      };

    },
    [
      user
    ]
  );


  /*
   * ==================================================
   * LOGIN
   * ==================================================
   */

  if (
    !user
  ) {

    return (
      <Login />
    );

  }


  /*
   * ==================================================
   * ESPERAR SINCRONIZACIÓN
   * ==================================================
   */

  if (
    !dataReady
  ) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: "18px"
        }}
      >

        Cargando datos...

      </div>

    );

  }


  /*
   * ==================================================
   * APLICACIÓN
   * ==================================================
   */

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