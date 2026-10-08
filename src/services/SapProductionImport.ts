import * as XLSX from "xlsx";

import {
  findProduct
} from "./ProductStorage";

import {
  getOrders
} from "./OrderStorage";


/*
 * ==================================================
 * ESTADO DE UNA FILA DE PREVISUALIZACIÓN
 * ==================================================
 */

export type SapProductionPreviewStatus =
  | "READY"
  | "DUPLICATE"
  | "SKU_MISSING"
  | "QUANTITY_UNKNOWN"
  | "ROLLS_NOT_INTEGER";


/*
 * ==================================================
 * FILA DE PREVISUALIZACIÓN
 * ==================================================
 */

export interface SapProductionPreviewRow {

  id: string;

  sourceRow: number;

  center: string;

  order: string;

  workCenter: string;

  sku: string;

  sapDescription: string;

  productDescription: string;

  sapTotalQuantity: number;

  sapUnit: string;

  quantityPerRoll: number;

  quantityUnit:
    | "M"
    | "UN";

  calculatedRolls: number;

  productionLine: number;

  marking: string;

  templateId: number;

  alreadyExists: boolean;

  productExists: boolean;

  status: SapProductionPreviewStatus;

  message: string;

}


/*
 * ==================================================
 * RESULTADO
 * ==================================================
 */

export interface SapProductionPreviewResult {

  fileName: string;

  sheetName: string;

  totalRows: number;

  readyRows: number;

  duplicateRows: number;

  missingProductRows: number;

  incompleteRows: number;

  rows: SapProductionPreviewRow[];

}


/*
 * ==================================================
 * NORMALIZAR TEXTO
 * ==================================================
 */

function normalizeText(
  value: unknown
): string {

  return String(
    value ??
    ""
  )
    .trim()
    .toUpperCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );

}


/*
 * ==================================================
 * LEER VALOR DE COLUMNA
 * ==================================================
 *
 * Buscamos la columna sin depender de:
 *
 * - mayúsculas/minúsculas
 * - acentos
 * - pequeños cambios de espacios
 *
 * ==================================================
 */

function getField(
  row: Record<string, unknown>,
  names: string[]
): unknown {

  const normalizedNames =
    names.map(
      name =>
        normalizeText(
          name
        )
    );


  const entries =
    Object.entries(
      row
    );


  for (
    const [
      key,
      value
    ] of entries
  ) {

    const normalizedKey =
      normalizeText(
        key
      );


    if (
      normalizedNames.includes(
        normalizedKey
      )
    ) {

      return value;

    }

  }


  return "";

}


/*
 * ==================================================
 * NÚMERO SEGURO
 * ==================================================
 */

function toNumber(
  value: unknown
): number {

  if (
    typeof value ===
    "number"
  ) {

    return Number.isFinite(
      value
    )
      ? value
      : 0;

  }


  const text =
    String(
      value ??
      ""
    )
      .trim()
      .replace(
        /\s/g,
        ""
      );


  if (
    !text
  ) {

    return 0;

  }


  /*
   * Formatos posibles:
   *
   * 10000
   * 10.000
   * 10000,50
   * 10.000,50
   */

  let normalized =
    text;


  if (
    text.includes(
      ","
    )
  ) {

    normalized =
      text
        .replace(
          /\./g,
          ""
        )
        .replace(
          ",",
          "."
        );

  }
  else {

    const dotCount =
      (
        text.match(
          /\./g
        ) ??
        []
      ).length;


    if (
      dotCount ===
        1
    ) {

      const parts =
        text.split(
          "."
        );


      if (
        parts[1]?.length ===
          3
      ) {

        normalized =
          text.replace(
            ".",
            ""
          );

      }

    }
    else if (
      dotCount >
        1
    ) {

      normalized =
        text.replace(
          /\./g,
          ""
        );

    }

  }


  const number =
    Number(
      normalized
    );


  return Number.isFinite(
    number
  )
    ? number
    : 0;

}


/*
 * ==================================================
 * NORMALIZAR UNIDAD SAP
 * ==================================================
 */

function getQuantityUnit(
  sapUnit: string
):
  | "M"
  | "UN" {

  const normalized =
    normalizeText(
      sapUnit
    );


  if (
    normalized ===
      "UN" ||
    normalized ===
      "UND" ||
    normalized ===
      "UNIDAD" ||
    normalized ===
      "UNIDADES"
  ) {

    return "UN";

  }


  return "M";

}


/*
 * ==================================================
 * DETECTAR MICROTUBO CORTADO
 * ==================================================
 */

function isCutMicrotube(
  description: string
): boolean {

  const normalized =
    normalizeText(
      description
    );


  return (
    normalized.includes(
      "MICRO"
    ) &&
    (
      normalized.includes(
        "CUT"
      ) ||
      normalized.includes(
        "CORTADO"
      )
    )
  );

}


/*
 * ==================================================
 * DETECTAR CANTIDAD POR ROLLO / BOBINA
 * ==================================================
 *
 * Ejemplos que reconoce:
 *
 * R100M
 * R-100M
 * R 100M
 *
 * R500M
 * R-500M
 *
 * B750M
 * B-750M
 *
 * B3000M
 * B-3000M
 *
 * MicroTube CUT:
 * 2500 UN
 *
 * ==================================================
 */

function detectQuantityPerRoll(
  description: string,
  sapUnit: string
): {
  quantity: number;
  unit:
    | "M"
    | "UN";
} {

  const normalizedDescription =
    String(
      description ??
      ""
    ).trim();


  const quantityUnit =
    getQuantityUnit(
      sapUnit
    );


  /*
   * MicroTube CUT / CORTADO.
   *
   * Regla de nuestra aplicación:
   * 2.500 unidades por bobina.
   */

  if (
    quantityUnit ===
      "UN" &&
    isCutMicrotube(
      normalizedDescription
    )
  ) {

    return {
      quantity:
        2500,

      unit:
        "UN"
    };

  }


  /*
   * Buscar:
   *
   * R100M
   * R-100M
   * B3000M
   * B-750m
   *
   * El prefijo R/B evita confundirlo con:
   *
   * 1,15MM
   * 0.60M
   * 16MM
   */

  const rollMatch =
    normalizedDescription.match(
      /(?:^|[\s/])(?:R|B)\s*-?\s*(\d+(?:[.,]\d+)?)\s*M(?:\b|$)/i
    );


  if (
    rollMatch?.[1]
  ) {

    const quantity =
      Number(
        rollMatch[1]
          .replace(
            ",",
            "."
          )
      );


    if (
      Number.isFinite(
        quantity
      ) &&
      quantity >
        0
    ) {

      return {
        quantity,
        unit:
          "M"
      };

    }

  }


  return {
    quantity:
      0,

    unit:
      quantityUnit
  };

}


/*
 * ==================================================
 * CALCULAR Nº DE BOBINAS
 * ==================================================
 */

function calculateRolls(
  totalQuantity: number,
  quantityPerRoll: number
): number {

  if (
    totalQuantity <=
      0 ||
    quantityPerRoll <=
      0
  ) {

    return 0;

  }


  return (
    totalQuantity /
    quantityPerRoll
  );

}


/*
 * ==================================================
 * ¿ES ENTERO?
 * ==================================================
 */

function isIntegerRollQuantity(
  value: number
): boolean {

  if (
    !Number.isFinite(
      value
    )
  ) {

    return false;

  }


  return (
    Math.abs(
      value -
      Math.round(
        value
      )
    ) <
    0.000001
  );

}


/*
 * ==================================================
 * DETERMINAR ESTADO
 * ==================================================
 */

function determineStatus(
  alreadyExists: boolean,
  productExists: boolean,
  quantityPerRoll: number,
  calculatedRolls: number
): {
  status: SapProductionPreviewStatus;
  message: string;
} {

  if (
    alreadyExists
  ) {

    return {
      status:
        "DUPLICATE",

      message:
        "Esta orden de fabricación ya existe en la aplicación."
    };

  }


  if (
    !productExists
  ) {

    return {
      status:
        "SKU_MISSING",

      message:
        "El SKU no existe en Productos. Debe crearse antes de importar la OF."
    };

  }


  if (
    quantityPerRoll <=
      0
  ) {

    return {
      status:
        "QUANTITY_UNKNOWN",

      message:
        "No se ha podido detectar automáticamente la cantidad por rollo / bobina."
    };

  }


  if (
    calculatedRolls <=
      0 ||
    !isIntegerRollQuantity(
      calculatedRolls
    )
  ) {

    return {
      status:
        "ROLLS_NOT_INTEGER",

      message:
        "La cantidad SAP no da un número entero de rollos / bobinas. Debe revisarse."
    };

  }


  return {
    status:
      "READY",

    message:
      "Orden preparada para importar."
  };

}


/*
 * ==================================================
 * LEER EXCEL SAP
 * ==================================================
 */

export async function previewSapProductionOrders(
  file: File
): Promise<SapProductionPreviewResult> {

  const extension =
    file.name
      .split(
        "."
      )
      .pop()
      ?.toLowerCase();


  if (
    extension !==
      "xlsx" &&
    extension !==
      "xls"
  ) {

    throw new Error(
      "El archivo debe ser un Excel .xlsx o .xls."
    );

  }


  /*
   * Leer fichero
   */

  const buffer =
    await file.arrayBuffer();


  const workbook =
    XLSX.read(
      buffer,
      {
        type:
          "array",

        cellDates:
          false
      }
    );


  const sheetName =
    workbook.SheetNames[0];


  if (
    !sheetName
  ) {

    throw new Error(
      "El Excel no contiene ninguna hoja."
    );

  }


  const worksheet =
    workbook.Sheets[
      sheetName
    ];


  if (
    !worksheet
  ) {

    throw new Error(
      "No se ha podido leer la primera hoja del Excel."
    );

  }


  const rawRows =
    XLSX.utils.sheet_to_json<
      Record<string, unknown>
    >(
      worksheet,
      {
        defval:
          "",

        raw:
          true
      }
    );


  if (
    rawRows.length ===
      0
  ) {

    throw new Error(
      "El Excel no contiene órdenes de producción."
    );

  }


  /*
   * Comprobar estructura mínima.
   */

  const firstRow =
    rawRows[0];


  const firstOrder =
    getField(
      firstRow,
      [
        "Orden"
      ]
    );


  const firstSku =
    getField(
      firstRow,
      [
        "Número material",
        "Numero material"
      ]
    );


  if (
    firstOrder ===
      "" &&
    firstSku ===
      ""
  ) {

    throw new Error(
      "El formato del Excel no coincide con la exportación SAP esperada. No se encuentran las columnas Orden y Número material."
    );

  }


  /*
   * Órdenes ya existentes.
   */

  const existingOrders =
    getOrders();


  /*
   * Convertir filas SAP.
   */

  const rows:
    SapProductionPreviewRow[] =
    [];


  rawRows.forEach(
    (
      rawRow,
      index
    ) => {

      const sourceRow =
        index +
        2;


      const center =
        String(
          getField(
            rawRow,
            [
              "Centro"
            ]
          ) ??
          ""
        ).trim();


      const order =
        String(
          getField(
            rawRow,
            [
              "Orden"
            ]
          ) ??
          ""
        ).trim();


      const workCenter =
        String(
          getField(
            rawRow,
            [
              "Puesto de trabajo"
            ]
          ) ??
          ""
        ).trim();


      const totalQuantity =
        toNumber(
          getField(
            rawRow,
            [
              "Cantidad orden (GMEIN)"
            ]
          )
        );


      const sku =
        String(
          getField(
            rawRow,
            [
              "Número material",
              "Numero material"
            ]
          ) ??
          ""
        ).trim();


      const sapDescription =
        String(
          getField(
            rawRow,
            [
              "Texto breve material"
            ]
          ) ??
          ""
        ).trim();


      const sapUnit =
        String(
          getField(
            rawRow,
            [
              "Unidad de medida (=GMEIN)",
              "Unidad de medida"
            ]
          ) ??
          ""
        ).trim();


      /*
       * Ignorar filas completamente vacías.
       */

      if (
        !order &&
        !sku &&
        !sapDescription
      ) {

        return;

      }


      const product =
        findProduct(
          sku
        );


      const productExists =
        Boolean(
          product
        );


      const alreadyExists =
        existingOrders.some(
          existing =>
            String(
              existing.order
            ).trim() ===
            order
        );


      const detectedQuantity =
        detectQuantityPerRoll(
          sapDescription,
          sapUnit
        );


      const calculatedRolls =
        calculateRolls(
          totalQuantity,
          detectedQuantity.quantity
        );


      const state =
        determineStatus(
          alreadyExists,
          productExists,
          detectedQuantity.quantity,
          calculatedRolls
        );


      rows.push({

        id:
          `${order}-${sourceRow}`,

        sourceRow,

        center,

        order,

        workCenter,

        sku,

        sapDescription,

        productDescription:
          product?.description ??
          "",

        sapTotalQuantity:
          totalQuantity,

        sapUnit,

        quantityPerRoll:
          detectedQuantity.quantity,

        quantityUnit:
          detectedQuantity.unit,

        calculatedRolls:
          isIntegerRollQuantity(
            calculatedRolls
          )
            ? Math.round(
                calculatedRolls
              )
            : calculatedRolls,

        /*
         * Todavía NO asignamos automáticamente
         * CO-1 / EX-1 / MWL a líneas 1-8.
         *
         * Lo haremos en la pantalla de preview
         * para que puedas decidir el mapeo.
         */

        productionLine:
          0,

        marking:
          product?.marking ??
          "",

        templateId:
          Number(
            product?.templateId ??
            0
          ),

        alreadyExists,

        productExists,

        status:
          state.status,

        message:
          state.message

      });

    }
  );


  return {

    fileName:
      file.name,

    sheetName,

    totalRows:
      rows.length,

    readyRows:
      rows.filter(
        row =>
          row.status ===
          "READY"
      ).length,

    duplicateRows:
      rows.filter(
        row =>
          row.status ===
          "DUPLICATE"
      ).length,

    missingProductRows:
      rows.filter(
        row =>
          row.status ===
          "SKU_MISSING"
      ).length,

    incompleteRows:
      rows.filter(
        row =>
          row.status ===
            "QUANTITY_UNKNOWN" ||
          row.status ===
            "ROLLS_NOT_INTEGER"
      ).length,

    rows

  };

}