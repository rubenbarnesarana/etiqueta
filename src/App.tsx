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
  getSupabaseOrders
} from "./services/SupabaseOrderService";

import {
  supabase
} from "./services/Supabase";


const ORDERS_STORAGE_KEY =
  "productionOrders";

const ORDERS_UPDATED_EVENT =
  "productionOrdersUpdated";


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
   * GUARDAR COPIA LOCAL
   * ==================================================
   *
   * IMPORTANTE:
   *
   * Aquí NO utilizamos saveOrders().
   *
   * saveOrders() envía datos otra vez a Supabase.
   * Como estos datos vienen precisamente de Supabase,
   * eso provocaría un bucle de sincronización.
   *
   * Por eso actualizamos únicamente localStorage.
   * ==================================================
   */

  async function refreshOrdersFromSupabase() {

    const orders =
      await getSupabaseOrders();


    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify(
        orders
      )
    );


    /*
     * Evento propio de la aplicación.
     *
     * Lo utilizaremos progresivamente en las
     * pantallas que dependen de las órdenes.
     */
    window.dispatchEvent(
      new Event(
        ORDERS_UPDATED_EVENT
      )
    );


    /*
     * Varias pantallas actuales ya escuchan
     * el evento focus para volver a cargar órdenes.
     *
     * Esto nos permite que esas pantallas se
     * actualicen inmediatamente sin esperar
     * a modificarlas una por una.
     */
    window.dispatchEvent(
      new Event(
        "focus"
      )
    );

  }


  /*
   * ==================================================
   * SINCRONIZACIÓN INICIAL
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


      async function synchronizeInitialData() {

        try {

          await refreshOrdersFromSupabase();

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


      void synchronizeInitialData();


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
   * SUPABASE REALTIME
   * ==================================================
   *
   * Escucha:
   *
   * - INSERT
   * - UPDATE
   * - DELETE
   *
   * sobre production_orders.
   *
   * Cuando cualquier PC modifica una orden:
   *
   * 1. Supabase envía el aviso.
   * 2. Descargamos el estado completo.
   * 3. Actualizamos localStorage.
   * 4. Avisamos a las pantallas abiertas.
   *
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !user
      ) {

        return;

      }


      let refreshTimeout:
        number |
        null =
          null;


      /*
       * Agrupamos eventos cercanos.
       *
       * Por ejemplo, mover una orden puede modificar
       * varias posiciones y Supabase puede emitir
       * varios eventos casi simultáneamente.
       *
       * Esperamos 200 ms y hacemos una sola descarga.
       */
      function scheduleRefresh() {

        if (
          refreshTimeout !==
          null
        ) {

          window.clearTimeout(
            refreshTimeout
          );

        }


        refreshTimeout =
          window.setTimeout(
            () => {

              refreshTimeout =
                null;


              void refreshOrdersFromSupabase()
                .catch(
                  error => {

                    console.error(
                      "Error actualizando órdenes en tiempo real:",
                      error
                    );

                  }
                );

            },
            200
          );

      }


      const channel =
        supabase
          .channel(
            "production-orders-realtime"
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "production_orders"
            },
            () => {

              scheduleRefresh();

            }
          )
          .subscribe();


      return () => {

        if (
          refreshTimeout !==
          null
        ) {

          window.clearTimeout(
            refreshTimeout
          );

        }


        void supabase.removeChannel(
          channel
        );

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
   * ESPERAR SINCRONIZACIÓN INICIAL
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