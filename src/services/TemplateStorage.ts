import type {
  DesignerElement
} from "../components/designer/DesignerTypes";


export type LabelFormat =
  | "FORMATO_1"
  | "FORMATO_2";


export interface Template {

  id: number;

  name: string;

  // Tamaño físico de la etiqueta
  labelFormat: LabelFormat;

  // Imagen base
  backgroundImage?: string;

  // Elementos dinámicos
  elements: DesignerElement[];

}


const STORAGE_KEY =
  "templates";

const CURRENT_TEMPLATE_KEY =
  "currentTemplateId";


/*
 * ==================================================
 * ELEMENTOS OFICIALES AMNON - FORMATO 1
 * 80 x 285 mm
 * ==================================================
 *
 * La imagen de fondo contiene:
 *
 * - líneas
 * - logos
 * - AMNON
 * - textos fijos
 * - REELVIEW
 *
 * Aquí colocamos únicamente los datos variables.
 */

export function createAmnonFormat1Elements():
  DesignerElement[] {

  const baseId =
    Date.now();


  return [

    /*
     * ==================================================
     * TEXTO SUPERIOR
     * ==================================================
     *
     * Ejemplo:
     *
     * AMNON PC AS 16/2.2
     * 75CM E-1MM R-500M
     * Emitting Pipe
     * Max Pressure 3.5 BAR
     * ISO 9261
     *
     * Toda esta zona va girada 180°.
     */

    {
      id:
        baseId + 1,

      type:
        "field",

      field:
        "UPPER_TEXT",

      text:
        "UPPER_TEXT",

      value:
        "",

      binding:
        "${UPPER_TEXT}",

      x:
        5,

      y:
        30,

      width:
        70,

      height:
        52,

      rotation:
        180,

      fontSize:
        14,

      fontWeight:
        600,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    /*
     * ==================================================
     * ORDER
     * ==================================================
     */

    {
      id:
        baseId + 2,

      type:
        "field",

      field:
        "ORDER",

      text:
        "ORDER",

      value:
        "",

      binding:
        "${ORDER}",

      x:
        7,

      y:
        190,

      width:
        21,

      height:
        10,

      rotation:
        0,

      fontSize:
        9,

      fontWeight:
        600,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    /*
     * ==================================================
     * LOT
     * ==================================================
     */

    {
      id:
        baseId + 3,

      type:
        "field",

      field:
        "LOT",

      text:
        "LOT",

      value:
        "",

      binding:
        "${LOT}",

      x:
        29.5,

      y:
        190,

      width:
        21,

      height:
        10,

      rotation:
        0,

      fontSize:
        9,

      fontWeight:
        600,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    /*
     * ==================================================
     * COIL
     * ==================================================
     */

    {
      id:
        baseId + 4,

      type:
        "field",

      field:
        "COIL",

      text:
        "COIL",

      value:
        "",

      binding:
        "${COIL}",

      x:
        52,

      y:
        190,

      width:
        21,

      height:
        10,

      rotation:
        0,

      fontSize:
        10,

      fontWeight:
        600,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    /*
     * ==================================================
     * CÓDIGO DE BARRAS
     * ==================================================
     *
     * El valor será automáticamente el SKU.
     */

    {
      id:
        baseId + 5,

      type:
        "barcode",

      field:
        "BARCODE",

      text:
        "BARCODE",

      value:
        "",

      binding:
        "${BARCODE}",

      barcodeFormat:
        "CODE128",

      barcodeHeight:
        30,

      barcodeWidth:
        2,

      barcodeDisplayValue:
        true,

      x:
        7,

      y:
        202,

      width:
        66,

      height:
        20,

      rotation:
        0,

      fontSize:
        11,

      fontWeight:
        400,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    /*
     * ==================================================
     * DESCRIPCIÓN INFERIOR
     * ==================================================
     *
     * Ejemplo:
     *
     * AS 16/40/2.2/0.75 R-500M
     */

    {
      id:
        baseId + 6,

      type:
        "field",

      field:
        "DESCRIPTION",

      text:
        "DESCRIPTION",

      value:
        "",

      binding:
        "${DESCRIPTION}",

      x:
        4,

      y:
        224,

      width:
        72,

      height:
        12,

      rotation:
        0,

      fontSize:
        12,

      fontWeight:
        600,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    }

  ];
}


/*
 * ==================================================
 * APLICAR DISEÑO OFICIAL AMNON
 * ==================================================
 */

export function applyAmnonFormat1Layout(
  templateId: number
): Template | null {

  const template =
    findTemplate(
      templateId
    );


  if (!template) {
    return null;
  }


  const updated: Template = {

    ...template,

    labelFormat:
      "FORMATO_1",

    backgroundImage:
      "/templates/amnon-formato1.png",

    elements:
      createAmnonFormat1Elements()

  };


  updateTemplate(
    updated
  );


  return updated;
}


/*
 * ==================================================
 * OBTENER PLANTILLAS
 * ==================================================
 */

export function getTemplates():
  Template[] {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!data) {
    return [];
  }


  try {

    const templates =
      JSON.parse(
        data
      );


    if (
      !Array.isArray(
        templates
      )
    ) {
      return [];
    }


    return templates.map(
      (
        template:
          any
      ) => ({

        id:
          Number(
            template.id
          ),

        name:
          String(
            template.name ??
            "Plantilla"
          ),

        labelFormat:
          template.labelFormat ===
          "FORMATO_2"
            ? "FORMATO_2"
            : "FORMATO_1",

        backgroundImage:
          typeof template.backgroundImage ===
          "string"
            ? template.backgroundImage
            : undefined,

        elements:
          Array.isArray(
            template.elements
          )
            ? template.elements
            : []

      })
    );

  } catch {

    console.error(
      "Error leyendo las plantillas."
    );

  }


  return [];
}


/*
 * ==================================================
 * GUARDAR PLANTILLAS
 * ==================================================
 */

export function saveTemplates(
  templates:
    Template[]
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      templates
    )
  );

}


/*
 * ==================================================
 * AÑADIR PLANTILLA
 * ==================================================
 */

export function addTemplate(
  template:
    Template
) {

  const templates =
    getTemplates();


  templates.push(
    template
  );


  saveTemplates(
    templates
  );

}


/*
 * ==================================================
 * ACTUALIZAR PLANTILLA
 * ==================================================
 */

export function updateTemplate(
  template:
    Template
) {

  const templates =
    getTemplates()
      .map(
        item =>
          Number(
            item.id
          ) ===
          Number(
            template.id
          )
            ? template
            : item
      );


  saveTemplates(
    templates
  );

}


/*
 * ==================================================
 * ELIMINAR PLANTILLA
 * ==================================================
 */

export function deleteTemplate(
  id:
    number
) {

  const templates =
    getTemplates()
      .filter(
        template =>
          Number(
            template.id
          ) !==
          Number(
            id
          )
      );


  saveTemplates(
    templates
  );

}


/*
 * ==================================================
 * BUSCAR PLANTILLA
 * ==================================================
 */

export function findTemplate(
  id:
    number
): Template | null {

  const templates =
    getTemplates();


  return (
    templates.find(
      template =>
        Number(
          template.id
        ) ===
        Number(
          id
        )
    ) ??
    null
  );

}


/*
 * ==================================================
 * SELECCIONAR PLANTILLA ACTUAL
 * ==================================================
 */

export function setCurrentTemplate(
  id:
    number
) {

  localStorage.setItem(
    CURRENT_TEMPLATE_KEY,
    String(
      id
    )
  );

}


/*
 * ==================================================
 * OBTENER PLANTILLA ACTUAL
 * ==================================================
 */

export function getCurrentTemplate():
  number | null {

  const data =
    localStorage.getItem(
      CURRENT_TEMPLATE_KEY
    );


  if (!data) {
    return null;
  }


  const id =
    Number(
      data
    );


  if (
    Number.isNaN(
      id
    )
  ) {
    return null;
  }


  return id;
}


/*
 * ==================================================
 * BORRAR PLANTILLA ACTUAL
 * ==================================================
 */

export function clearCurrentTemplate() {

  localStorage.removeItem(
    CURRENT_TEMPLATE_KEY
  );

}