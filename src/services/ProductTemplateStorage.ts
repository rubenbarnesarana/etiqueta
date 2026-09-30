import {
  getTemplates
} from "./TemplateStorage";

import {
  deleteSupabaseAssignment,
  saveSupabaseAssignments
} from "./SupabaseProductTemplateService";


export interface ProductTemplateAssignment {

  sku: string;

  templateId: number;

}


const STORAGE_KEY =
  "productTemplateAssignments";

const ASSIGNMENTS_UPDATED_EVENT =
  "productTemplateAssignmentsUpdated";


let supabaseQueue:
  Promise<void> =
    Promise.resolve();


function queueSupabaseOperation(
  operation: () => Promise<void>
) {

  supabaseQueue =
    supabaseQueue
      .then(
        operation
      )
      .catch(
        error => {

          console.error(
            "Error sincronizando asignaciones SKU-plantilla con Supabase:",
            error
          );

        }
      );

}


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

    // Datos corruptos

  }


  return [];

}


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


  const snapshot:
    ProductTemplateAssignment[] =
      JSON.parse(
        JSON.stringify(
          normalizedAssignments
        )
      );


  queueSupabaseOperation(
    () =>
      saveSupabaseAssignments(
        snapshot
      )
  );

}


export function getTemplateForSku(
  sku: string
): number | null {

  const assignments =
    getAssignments();


  const found =
    assignments.find(
      item =>
        String(
          item.sku
        ).trim() ===
        String(
          sku
        ).trim()
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


  /*
   * ==================================================
   * SIN PLANTILLA
   * ==================================================
   *
   * templateId 0 significa que el SKU no tiene
   * ninguna plantilla asignada.
   *
   * No guardamos una asignación SKU -> 0.
   * Eliminamos completamente la asignación.
   *
   * ==================================================
   */

  if (
    !Number.isFinite(
      cleanTemplateId
    )
    ||
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


export function removeAssignment(
  sku: string
) {

  const cleanSku =
    String(
      sku
    ).trim();


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


  queueSupabaseOperation(
    () =>
      deleteSupabaseAssignment(
        cleanSku
      )
  );

}


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
    ) ?? null
  );

}