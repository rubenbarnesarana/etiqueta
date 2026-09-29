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
  getSupabaseTemplates,
  saveSupabaseTemplates
} from "./services/SupabaseTemplateService";

import {
  getTemplates
} from "./services/TemplateStorage";

import {
  supabase
} from "./services/Supabase";


const ORDERS_STORAGE_KEY =
  "productionOrders";

const ORDERS_UPDATED_EVENT =
  "productionOrdersUpdated";


const TEMPLATES_STORAGE_KEY =
  "templates";

const TEMPLATES_UPDATED_EVENT =
  "templatesUpdated";


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
   * ACTUALIZAR ÓRDENES DESDE SUPABASE
   * ==================================================
   *
   * IMPORTANTE:
   *
   * Aquí NO utilizamos saveOrders().
   *
   * saveOrders() vuelve a enviar los datos
   * a Supabase y provocaría un bucle.
   *
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


    window.dispatchEvent(
      new Event(
        ORDERS_UPDATED_EVENT
      )
    );


    /*
     * Compatibilidad con algunas pantallas
     * antiguas que todavía escuchan focus.
     */
    window.dispatchEvent(
      new Event(
        "focus"
      )
    );

  }


  /*
   * ==================================================
   * ACTUALIZAR PLANTILLAS DESDE SUPABASE
   * ==================================================
   *
   * IMPORTANTE:
   *
   * Aquí NO utilizamos saveTemplates().
   *
   * saveTemplates() vuelve a enviar los datos
   * a Supabase y provocaría un bucle Realtime.
   *
   * ==================================================
   */

  async function refreshTemplatesFromSupabase() {

    const templates =
      await getSupabaseTemplates();


    localStorage.setItem(
      TEMPLATES_STORAGE_KEY,
      JSON.stringify(
        templates
      )
    );


    window.dispatchEvent(
      new Event(
        TEMPLATES_UPDATED_EVENT
      )
    );

  }


  /*
   * ==================================================
   * SINCRONIZACIÓN INICIAL DE PLANTILLAS
   * ==================================================
   *
   * REGLAS:
   *
   * 1. Si Supabase ya tiene plantillas:
   *    Supabase manda.
   *
   * 2. Si Supabase está vacío:
   *    utilizamos las plantillas locales de este PC.
   *
   * 3. currentTemplateId continúa siendo LOCAL.
   *
   * ==================================================
   */

  async function synchronizeTemplates() {

    const supabaseTemplates =
      await getSupabaseTemplates();


    /*
     * ==================================================
     * SUPABASE YA TIENE PLANTILLAS
     * ==================================================
     */

    if (
      supabaseTemplates.length >
      0
    ) {

      localStorage.setItem(
        TEMPLATES_STORAGE_KEY,
        JSON.stringify(
          supabaseTemplates
        )
      );


      window.dispatchEvent(
        new Event(
          TEMPLATES_UPDATED_EVENT
        )
      );


      return;

    }


    /*
     * ==================================================
     * SUPABASE ESTÁ VACÍO
     * ==================================================
     */

    const localTemplates =
      getTemplates();


    if (
      localTemplates.length ===
      0
    ) {

      console.log(
        "No existen plantillas locales para migrar a Supabase."
      );

      return;

    }


    /*
     * Subir plantillas locales.
     */

    await saveSupabaseTemplates(
      localTemplates
    );


    console.log(
      `${localTemplates.length} plantillas migradas a Supabase.`
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

        /*
         * ==================================================
         * ÓRDENES
         * ==================================================
         */

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


        /*
         * ==================================================
         * PLANTILLAS
         * ==================================================
         */

        try {

          await synchronizeTemplates();

        }
        catch (
          error
        ) {

          console.error(
            "No se pudieron sincronizar las plantillas con Supabase:",
            error
          );

        }


        /*
         * ==================================================
         * APLICACIÓN LISTA
         * ==================================================
         */

        if (
          !cancelled
        ) {

          setDataReady(
            true
          );

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
   * SUPABASE REALTIME - ÓRDENES
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
   * SUPABASE REALTIME - PLANTILLAS
   * ==================================================
   *
   * Escucha:
   *
   * - INSERT
   * - UPDATE
   * - DELETE
   *
   * sobre label_templates.
   *
   * Cuando cualquier PC modifica una plantilla:
   *
   * 1. Supabase envía el aviso.
   * 2. Descargamos todas las plantillas.
   * 3. Actualizamos localStorage.
   * 4. Lanzamos templatesUpdated.
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
       * Agrupamos eventos próximos.
       *
       * Una edición del diseñador puede provocar
       * varias operaciones cercanas.
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


              void refreshTemplatesFromSupabase()
                .catch(
                  error => {

                    console.error(
                      "Error actualizando plantillas en tiempo real:",
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
            "label-templates-realtime"
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "label_templates"
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