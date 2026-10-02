import {
  getTemplates
} from "./TemplateStorage";


export interface ProductTemplateAssignment {

  sku: string;

  templateId: number;

}


const STORAGE_KEY =
  "productTemplateAssignments";

const ASSIGNMENTS_UPDATED_EVENT =
  "productTemplateAssignmentsUpdated";


/*
 * ==================================================
 * OBTENER ASIGNACIONES
 * ==================================================
 *
 * Esta información se mantiene como caché local.
 *
 * La fuente real de datos es Supabase.
 * ==================================================
 */

export function getAssignments():
  ProductTemplateAssignment[] {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (
    !data
  ) {

    return [];

  }


  try {

    const assignments =
      JSON.parse(
        data
      );


    if (
      Array.isArray(
        assignments
      )
    ) {

      return assignments
        .map(
          item => ({

            sku:
              String(
                item.sku ?? ""
              ).trim(),

            templateId:
              Number(
                item.templateId
              )

          })
        )
        .filter(
          item =>
            item.sku !== "" &&
            Number.isFinite(
              item.templateId
            ) &&
            item.templateId > 0
        );

    }

  }
  catch {

    /*
     * Datos locales corruptos.
     *
     * En ese caso devolvemos una lista vacía.
     * Supabase volverá a rellenar la caché.
     */

  }


  return [];

}


/*
 * ==================================================
 * GUARDAR ASIGNACIONES EN CACHÉ LOCAL
 * ==================================================
 *
 * IMPORTANTE:
 *
 * Esta función YA NO escribe en Supabase.
 *
 * Supabase mantiene product_template_assignments
 * automáticamente mediante triggers sobre products.
 * ==================================================
 */

export function saveAssignments(
  assignments:
    ProductTemplateAssignment[]
) {

  const normalizedAssignments =
    assignments
      .map(
        assignment => ({

          sku:
            String(
              assignment.sku
            ).trim(),

          templateId:
            Number(
              assignment.templateId
            )

        })
      )
      .filter(
        assignment =>
          assignment.sku !== "" &&
          Number.isFinite(
            assignment.templateId
          ) &&
          assignment.templateId > 0
      );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalizedAssignments
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
 * OBTENER ID DE PLANTILLA PARA UN SKU
 * ==================================================
 */

export function getTemplateForSku(
  sku: string
): number | null {

  const cleanSku =
    String(
      sku
    ).trim();


  const assignments =
    getAssignments();


  const found =
    assignments.find(
      item =>
        String(
          item.sku
        ).trim() ===
        cleanSku
    );


  if (
    !found
  ) {

    return null;

  }


  return Number(
    found.templateId
  );

}


/*
 * ==================================================
 * ASIGNAR PLANTILLA A SKU
 * ==================================================
 *
 * SOLO actualiza la caché local.
 *
 * La persistencia central en Supabase se realiza
 * automáticamente desde products.template_id.
 * ==================================================
 */

export function assignTemplateToSku(
  sku: string,
  templateId: number
) {

  const cleanSku =
    String(
      sku
    ).trim();


  const cleanTemplateId =
    Number(
      templateId
    );


  if (
    cleanSku === ""
  ) {

    return;

  }


  /*
   * ==================================================
   * SIN PLANTILLA
   * ==================================================
   */

  if (
    !Number.isFinite(
      cleanTemplateId
    ) ||
    cleanTemplateId <= 0
  ) {

    removeAssignment(
      cleanSku
    );

    return;

  }


  const assignments =
    getAssignments();


  const existing =
    assignments.find(
      item =>
        String(
          item.sku
        ).trim() ===
        cleanSku
    );


  if (
    existing
  ) {

    existing.templateId =
      cleanTemplateId;

  }
  else {

    assignments.push({

      sku:
        cleanSku,

      templateId:
        cleanTemplateId

    });

  }


  saveAssignments(
    assignments
  );

}


/*
 * ==================================================
 * ELIMINAR ASIGNACIÓN LOCAL
 * ==================================================
 *
 * SOLO elimina de la caché local.
 *
 * Supabase elimina la asignación mediante el trigger
 * de la tabla products.
 * ==================================================
 */

export function removeAssignment(
  sku: string
) {

  const cleanSku =
    String(
      sku
    ).trim();


  if (
    cleanSku === ""
  ) {

    return;

  }


  const assignments =
    getAssignments()
      .filter(
        item =>
          String(
            item.sku
          ).trim() !==
          cleanSku
      );


  saveAssignments(
    assignments
  );

}


/*
 * ==================================================
 * OBTENER PLANTILLA ASIGNADA
 * ==================================================
 *
 * Esta función continúa existiendo porque
 * PrintService la utiliza al generar las etiquetas.
 * ==================================================
 */

export function getAssignedTemplate(
  sku: string
) {

  const templateId =
    getTemplateForSku(
      sku
    );


  if (
    templateId === null
  ) {

    return null;

  }


  const templates =
    getTemplates();


  return (
    templates.find(
      template =>
        Number(
          template.id
        ) ===
        Number(
          templateId
        )
    ) ??
    null
  );

}