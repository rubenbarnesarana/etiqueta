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
  getSupabaseProducts
} from "./services/SupabaseProductService";

import {
  getSupabaseTemplates,
  saveSupabaseTemplates
} from "./services/SupabaseTemplateService";

import {
  getTemplates
} from "./services/TemplateStorage";

import {
  getSupabaseAssignments,
  saveSupabaseAssignments
} from "./services/SupabaseProductTemplateService";

import {
  getAssignments
} from "./services/ProductTemplateStorage";

import {
  supabase
} from "./services/Supabase";


const ORDERS_STORAGE_KEY =
  "productionOrders";

const ORDERS_UPDATED_EVENT =
  "productionOrdersUpdated";


const PRODUCTS_STORAGE_KEY =
  "products";

const PRODUCTS_UPDATED_EVENT =
  "productsUpdated";


const TEMPLATES_STORAGE_KEY =
  "templates";

const TEMPLATES_UPDATED_EVENT =
  "templatesUpdated";


const ASSIGNMENTS_STORAGE_KEY =
  "productTemplateAssignments";

const ASSIGNMENTS_UPDATED_EVENT =
  "productTemplateAssignmentsUpdated";


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


    window.dispatchEvent(
      new Event(
        "focus"
      )
    );

  }


  /*
   * ==================================================
   * ACTUALIZAR PRODUCTOS DESDE SUPABASE
   * ==================================================
   *
   * No utilizamos saveProducts().
   *
   * Actualizamos directamente la caché local
   * para evitar cualquier escritura adicional.
   *
   * ==================================================
   */

  async function refreshProductsFromSupabase() {

    const products =
      await getSupabaseProducts();


    localStorage.setItem(
      PRODUCTS_STORAGE_KEY,
      JSON.stringify(
        products
      )
    );


    window.dispatchEvent(
      new Event(
        PRODUCTS_UPDATED_EVENT
      )
    );

  }


  /*
   * ==================================================
   * ACTUALIZAR PLANTILLAS DESDE SUPABASE
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
   * ACTUALIZAR ASIGNACIONES SKU -> PLANTILLA
   * DESDE SUPABASE
   * ==================================================
   */

  async function refreshAssignmentsFromSupabase() {

    const assignments =
      await getSupabaseAssignments();


    localStorage.setItem(
      ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify(
        assignments
      )
    );


    window.dispatchEvent(
      new Event(
        ASSIGNMENTS_UPDATED_EVENT
      )
    );

  }


  /*
   * ==================================================
   * SINCRONIZACIÓN INICIAL DE PLANTILLAS
   * ==================================================
   */

  async function synchronizeTemplates() {

    const supabaseTemplates =
      await getSupabaseTemplates();


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


    await saveSupabaseTemplates(
      localTemplates
    );


    console.log(
      `${localTemplates.length} plantillas migradas a Supabase.`
    );

  }


  /*
   * ==================================================
   * SINCRONIZACIÓN INICIAL DE ASIGNACIONES
   * SKU -> PLANTILLA
   * ==================================================
   */

  async function synchronizeAssignments() {

    const supabaseAssignments =
      await getSupabaseAssignments();


    if (
      supabaseAssignments.length >
      0
    ) {

      localStorage.setItem(
        ASSIGNMENTS_STORAGE_KEY,
        JSON.stringify(
          supabaseAssignments
        )
      );


      window.dispatchEvent(
        new Event(
          ASSIGNMENTS_UPDATED_EVENT
        )
      );


      return;

    }


    const localAssignments =
      getAssignments();


    if (
      localAssignments.length ===
      0
    ) {

      console.log(
        "No existen asignaciones SKU-plantilla locales para migrar a Supabase."
      );

      return;

    }


    await saveSupabaseAssignments(
      localAssignments
    );


    console.log(
      `${localAssignments.length} asignaciones SKU-plantilla migradas a Supabase.`
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
         * PRODUCTOS
         * ==================================================
         */

        try {

          await refreshProductsFromSupabase();

        }
        catch (
          error
        ) {

          console.error(
            "No se pudieron sincronizar los productos desde Supabase:",
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
         * ASIGNACIONES SKU -> PLANTILLA
         * ==================================================
         */

        try {

          await synchronizeAssignments();

        }
        catch (
          error
        ) {

          console.error(
            "No se pudieron sincronizar las asignaciones SKU-plantilla con Supabase:",
            error
          );

        }


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
   * SUPABASE REALTIME - PRODUCTOS
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


              void refreshProductsFromSupabase()
                .catch(
                  error => {

                    console.error(
                      "Error actualizando productos en tiempo real:",
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
            "products-realtime"
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "products"
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
   * SUPABASE REALTIME
   * ASIGNACIONES SKU -> PLANTILLA
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


              void refreshAssignmentsFromSupabase()
                .catch(
                  error => {

                    console.error(
                      "Error actualizando asignaciones SKU-plantilla en tiempo real:",
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
            "product-template-assignments-realtime"
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table:
                "product_template_assignments"
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