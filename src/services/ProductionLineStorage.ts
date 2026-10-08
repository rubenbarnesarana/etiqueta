import {
  supabase
} from "./Supabase";


export interface ProductionLineSettings {
  line: number;
  comments: string;
  updatedAt?: string;
}


const STORAGE_KEY =
  "productionLineSettings";


/*
 * ==================================================
 * CREAR CONFIGURACIÓN POR DEFECTO
 * ==================================================
 */

function createDefaultSettings():
  ProductionLineSettings[] {

  return [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8
  ].map(
    line => ({
      line,
      comments:
        ""
    })
  );
}


/*
 * ==================================================
 * NORMALIZAR
 * ==================================================
 */

function normalizeSettings(
  settings: any
):
  ProductionLineSettings[] {

  const defaults =
    createDefaultSettings();


  if (
    !Array.isArray(
      settings
    )
  ) {

    return defaults;
  }


  return defaults.map(
    defaultItem => {

      const existing =
        settings.find(
          item =>
            Number(
              item?.line
            ) ===
            defaultItem.line
        );


      return {
        line:
          defaultItem.line,

        comments:
          String(
            existing?.comments ??
            ""
          ),

        updatedAt:
          existing?.updatedAt ??
          existing?.updated_at ??
          undefined
      };
    }
  );
}


/*
 * ==================================================
 * GUARDAR CACHE LOCAL
 * ==================================================
 */

function saveLocalSettings(
  settings:
    ProductionLineSettings[]
) {

  const normalized =
    normalizeSettings(
      settings
    );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalized
    )
  );
}


/*
 * ==================================================
 * LEER CACHE LOCAL
 * ==================================================
 */

function getLocalSettings():
  ProductionLineSettings[] {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (
    !data
  ) {

    const defaults =
      createDefaultSettings();


    saveLocalSettings(
      defaults
    );


    return defaults;
  }


  try {

    const parsed =
      JSON.parse(
        data
      );


    return normalizeSettings(
      parsed
    );

  }
  catch {

    const defaults =
      createDefaultSettings();


    saveLocalSettings(
      defaults
    );


    return defaults;
  }
}


/*
 * ==================================================
 * OBTENER CONFIGURACIÓN LOCAL
 * ==================================================
 *
 * Esta función es síncrona para que las pantallas
 * actuales puedan seguir utilizándola sin cambiar
 * toda su estructura.
 * ==================================================
 */

export function getProductionLineSettings():
  ProductionLineSettings[] {

  return getLocalSettings();
}


/*
 * ==================================================
 * OBTENER UNA LÍNEA LOCAL
 * ==================================================
 */

export function getProductionLineSetting(
  line: number
):
  ProductionLineSettings {

  const settings =
    getLocalSettings();


  return (
    settings.find(
      item =>
        item.line ===
        line
    ) ?? {
      line,
      comments:
        ""
    }
  );
}


/*
 * ==================================================
 * CARGAR DESDE SUPABASE
 * ==================================================
 */

export async function loadProductionLineSettingsFromSupabase():
  Promise<
    ProductionLineSettings[]
  > {

  try {

    const {
      data,
      error
    } =
      await supabase
        .from(
          "production_line_settings"
        )
        .select(
          `
            line,
            comments,
            updated_at
          `
        )
        .order(
          "line",
          {
            ascending:
              true
          }
        );


    if (
      error
    ) {

      console.error(
        "Error cargando comentarios de línea desde Supabase:",
        error
      );


      return getLocalSettings();
    }


    const normalized =
      normalizeSettings(
        (
          data ??
          []
        ).map(
          row => ({
            line:
              Number(
                row.line
              ),

            comments:
              String(
                row.comments ??
                ""
              ),

            updatedAt:
              row.updated_at ??
              undefined
          })
        )
      );


    saveLocalSettings(
      normalized
    );


    if (
      typeof window !==
      "undefined"
    ) {

      window.dispatchEvent(
        new Event(
          "productionLineSettingsUpdated"
        )
      );
    }


    return normalized;

  }
  catch (
    error
  ) {

    console.error(
      "Error inesperado cargando comentarios de línea:",
      error
    );


    return getLocalSettings();
  }
}


/*
 * ==================================================
 * ACTUALIZAR COMENTARIO LOCAL
 * ==================================================
 */

function updateLocalProductionLineComments(
  line: number,
  comments: string
) {

  const settings =
    getLocalSettings();


  const updated =
    settings.map(
      item =>
        item.line ===
        line
          ? {
              ...item,

              comments:
                comments.trim()
            }
          : item
    );


  saveLocalSettings(
    updated
  );


  if (
    typeof window !==
    "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "productionLineSettingsUpdated"
      )
    );
  }
}


/*
 * ==================================================
 * ACTUALIZAR COMENTARIO
 * ==================================================
 */

export async function updateProductionLineComments(
  line: number,
  comments: string
):
  Promise<void> {

  if (
    line <
      1 ||
    line >
      8
  ) {

    return;
  }


  const cleanComments =
    comments.trim();


  /*
   * Primero actualizamos local para que la interfaz
   * responda inmediatamente.
   */

  updateLocalProductionLineComments(
    line,
    cleanComments
  );


  try {

    const {
      error
    } =
      await supabase
        .from(
          "production_line_settings"
        )
        .upsert(
          {
            line,

            comments:
              cleanComments,

            updated_at:
              new Date().toISOString()
          },
          {
            onConflict:
              "line"
          }
        );


    if (
      error
    ) {

      console.error(
        `Error guardando comentario de Línea ${line} en Supabase:`,
        error
      );


      throw error;
    }


    /*
     * Volvemos a cargar desde Supabase para que
     * localStorage quede exactamente igual que la BD.
     */

    await loadProductionLineSettingsFromSupabase();

  }
  catch (
    error
  ) {

    console.error(
      `No se pudo sincronizar el comentario de Línea ${line} con Supabase:`,
      error
    );


    throw error;
  }
}


/*
 * ==================================================
 * SINCRONIZAR AL INICIAR
 * ==================================================
 */

export async function syncProductionLineSettings():
  Promise<void> {

  await loadProductionLineSettingsFromSupabase();
}