import type {
  Product
} from "../models/Product";

import type {
  Template
} from "./TemplateStorage";


/*
 * ==================================================
 * CONVERSIÓN ESPESOR MIL -> MM
 * FORMATO 1
 * ==================================================
 */

const THICKNESS_MM:
  Record<number, string> = {

  35: "0.9",
  40: "1",
  43: "1.1",
  45: "1.15",
  47: "1.2"

};


/*
 * ==================================================
 * PRESIONES NOMINALES - FORMATO 2 / BOBINAS
 * ==================================================
 *
 * La presión depende de:
 *
 * DIÁMETRO + ESPESOR
 */

const COIL_MAX_PRESSURE:
  Record<string, string> = {

  "16/6": "1",
  "16/8": "1.2",
  "16/10": "1.4",
  "16/12": "1.5",
  "16/13": "1.5",
  "16/15": "1.8",
  "16/35": "3",
  "16/39": "3",

  "17/18": "2.5",
  "17/25": "3",
  "17/35": "3",

  "22/8": "1",
  "22/10": "1.3",
  "22/12": "1.4",
  "22/13": "1.5",
  "22/18": "2",
  "22/25": "2.2"

};


/*
 * ==================================================
 * OBTENER NÚMERO
 * ==================================================
 */

function getNumber(
  value: string
): number | null {

  const match =
    String(
      value ?? ""
    )
      .replace(
        ",",
        "."
      )
      .match(
        /\d+(?:\.\d+)?/
      );


  if (!match) {
    return null;
  }


  const number =
    Number(
      match[0]
    );


  return Number.isNaN(
    number
  )
    ? null
    : number;

}


/*
 * ==================================================
 * LIMPIAR DIÁMETRO
 * ==================================================
 */

function cleanDiameter(
  value: string
): string {

  const number =
    getNumber(
      value
    );


  return number === null
    ? value.trim()
    : String(
        number
      );

}


/*
 * ==================================================
 * LIMPIAR CAUDAL
 * ==================================================
 */

function cleanFlow(
  value: string
): string {

  const number =
    getNumber(
      value
    );


  if (number === null) {
    return value.trim();
  }


  return String(
    number
  );

}


/*
 * ==================================================
 * LIMPIAR ESPESOR
 * ==================================================
 */

function cleanThickness(
  value: string
): number | null {

  return getNumber(
    value
  );

}


/*
 * ==================================================
 * ESPACIADO
 * ==================================================
 */

function formatSpacing(
  value: string
): string {

  const number =
    getNumber(
      value
    );


  if (number === null) {

    return value
      .trim()
      .toUpperCase();

  }


  const centimeters =
    number <= 2
      ? number * 100
      : number;


  const rounded =
    Math.round(
      centimeters * 100
    ) / 100;


  return `${rounded}CM`;

}


/*
 * ==================================================
 * ESPACIADO SOLO NÚMERO
 * FORMATO 2
 * ==================================================
 */

function getSpacingNumber(
  value: string
): string {

  const number =
    getNumber(
      value
    );


  if (number === null) {
    return "";
  }


  const centimeters =
    number <= 2
      ? number * 100
      : number;


  const rounded =
    Math.round(
      centimeters * 100
    ) / 100;


  return String(
    rounded
  );

}


/*
 * ==================================================
 * LONGITUD ROLLO
 * FORMATO 1
 * ==================================================
 */

function getRollLength(
  description: string
): string {

  const normalized =
    String(
      description ?? ""
    )
      .toUpperCase();


  const match =
    normalized.match(
      /\bR\s*-?\s*(\d+(?:[.,]\d+)?)\s*M\b/
    );


  if (!match) {
    return "";
  }


  return `R-${match[1].replace(
    ",",
    "."
  )}M`;

}


/*
 * ==================================================
 * LONGITUD BOBINA
 * FORMATO 2
 * ==================================================
 *
 * Admite por ejemplo:
 *
 * 2300m
 * 2300 M
 * B-2300M
 * B2300M
 *
 * Evitamos confundir el diámetro/espesor
 * con la longitud.
 */

function getCoilLength(
  description: string
): string {

  const normalized =
    String(
      description ?? ""
    )
      .trim()
      .toUpperCase();


  /*
   * Primero buscamos B-XXXXM.
   */

  const explicit =
    normalized.match(
      /\bB\s*-?\s*(\d+(?:[.,]\d+)?)\s*M\b/
    );


  if (explicit) {

    return explicit[1]
      .replace(
        ",",
        "."
      );

  }


  /*
   * Si no existe B-, buscamos una longitud
   * terminada en M.
   *
   * Ejemplo:
   *
   * EXCEL 16/8/1.2/0.15 2300m
   */

  const matches =
    [
      ...normalized.matchAll(
        /(\d+(?:[.,]\d+)?)\s*M\b/g
      )
    ];


  if (
    matches.length === 0
  ) {

    return "";

  }


  const last =
    matches[
      matches.length - 1
    ];


  return last[1]
    .replace(
      ",",
      "."
    );

}


/*
 * ==================================================
 * FAMILIA DE LA PLANTILLA
 * ==================================================
 */

function getTemplateFamily(
  templateName: string
): string {

  const name =
    String(
      templateName ?? ""
    )
      .trim()
      .toUpperCase();


  if (
    name.includes(
      "NAAN PC MAX"
    )
  ) {

    return "NAAN PC MAX";

  }


  if (
    name.includes(
      "NAAN PC"
    )
  ) {

    return "NAAN PC";

  }


  if (
    name.includes(
      "AMNON"
    )
  ) {

    return "AMNON";

  }


  if (
    name.includes(
      "TOP DRIP"
    ) ||
    name.includes(
      "TOPDRIP"
    )
  ) {

    return "TOPDRIP";

  }


  if (
    name.includes(
      "TIFDRIP"
    )
  ) {

    return "TIFDRIP";

  }


  if (
    name.includes(
      "TURBO EXCEL"
    ) ||
    name.includes(
      "TURBOEXCEL"
    )
  ) {

    return "TURBO EXCEL";

  }


  if (
    name.includes(
      "CHAPIN"
    )
  ) {

    return "CHAPIN";

  }


  if (
    name.includes(
      "TAL DRIP"
    ) ||
    name.includes(
      "TALDRIP"
    )
  ) {

    return "TAL DRIP GEN2";

  }


  if (
    name.includes(
      "D900"
    )
  ) {

    return "D900";

  }


  if (
    name.includes(
      "MICROTUBE"
    )
  ) {

    return "MICROTUBE";

  }


  if (
    name.includes(
      "BLIND PIPE"
    )
  ) {

    return "BLIND PIPE";

  }


  return name;

}


/*
 * ==================================================
 * AS / ND
 * ==================================================
 */

function getRegulationType(
  description: string
): "AS" | "ND" | null {

  const normalized =
    String(
      description ?? ""
    )
      .trim()
      .toUpperCase();


  if (
    /(^|\s)AS(?=\s|\/|$)/.test(
      normalized
    )
  ) {

    return "AS";

  }


  if (
    /(^|\s)ND(?=\s|\/|$)/.test(
      normalized
    )
  ) {

    return "ND";

  }


  return null;

}


/*
 * ==================================================
 * PREFIJO TEXTO SUPERIOR
 * FORMATO 1
 * ==================================================
 */

function getProductPrefix(
  templateName: string,
  description: string
): string {

  const family =
    getTemplateFamily(
      templateName
    );


  const regulation =
    getRegulationType(
      description
    );


  if (
    family ===
    "AMNON"
  ) {

    if (
      regulation ===
      "AS"
    ) {

      return "AMNON PC AS";

    }


    if (
      regulation ===
      "ND"
    ) {

      return "AMNON PC ND";

    }


    return "AMNON";

  }


  if (
    family ===
    "TOPDRIP"
  ) {

    if (
      regulation ===
      "AS"
    ) {

      return "TOPDRIP PC AS";

    }


    return "TOPDRIP";

  }


  return family;

}


/*
 * ==================================================
 * DESCRIPCIÓN INFERIOR
 * FORMATO 1
 * ==================================================
 */

export function generateBottomDescription(
  product: Product,
  template: Template
): string {

  let description =
    String(
      product.description ?? ""
    )
      .trim()
      .replace(
        /\s+/g,
        " "
      );


  const family =
    getTemplateFamily(
      template.name
    );


  if (
    family ===
    "AMNON"
  ) {

    description =
      description.replace(
        /^AMNON\s+PC\s+(AS|ND)\s+/i,
        "$1 "
      );


    description =
      description.replace(
        /^AMNON\s+(AS|ND)\s+/i,
        "$1 "
      );


    return description;

  }


  if (
    family ===
    "TOPDRIP"
  ) {

    description =
      description.replace(
        /^TOP\s*DRIP\s+PC\s+(AS)\s+/i,
        "$1 "
      );


    description =
      description.replace(
        /^TOP\s*DRIP\s+(AS)\s+/i,
        "$1 "
      );


    return description;

  }


  return description;

}


/*
 * ==================================================
 * PRESIÓN MÁXIMA
 * FORMATO 1
 * ==================================================
 */

function getMaxPressure(
  thickness:
    number |
    null
): string {

  if (
    thickness !== null &&
    thickness >= 40
  ) {

    return "3.5 BAR";

  }


  return "3 BAR";

}


/*
 * ==================================================
 * SEGUNDA LÍNEA
 * FORMATO 1
 * ==================================================
 */

function buildSecondLine(
  spacing: string,
  thickness:
    number |
    null,
  rollLength: string
): string {

  const parts:
    string[] = [];


  if (
    spacing
  ) {

    parts.push(
      spacing
    );

  }


  if (
    thickness !== null &&
    thickness >= 35
  ) {

    const mm =
      THICKNESS_MM[
        thickness
      ];


    if (
      mm
    ) {

      parts.push(
        `E-${mm}MM`
      );

    }

  }


  if (
    rollLength
  ) {

    parts.push(
      rollLength
    );

  }


  return parts.join(
    " "
  );

}


/*
 * ==================================================
 * GENERAR TEXTO SUPERIOR
 * FORMATO 1
 * ==================================================
 */

export function generateUpperText(
  product: Product,
  template: Template
): string {

  const prefix =
    getProductPrefix(
      template.name,
      product.description
    );


  const diameter =
    cleanDiameter(
      product.diameter
    );


  const flow =
    cleanFlow(
      product.flow
    );


  const thickness =
    cleanThickness(
      product.thickness
    );


  const spacing =
    formatSpacing(
      product.spacing
    );


  const rollLength =
    getRollLength(
      product.description
    );


  const firstLine =
    `${prefix} ${diameter}/${flow}`
      .trim();


  const secondLine =
    buildSecondLine(
      spacing,
      thickness,
      rollLength
    );


  const pressure =
    getMaxPressure(
      thickness
    );


  return [

    firstLine,

    secondLine,

    "Emitting Pipe",

    `Max Pressure ${pressure}`,

    "ISO 9261"

  ]
    .filter(
      line =>
        line.trim() !== ""
    )
    .join(
      "\n"
    );

}


/*
 * ==================================================
 * DESCRIPCIÓN PRINCIPAL
 * FORMATO 2 / BOBINAS
 * ==================================================
 *
 * Se muestra la descripción del SKU
 * exactamente como está guardada en Productos.
 */

export function generateCoilDescription(
  product: Product
): string {

  return String(
    product.description ?? ""
  )
    .trim()
    .replace(
      /\s+/g,
      " "
    );

}


/*
 * ==================================================
 * PRESIÓN NOMINAL
 * FORMATO 2 / BOBINAS
 * ==================================================
 */

export function getCoilMaxPressure(
  product: Product
): string {

  const diameter =
    getNumber(
      product.diameter
    );


  const thickness =
    getNumber(
      product.thickness
    );


  if (
    diameter === null ||
    thickness === null
  ) {

    return "";

  }


  const key =
    `${diameter}/${thickness}`;


  return (
    COIL_MAX_PRESSURE[
      key
    ] ?? ""
  );

}


/*
 * ==================================================
 * PRESIÓN DE TRABAJO DEL CAUDAL
 * FORMATO 2
 * ==================================================
 *
 * CHAPIN -> 0.7 Bar
 * RESTO  -> 1 Bar
 */

function getCoilFlowPressure(
  template: Template,
  product: Product
): string {

  const templateName =
    String(
      template.name ?? ""
    )
      .toUpperCase();


  const description =
    String(
      product.description ?? ""
    )
      .toUpperCase();


  const dripper =
    String(
      product.dripper ?? ""
    )
      .toUpperCase();


  if (
    templateName.includes(
      "CHAPIN"
    ) ||
    description.includes(
      "CHAPIN"
    ) ||
    dripper.includes(
      "CHAPIN"
    )
  ) {

    return "0.7";

  }


  return "1";

}


/*
 * ==================================================
 * NOMBRE TÉCNICO DEL PRODUCTO
 * FORMATO 2
 * ==================================================
 */

function getCoilProductName(
  product: Product,
  template: Template
): string {

  const family =
    getTemplateFamily(
      template.name
    );


  /*
   * TURBO EXCEL
   *
   * En la zona técnica usamos EXCEL.
   */

  if (
    family ===
    "TURBO EXCEL"
  ) {

    return "EXCEL";

  }


  /*
   * CHAPIN STF
   */

  if (
    family ===
    "CHAPIN"
  ) {

    return "CHAPIN";

  }


  /*
   * TOP DRIP
   */

  if (
    family ===
    "TOPDRIP"
  ) {

    return "TOPDRIP";

  }


  /*
   * TAL DRIP
   */

  if (
    family ===
    "TAL DRIP GEN2"
  ) {

    return "TAL DRIP";

  }


  /*
   * D900
   */

  if (
    family ===
    "D900"
  ) {

    return "D900";

  }


  /*
   * AMNON
   */

  if (
    family ===
    "AMNON"
  ) {

    return "AMNON";

  }


  /*
   * Si no conocemos la familia,
   * utilizamos el tipo de gotero.
   */

  const dripper =
    String(
      product.dripper ?? ""
    )
      .trim()
      .toUpperCase();


  if (
    dripper
  ) {

    return dripper;

  }


  return family;

}


/*
 * ==================================================
 * BLOQUE TÉCNICO
 * FORMATO 2 / BOBINAS
 * ==================================================
 *
 * Ejemplo:
 *
 * EXCEL 16/8 MIL 15 CM
 * 1.2 L/H at 1 Bar - B-2300M
 * EMITTING PIPE ISO 9261
 * Max Pressure 1.2 Bar
 */

export function generateCoilTechnicalText(
  product: Product,
  template: Template
): string {

  const productName =
    getCoilProductName(
      product,
      template
    );


  const diameter =
    cleanDiameter(
      product.diameter
    );


  const thickness =
    cleanThickness(
      product.thickness
    );


  const flow =
    cleanFlow(
      product.flow
    );


  const spacing =
    getSpacingNumber(
      product.spacing
    );


  const coilLength =
    getCoilLength(
      product.description
    );


  const flowPressure =
    getCoilFlowPressure(
      template,
      product
    );


  const maxPressure =
    getCoilMaxPressure(
      product
    );


  /*
   * PRIMERA LÍNEA
   */

  const firstLineParts:
    string[] = [];


  if (
    productName
  ) {

    firstLineParts.push(
      productName
    );

  }


  if (
    diameter
  ) {

    if (
      thickness !== null
    ) {

      firstLineParts.push(
        `${diameter}/${thickness} MIL`
      );

    } else {

      firstLineParts.push(
        diameter
      );

    }

  }


  if (
    spacing
  ) {

    firstLineParts.push(
      `${spacing} CM`
    );

  }


  const firstLine =
    firstLineParts.join(
      " "
    );


  /*
   * SEGUNDA LÍNEA
   */

  const secondLineParts:
    string[] = [];


  if (
    flow
  ) {

    secondLineParts.push(
      `${flow} L/H at ${flowPressure} Bar`
    );

  }


  if (
    coilLength
  ) {

    secondLineParts.push(
      `B-${coilLength}M`
    );

  }


  const secondLine =
    secondLineParts.join(
      " - "
    );


  /*
   * RESULTADO
   */

  return [

    firstLine,

    secondLine,

    "EMITTING PIPE ISO 9261",

    maxPressure
      ? `Max Pressure ${maxPressure} Bar`
      : "Max Pressure"

  ]
    .filter(
      line =>
        line.trim() !== ""
    )
    .join(
      "\n"
    );

}


/*
 * ==================================================
 * TEXTO FIJO INFERIOR IZQUIERDO
 * FORMATO 2
 * ==================================================
 *
 * El año cambia automáticamente.
 */

export function generateCoilLegalText():
  string {

  const year =
    new Date()
      .getFullYear();


  return [
    "Non reusable and non-compensated emitting pipe.",
    "Operation at low pressure: regular.",
    `Year:${year}`
  ]
    .join(
      "\n"
    );

}


/*
 * ==================================================
 * ORIGEN / PLANTA
 * FORMATO 2
 * ==================================================
 */

export function generateCoilOriginText():
  string {

  return "MADE IN SPAIN     QI02";

}