import {
  supabase
} from "./Supabase";

import type {
  Template
} from "./TemplateStorage";


interface TemplateRow {

  id: number;

  name: string;

  label_format:
    | "FORMATO_1"
    | "FORMATO_2";

  background_image:
    | string
    | null;

  elements:
    unknown;

  created_at?:
    string;

  updated_at?:
    string;

}


/*
 * ==================================================
 * CONVERTIR FILA SUPABASE -> TEMPLATE
 * ==================================================
 */

function rowToTemplate(
  row: TemplateRow
): Template {

  return {

    id:
      Number(
        row.id
      ),

    name:
      String(
        row.name
      ),

    labelFormat:
      row.label_format ===
      "FORMATO_2"

        ? "FORMATO_2"

        : "FORMATO_1",

    backgroundImage:
      typeof row.background_image ===
      "string"

        ? row.background_image

        : undefined,

    elements:
      Array.isArray(
        row.elements
      )

        ? row.elements as Template["elements"]

        : []

  };

}


/*
 * ==================================================
 * CONVERTIR TEMPLATE -> FILA SUPABASE
 * ==================================================
 */

function templateToRow(
  template: Template
) {

  return {

    id:
      Number(
        template.id
      ),

    name:
      template.name,

    label_format:
      template.labelFormat,

    background_image:
      template.backgroundImage ??
      null,

    elements:
      template.elements

  };

}


/*
 * ==================================================
 * OBTENER PLANTILLAS
 * ==================================================
 */

export async function getSupabaseTemplates():
  Promise<Template[]> {

  const {
    data,
    error
  } =
    await supabase
      .from(
        "label_templates"
      )
      .select(
        "*"
      )
      .order(
        "id",
        {
          ascending: true
        }
      );


  if (
    error
  ) {

    throw error;

  }


  return (
    data ??
    []
  ).map(
    row =>
      rowToTemplate(
        row as TemplateRow
      )
  );

}


/*
 * ==================================================
 * GUARDAR UNA PLANTILLA
 * ==================================================
 */

export async function saveSupabaseTemplate(
  template: Template
):
  Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "label_templates"
      )
      .upsert(
        templateToRow(
          template
        ),
        {
          onConflict:
            "id"
        }
      );


  if (
    error
  ) {

    throw error;

  }

}


/*
 * ==================================================
 * GUARDAR VARIAS PLANTILLAS
 * ==================================================
 */

export async function saveSupabaseTemplates(
  templates: Template[]
):
  Promise<void> {

  if (
    templates.length ===
    0
  ) {

    return;

  }


  const BATCH_SIZE =
    500;


  for (
    let index = 0;
    index < templates.length;
    index += BATCH_SIZE
  ) {

    const batch =
      templates.slice(
        index,
        index +
        BATCH_SIZE
      );


    const {
      error
    } =
      await supabase
        .from(
          "label_templates"
        )
        .upsert(
          batch.map(
            template =>
              templateToRow(
                template
              )
          ),
          {
            onConflict:
              "id"
          }
        );


    if (
      error
    ) {

      throw error;

    }

  }

}


/*
 * ==================================================
 * ELIMINAR PLANTILLA
 * ==================================================
 */

export async function deleteSupabaseTemplate(
  id: number
):
  Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "label_templates"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {

    throw error;

  }

}