import type {
  DesignerElement
} from "../components/designer/DesignerTypes";


export type LabelFormat =
  | "FORMATO_1"
  | "FORMATO_2";


export interface Template {

  id: number;

  name: string;

  labelFormat: LabelFormat;

  backgroundImage?: string;

  elements: DesignerElement[];

}


const STORAGE_KEY =
  "templates";

const CURRENT_TEMPLATE_KEY =
  "currentTemplateId";


/*
 * ==================================================
 * IDENTIFICAR FONDO OFICIAL FORMATO 1
 * ROLLOS
 * ==================================================
 */

export function getFormat1Background(
  templateName: string
): string | null {

  const name =
    templateName
      .trim()
      .toUpperCase();


  /*
   * AMNON
   */

  if (
    name.includes(
      "AMNON"
    )
  ) {

    return "/templates/amnon-formato1.png";

  }


  /*
   * LISA
   */

  if (
    name.includes(
      "LISA"
    )
  ) {

    return "/templates/lisa-formato1.png";

  }


  /*
   * MICROTUBO ROLLOS
   */

  if (
    name.includes(
      "MICROTUBO"
    )
  ) {

    return "/templates/microtuborollos-formato1.png";

  }


  /*
   * NAAN PC MAX
   *
   * IMPORTANTE:
   * comprobar MAX antes de NAAN PC
   */

  if (
    name.includes(
      "NAAN PC MAX"
    ) ||
    name.includes(
      "NAANPCMAX"
    ) ||
    name.includes(
      "NAANPC MAX"
    )
  ) {

    return "/templates/naanpcmax-formato1.png";

  }


  /*
   * NAAN PC
   */

  if (
    name.includes(
      "NAAN PC"
    ) ||
    name.includes(
      "NAANPC"
    )
  ) {

    return "/templates/naanpc-formato1.png";

  }


  /*
   * TIFDRIP+
   */

  if (
    name.includes(
      "TIFDRIP+"
    ) ||
    name.includes(
      "TIFDRIP"
    )
  ) {

    return "/templates/tifdrip+-formato1.png";

  }


  /*
   * TOPDRIP
   */

  if (
    name.includes(
      "TOPDRIP"
    ) ||
    name.includes(
      "TOP DRIP"
    )
  ) {

    return "/templates/topdrip-formato1.png";

  }


  /*
   * TURBO EXCEL ROLLOS
   */

  if (
    name.includes(
      "TURBO EXCEL"
    ) ||
    name.includes(
      "TURBOEXCEL"
    ) ||
    name.includes(
      "EXCEL"
    )
  ) {

    return "/templates/turboexcelrollos-formato1.png";

  }


  return null;

}


/*
 * ==================================================
 * ELEMENTOS OFICIALES FORMATO 1
 * ROLLOS
 * 80 x 285 mm
 * ==================================================
 */

export function createAmnonFormat1Elements():
  DesignerElement[] {

  const baseId =
    Date.now();


  return [

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
 * APLICAR DISEÑO OFICIAL FORMATO 1
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


  /*
   * Ahora no forzamos siempre AMNON.
   *
   * Buscamos automáticamente el fondo correcto
   * según el nombre de la plantilla.
   */

  const detectedBackground =
    getFormat1Background(
      template.name
    );


  const updated:
    Template = {

    ...template,

    labelFormat:
      "FORMATO_1",

    backgroundImage:
      detectedBackground ??
      template.backgroundImage,

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
 * ELEMENTOS OFICIALES FORMATO 2
 * BOBINAS
 * 240 x 110 mm
 * ==================================================
 */

export function createFormat2Elements():
  DesignerElement[] {

  const baseId =
    Date.now();


  return [

    {
      id:
        baseId + 1,

      type:
        "field",

      field:
        "COIL_DESCRIPTION",

      text:
        "COIL_DESCRIPTION",

      value:
        "",

      binding:
        "${COIL_DESCRIPTION}",

      x:
        7,

      y:
        9,

      width:
        108,

      height:
        10,

      rotation:
        0,

      fontSize:
        14,

      fontWeight:
        700,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    {
      id:
        baseId + 2,

      type:
        "field",

      field:
        "COIL_TECHNICAL",

      text:
        "COIL_TECHNICAL",

      value:
        "",

      binding:
        "${COIL_TECHNICAL}",

      x:
        7,

      y:
        20,

      width:
        108,

      height:
        36,

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
    },


    {
      id:
        baseId + 3,

      type:
        "field",

      field:
        "COIL_LEGAL",

      text:
        "COIL_LEGAL",

      value:
        "",

      binding:
        "${COIL_LEGAL}",

      x:
        7,

      y:
        57,

      width:
        62,

      height:
        15,

      rotation:
        0,

      fontSize:
        6,

      fontWeight:
        400,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    {
      id:
        baseId + 4,

      type:
        "field",

      field:
        "COIL_ORIGIN",

      text:
        "COIL_ORIGIN",

      value:
        "",

      binding:
        "${COIL_ORIGIN}",

      x:
        69,

      y:
        62,

      width:
        46,

      height:
        8,

      rotation:
        0,

      fontSize:
        7,

      fontWeight:
        600,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    {
      id:
        baseId + 5,

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
        80,

      width:
        39,

      height:
        14,

      rotation:
        0,

      fontSize:
        12,

      fontWeight:
        700,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    {
      id:
        baseId + 6,

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
        48,

      y:
        80,

      width:
        34,

      height:
        14,

      rotation:
        0,

      fontSize:
        12,

      fontWeight:
        700,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    {
      id:
        baseId + 7,

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
        84,

      y:
        80,

      width:
        31,

      height:
        14,

      rotation:
        0,

      fontSize:
        13,

      fontWeight:
        700,

      color:
        "#000000",

      locked:
        false,

      visible:
        true
    },


    {
      id:
        baseId + 8,

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
        143,

      y:
        69,

      width:
        70,

      height:
        25,

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
    }

  ];

}


/*
 * ==================================================
 * IDENTIFICAR FONDO OFICIAL FORMATO 2
 * BOBINAS
 * ==================================================
 */

export function getFormat2Background(
  templateName: string
): string | null {

  const name =
    templateName
      .trim()
      .toUpperCase();


  if (
    name.includes(
      "AMNON"
    )
  ) {

    return "/templates/formato2/amnon-formato2.png";

  }


  if (
    name.includes(
      "CHAPIN"
    )
  ) {

    return "/templates/formato2/chapin-stf-formato2.png";

  }


  if (
    name.includes(
      "D900"
    )
  ) {

    return "/templates/formato2/d900-formato2.png";

  }


  if (
    name.includes(
      "TAL DRIP"
    ) ||
    name.includes(
      "TALDRIP"
    )
  ) {

    return "/templates/formato2/taldrip-gen2-formato2.png";

  }


  if (
    name.includes(
      "TOP DRIP"
    ) ||
    name.includes(
      "TOPDRIP"
    )
  ) {

    return "/templates/formato2/topdrip-formato2.png";

  }


  if (
    name.includes(
      "TURBO EXCEL"
    ) ||
    name.includes(
      "TURBOEXCEL"
    )
  ) {

    return "/templates/formato2/turboexcel-formato2.png";

  }


  return null;

}


/*
 * ==================================================
 * APLICAR DISEÑO OFICIAL FORMATO 2
 * ==================================================
 */

export function applyOfficialFormat2Layout(
  templateId: number
): Template | null {

  const template =
    findTemplate(
      templateId
    );


  if (!template) {

    return null;

  }


  const backgroundImage =
    getFormat2Background(
      template.name
    );


  if (!backgroundImage) {

    console.error(
      "No se ha podido identificar el fondo de Formato 2:",
      template.name
    );


    return null;

  }


  const updated:
    Template = {

    ...template,

    labelFormat:
      "FORMATO_2",

    backgroundImage,

    elements:
      createFormat2Elements()

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
      ) => {

        const labelFormat:
          LabelFormat =
          template.labelFormat ===
          "FORMATO_2"
            ? "FORMATO_2"
            : "FORMATO_1";


        /*
         * ==================================================
         * AUTOCORRECCIÓN DEL FONDO
         * ==================================================
         *
         * Cada vez que se lee una plantilla buscamos
         * el fondo oficial correspondiente.
         *
         * Esto también corrige plantillas antiguas
         * guardadas en localStorage con una ruta vieja.
         */

        const officialBackground =
          labelFormat ===
          "FORMATO_2"

            ? getFormat2Background(
                String(
                  template.name ??
                  ""
                )
              )

            : getFormat1Background(
                String(
                  template.name ??
                  ""
                )
              );


        return {

          id:
            Number(
              template.id
            ),

          name:
            String(
              template.name ??
              "Plantilla"
            ),

          labelFormat,

          backgroundImage:
            officialBackground ??
            (
              typeof template.backgroundImage ===
              "string"
                ? template.backgroundImage
                : undefined
            ),

          elements:
            Array.isArray(
              template.elements
            )
              ? template.elements
              : []

        };

      }
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