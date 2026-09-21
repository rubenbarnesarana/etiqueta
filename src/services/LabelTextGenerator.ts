import type {
  Product
} from "../models/Product";

import type {
  Template
} from "./TemplateStorage";


/*
 * ==================================================
 * CONVERSIÓN ESPESOR MIL -> MM
 * ==================================================
 *
 * Solo mostramos equivalencia en mm
 * a partir de 35 mil.
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
 * OBTENER NÚMERO
 * ==================================================
 */

function getNumber(
  value: string
): number | null {

  const match =
    String(
      value ??
      ""
    )
      .replace(
        ",",
        "."
      )
      .match(
        /\d+(?:\.\d+)?/
      );


  if (
    !match
  ) {
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


  return number ===
    null
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


  if (
    number ===
    null
  ) {
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
 *
 * 75   -> 75CM
 * 50   -> 50CM
 *
 * También admite datos antiguos:
 *
 * 0.75 -> 75CM
 * 0.50 -> 50CM
 */

function formatSpacing(
  value: string
): string {

  const number =
    getNumber(
      value
    );


  if (
    number ===
    null
  ) {

    return value
      .trim()
      .toUpperCase();

  }


  const centimeters =
    number <=
    2
      ? number *
        100
      : number;


  const rounded =
    Math.round(
      centimeters *
      100
    ) /
    100;


  return `${rounded}CM`;
}


/*
 * ==================================================
 * LONGITUD DEL ROLLO
 * ==================================================
 *
 * Admite:
 *
 * R-300M
 * R-500M
 * R - 500 M
 * R500M
 */

function getRollLength(
  description: string
): string {

  const normalized =
    String(
      description ??
      ""
    )
      .toUpperCase();


  const match =
    normalized.match(
      /\bR\s*-?\s*(\d+(?:[.,]\d+)?)\s*M\b/
    );


  if (
    !match
  ) {
    return "";
  }


  return `R-${match[1].replace(
    ",",
    "."
  )}M`;
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
      templateName ??
      ""
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
      description ??
      ""
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


  /*
   * AMNON
   */

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


  /*
   * TOPDRIP
   */

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


  /*
   * RESTO
   */

  return family;
}


/*
 * ==================================================
 * DESCRIPCIÓN INFERIOR
 * ==================================================
 *
 * Esta es la descripción que aparecerá
 * debajo del código de barras.
 *
 * NO modificamos la descripción guardada
 * en Productos.
 *
 *
 * AMNON:
 *
 * AMNON PC AS 16/40/2.2/0.75 R-500M
 *
 * pasa a:
 *
 * AS 16/40/2.2/0.75 R-500M
 *
 *
 * AMNON PC ND ...
 *
 * pasa a:
 *
 * ND ...
 */

export function generateBottomDescription(
  product: Product,
  template: Template
): string {

  let description =
    String(
      product.description ??
      ""
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


  /*
   * ==================================================
   * AMNON
   * ==================================================
   */

  if (
    family ===
    "AMNON"
  ) {

    /*
     * AMNON PC AS ...
     * -> AS ...
     */

    description =
      description.replace(
        /^AMNON\s+PC\s+(AS|ND)\s+/i,
        "$1 "
      );


    /*
     * Por compatibilidad:
     *
     * AMNON AS ...
     * -> AS ...
     */

    description =
      description.replace(
        /^AMNON\s+(AS|ND)\s+/i,
        "$1 "
      );


    /*
     * Si ya era:
     *
     * AS ...
     * ND ...
     *
     * no hacemos nada.
     */

    return description;
  }


  /*
   * ==================================================
   * TOPDRIP
   * ==================================================
   *
   * TOPDRIP PC AS ...
   * TOP DRIP PC AS ...
   *
   * -> AS ...
   */

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


  /*
   * Para las demás familias todavía
   * conservamos la descripción completa
   * hasta definir sus reglas.
   */

  return description;
}


/*
 * ==================================================
 * PRESIÓN MÁXIMA
 * ==================================================
 *
 * 35 mil       -> 3 BAR
 * 40 mil o más -> 3.5 BAR
 */

function getMaxPressure(
  thickness:
    number |
    null
): string {

  if (
    thickness !==
      null &&
    thickness >=
      40
  ) {

    return "3.5 BAR";

  }


  return "3 BAR";
}


/*
 * ==================================================
 * SEGUNDA LÍNEA TEXTO SUPERIOR
 * ==================================================
 */

function buildSecondLine(
  spacing:
    string,

  thickness:
    number |
    null,

  rollLength:
    string
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


  /*
   * EQUIVALENCIA MM
   *
   * Solo desde 35 mil.
   */

  if (
    thickness !==
      null &&
    thickness >=
      35
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
 * ==================================================
 */

export function generateUpperText(
  product:
    Product,

  template:
    Template
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


  /*
   * PRIMERA LÍNEA
   *
   * AMNON PC AS 16/2.2
   */

  const firstLine =
    `${prefix} ${diameter}/${flow}`
      .trim();


  /*
   * SEGUNDA LÍNEA
   *
   * 75CM E-1MM R-500M
   */

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
        line
          .trim() !==
        ""
    )
    .join(
      "\n"
    );
}