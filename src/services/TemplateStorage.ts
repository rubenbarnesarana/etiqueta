import type { DesignerElement } from "../components/designer/DesignerTypes";

export interface Template {
  id: number;
  name: string;
  elements: DesignerElement[];
}

const STORAGE_KEY = "templates";

/* ========================= */
/* Obtener */
/* ========================= */

export function getTemplates(): Template[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/* ========================= */
/* Guardar */
/* ========================= */

export function saveTemplates(templates: Template[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(templates)
  );
}

/* ========================= */
/* Añadir */
/* ========================= */

export function addTemplate(template: Template) {
  const templates = getTemplates();

  templates.push(template);

  saveTemplates(templates);
}

/* ========================= */
/* Actualizar */
/* ========================= */

export function updateTemplate(template: Template) {
  const templates = getTemplates().map((t) =>
    Number(t.id) === Number(template.id)
      ? template
      : t
  );

  saveTemplates(templates);
}

/* ========================= */
/* Eliminar */
/* ========================= */

export function deleteTemplate(id: number) {
  const templates = getTemplates();

  const newTemplates = templates.filter(
    (t) => Number(t.id) !== Number(id)
  );

  saveTemplates(newTemplates);
}

/* ========================= */
/* Buscar */
/* ========================= */

export function findTemplate(id: number) {
  return getTemplates().find(
    (t) => Number(t.id) === Number(id)
  );
}

/* ========================= */
/* Plantilla actual */
/* ========================= */

const CURRENT_TEMPLATE = "currentTemplate";

export function setCurrentTemplate(id: number) {
  localStorage.setItem(
    CURRENT_TEMPLATE,
    String(id)
  );
}

export function getCurrentTemplate() {
  const value = localStorage.getItem(CURRENT_TEMPLATE);

  if (!value) return null;

  return Number(value);
}

export function clearCurrentTemplate() {
  localStorage.removeItem(CURRENT_TEMPLATE);
}