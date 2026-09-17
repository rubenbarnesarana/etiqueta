import { getTemplates } from "./TemplateStorage";

export interface ProductTemplateAssignment {

  sku: string;

  templateId: number;

}

const STORAGE_KEY =
  "productTemplateAssignments";

export function getAssignments():
  ProductTemplateAssignment[] {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!data) {

    return [];

  }

  try {

    const assignments =
      JSON.parse(data);

    if (
      Array.isArray(assignments)
    ) {

      return assignments;

    }

  } catch {

    // Datos corruptos

  }

  return [];

}

export function saveAssignments(
  assignments: ProductTemplateAssignment[]
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      assignments
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
        String(item.sku).trim() ===
        String(sku).trim()
    );

  if (!found) {

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
    String(sku).trim();

  const assignments =
    getAssignments();

  const existing =
    assignments.find(
      item =>
        String(item.sku).trim() ===
        cleanSku
    );

  if (existing) {

    existing.templateId =
      Number(templateId);

  } else {

    assignments.push({

      sku: cleanSku,

      templateId:
        Number(templateId)

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
    String(sku).trim();

  const assignments =
    getAssignments().filter(
      item =>
        String(item.sku).trim() !==
        cleanSku
    );

  saveAssignments(
    assignments
  );

}

export function getAssignedTemplate(
  sku: string
) {

  const templateId =
    getTemplateForSku(
      sku
    );

  if (templateId === null) {

    return null;

  }

  const templates =
    getTemplates();

  return (
    templates.find(
      template =>
        Number(template.id) ===
        Number(templateId)
    ) ?? null
  );

}