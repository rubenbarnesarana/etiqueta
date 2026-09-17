import type { DesignerElement } from "../components/designer/DesignerTypes";

export interface Template {
  id: number;
  name: string;
  elements: DesignerElement[];
}

const STORAGE_KEY = "templates";
const CURRENT_TEMPLATE_KEY = "currentTemplateId";

//--------------------------------------------------
// OBTENER PLANTILLAS
//--------------------------------------------------

export function getTemplates(): Template[] {

  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {

    const templates = JSON.parse(data);

    if (Array.isArray(templates)) {
      return templates;
    }

  } catch {

    console.error(
      "Error leyendo las plantillas."
    );

  }

  return [];
}

//--------------------------------------------------
// GUARDAR PLANTILLAS
//--------------------------------------------------

export function saveTemplates(
  templates: Template[]
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(templates)
  );

}

//--------------------------------------------------
// AÑADIR PLANTILLA
//--------------------------------------------------

export function addTemplate(
  template: Template
) {

  const templates = getTemplates();

  templates.push(template);

  saveTemplates(templates);

}

//--------------------------------------------------
// ACTUALIZAR PLANTILLA
//--------------------------------------------------

export function updateTemplate(
  template: Template
) {

  const templates = getTemplates().map(
    item =>
      Number(item.id) === Number(template.id)
        ? template
        : item
  );

  saveTemplates(templates);

}

//--------------------------------------------------
// ELIMINAR PLANTILLA
//--------------------------------------------------

export function deleteTemplate(
  id: number
) {

  const templates = getTemplates().filter(
    template =>
      Number(template.id) !== Number(id)
  );

  saveTemplates(templates);

}

//--------------------------------------------------
// BUSCAR PLANTILLA
//--------------------------------------------------

export function findTemplate(
  id: number
): Template | null {

  const templates = getTemplates();

  return (
    templates.find(
      template =>
        Number(template.id) === Number(id)
    ) ?? null
  );

}

//--------------------------------------------------
// SELECCIONAR PLANTILLA ACTUAL
//--------------------------------------------------

export function setCurrentTemplate(
  id: number
) {

  localStorage.setItem(
    CURRENT_TEMPLATE_KEY,
    String(id)
  );

}

//--------------------------------------------------
// OBTENER PLANTILLA ACTUAL
//--------------------------------------------------

export function getCurrentTemplate():
  number | null {

  const data =
    localStorage.getItem(
      CURRENT_TEMPLATE_KEY
    );

  if (!data) {
    return null;
  }

  const id = Number(data);

  if (Number.isNaN(id)) {
    return null;
  }

  return id;

}

//--------------------------------------------------
// BORRAR PLANTILLA ACTUAL
//--------------------------------------------------

export function clearCurrentTemplate() {

  localStorage.removeItem(
    CURRENT_TEMPLATE_KEY
  );

}