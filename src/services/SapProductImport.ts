import * as XLSX from "xlsx";

import type {
  Product
} from "../models/Product";


/*
 * ==================================================
 * ESTADO DE UNA FILA DE PREVISUALIZACIÓN
 * ==================================================
 */

export type SapPreviewStatus =
  | "NEW"
  | "UPDATE";


/*
 * ==================================================
 * FILA DE PREVISUALIZACIÓN
 * ==================================================
 */

export interface SapProductPreview {

  sku: string;

  description: string;

  diameter: string;

  thickness: string;

  flow: string;

  spacing: string;

  dripper: string;

  status: SapPreviewStatus;

  existingProductId?: number;

  existingTemplateId?: number;

  completeTechnicalData: boolean;

}


/*
 * ==================================================
 * RESULTADO DE PREVISUALIZACIÓN
 * ==================================================
 */

export interface SapPreviewResult {

  rows: SapProductPreview[];

  totalRows: number;

  newProducts: number;

  existingProducts: number;

  completeProducts: number;

  incompleteProducts: number;

  skipped: number;

}


/*
 * ==================================================
 * RESULTADO DE IMPORTACIÓN
 * ==================================================
 */

export interface SapImportResult {

  products: Product[];

  totalRows: number;

  imported: number;

  created: number;

  updated: number;

  skipped: number;

}


/*
 * ==================================================
 * FILA SAP INTERNA
 * ==================================================
 */

interface SapRow {

  sku: string;

  description: string;

}


/*
 * ==================================================
 * LIMPIEZA DE TEXTO
 * ==================================================
 */

function cleanText(
  value: unknown
): string {

  return String(
    value ?? ""
  )
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .trim();

}


/*
 * ==================================================
 * NORMALIZAR CABECERA
 * ==================================================
 */

function normalizeHeader(
  value: unknown
): string {

  return cleanText(
    value
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

}


/*
 * ==================================================
 * NORMALIZAR ESPACIADO
 * ==================================================
 */

function normalizeSpacing(
  value: string
): string {

  const number =
    Number(
      value.replace(
        ",",
        "."
      )
    );


  if (
    Number.isNaN(
      number
    )
  ) {

    return "";

  }


  /*
   * 0.15 -> 15
   * 0.20 -> 20
   * 0.30 -> 30
   * 0.40 -> 40
   * 0.75 -> 75
   * 1.00 -> 100
   */

  if (
    number > 0 &&
    number <= 1.5
  ) {

    return String(
      Math.round(
        number * 100
      )
    );

  }


  return String(
    number
  );

}


/*
 * ==================================================
 * CONVERSIÓN MM -> MIL
 * ==================================================
 */

function mmToMil(
  value: number
): string {

  const knownValues = [

    {
      mm: 0.15,
      mil: 6
    },

    {
      mm: 0.20,
      mil: 8
    },

    {
      mm: 0.25,
      mil: 10
    },

    {
      mm: 0.30,
      mil: 12
    },

    {
      mm: 0.33,
      mil: 13
    },

    {
      mm: 0.38,
      mil: 15
    },

    {
      mm: 0.46,
      mil: 18
    },

    {
      mm: 0.50,
      mil: 20
    },

    {
      mm: 0.64,
      mil: 25
    },

    {
      mm: 0.76,
      mil: 30
    },

    {
      mm: 0.90,
      mil: 35
    },

    {
      mm: 1.00,
      mil: 40
    },

    {
      mm: 1.10,
      mil: 43
    },

    {
      mm: 1.15,
      mil: 45
    },

    {
      mm: 1.20,
      mil: 47
    }

  ];


  let bestMil = "";

  let bestDifference =
    Number.POSITIVE_INFINITY;


  for (
    const item
    of knownValues
  ) {

    const difference =
      Math.abs(
        item.mm -
        value
      );


    if (
      difference <
      bestDifference
    ) {

      bestDifference =
        difference;

      bestMil =
        String(
          item.mil
        );

    }

  }


  if (
    bestDifference <= 0.04
  ) {

    return bestMil;

  }


  return "";

}


/*
 * ==================================================
 * EXTRAER DIÁMETRO
 * ==================================================
 */

function extractDiameter(
  description: string
): string {

  const slashMatch =
    description.match(
      /\b(16|17|20|22|23)\s*\/\s*\d/
    );


  if (
    slashMatch
  ) {

    return slashMatch[1];

  }


  const mmMatch =
    description.match(
      /\b(16|17|20|22|23)\s*MM\b/i
    );


  if (
    mmMatch
  ) {

    return mmMatch[1];

  }


  return "";

}


/*
 * ==================================================
 * EXTRAER ESPESOR
 * ==================================================
 */

function extractThickness(
  description: string
): string {

  const slashMatch =
    description.match(
      /\b(?:16|17|20|22|23)\s*\/\s*(\d+(?:[.,]\d+)?)\s*\//
    );


  if (
    slashMatch
  ) {

    const value =
      Number(
        slashMatch[1]
          .replace(
            ",",
            "."
          )
      );


    if (
      !Number.isNaN(
        value
      )
    ) {

      if (
        value >= 5
      ) {

        return String(
          value
        );

      }


      return mmToMil(
        value
      );

    }

  }


  const milMatch =
    description.match(
      /\b(\d+(?:[.,]\d+)?)\s*MIL\b/i
    );


  if (
    milMatch
  ) {

    return milMatch[1]
      .replace(
        ",",
        "."
      );

  }


  const mmMatch =
    description.match(
      /\b(\d+[.,]\d+)\s*MM\b/i
    );


  if (
    mmMatch
  ) {

    const value =
      Number(
        mmMatch[1]
          .replace(
            ",",
            "."
          )
      );


    if (
      !Number.isNaN(
        value
      )
    ) {

      return mmToMil(
        value
      );

    }

  }


  return "";

}


/*
 * ==================================================
 * EXTRAER CAUDAL
 * ==================================================
 */

function extractFlow(
  description: string
): string {

  const slashMatch =
    description.match(
      /\b(?:16|17|20|22|23)\s*\/\s*\d+(?:[.,]\d+)?\s*\/\s*(\d+(?:[.,]\d+)?)\s*\//
    );


  if (
    slashMatch
  ) {

    return slashMatch[1]
      .replace(
        ",",
        "."
      );

  }


  const flowMatch =
    description.match(
      /\b(\d+(?:[.,]\d+)?)\s*(?:L\/H|LPH)\b/i
    );


  if (
    flowMatch
  ) {

    return flowMatch[1]
      .replace(
        ",",
        "."
      );

  }


  /*
   * Formato antiguo:
   *
   * AMNON AS 16/2.2 95CM
   */

  const oldMatch =
    description.match(
      /\b(?:16|17|20|22|23)\s*\/\s*(\d+(?:[.,]\d+)?)\b/
    );


  if (
    oldMatch
  ) {

    return oldMatch[1]
      .replace(
        ",",
        "."
      );

  }


  return "";

}


/*
 * ==================================================
 * EXTRAER ESPACIADO
 * ==================================================
 */

function extractSpacing(
  description: string
): string {

  const slashMatch =
    description.match(
      /\b(?:16|17|20|22|23)\s*\/\s*\d+(?:[.,]\d+)?\s*\/\s*\d+(?:[.,]\d+)?\s*\/\s*(\d+(?:[.,]\d+)?)/
    );


  if (
    slashMatch
  ) {

    return normalizeSpacing(
      slashMatch[1]
    );

  }


  const cmMatch =
    description.match(
      /\b(\d+(?:[.,]\d+)?)\s*CM\b/i
    );


  if (
    cmMatch
  ) {

    return String(
      Number(
        cmMatch[1]
          .replace(
            ",",
            "."
          )
      )
    );

  }


  return "";

}


/*
 * ==================================================
 * EXTRAER FAMILIA / GOTERO
 * ==================================================
 */

function extractDripper(
  description: string
): string {

  const text =
    description
      .toUpperCase()
      .trim();


  if (
    text.includes(
      "AMNON"
    )
  ) {

    return "AMNON";

  }


  if (
    text.includes(
      "TOPDRIP"
    )
  ) {

    return "TOPDRIP";

  }


  if (
    text.includes(
      "NAAN PC MAX"
    )
  ) {

    return "NAAN PC MAX";

  }


  if (
    text.includes(
      "NAAN PC"
    )
  ) {

    return "NAAN PC";

  }


  if (
    text.includes(
      "TURBO EXCEL"
    )
    ||
    text.includes(
      "TURBOEXCEL"
    )
    ||
    text.startsWith(
      "EXCEL "
    )
  ) {

    return "TURBO EXCEL";

  }


  if (
    text.includes(
      "CHAPIN"
    )
  ) {

    return "CHAPIN";

  }


  if (
    text.includes(
      "TALDRIP"
    )
    ||
    text.includes(
      "TAL DRIP"
    )
  ) {

    return "TAL DRIP";

  }


  if (
    text.includes(
      "D900"
    )
  ) {

    return "D900";

  }


  if (
    text.includes(
      "TIFDRIP"
    )
  ) {

    return "TIFDRIP";

  }


  if (
    text.includes(
      "MICRO"
    )
  ) {

    return "MICROTUBO";

  }


  return "";

}


/*
 * ==================================================
 * LOCALIZAR COLUMNAS
 * ==================================================
 */

function findColumns(
  headers: unknown[]
) {

  const normalized =
    headers.map(
      normalizeHeader
    );


  const skuIndex =
    normalized.findIndex(
      header =>
        header === "material"
        ||
        header === "sku"
        ||
        header === "codigo material"
        ||
        header === "codigo de material"
    );


  const descriptionIndex =
    normalized.findIndex(
      header =>
        header.includes(
          "texto breve de material"
        )
        ||
        header === "descripcion"
        ||
        header === "description"
        ||
        header === "texto breve"
    );


  return {

    skuIndex,

    descriptionIndex

  };

}


/*
 * ==================================================
 * CONVERTIR MATRIZ EN FILAS SAP
 * ==================================================
 */

function matrixToSapRows(
  matrix: unknown[][]
): SapRow[] {

  if (
    matrix.length === 0
  ) {

    return [];

  }


  let headerRowIndex = -1;

  let skuIndex = -1;

  let descriptionIndex = -1;


  const maxHeaderSearch =
    Math.min(
      matrix.length,
      30
    );


  for (
    let i = 0;
    i < maxHeaderSearch;
    i++
  ) {

    const row =
      matrix[i] ?? [];


    const columns =
      findColumns(
        row
      );


    if (
      columns.skuIndex !== -1
      &&
      columns.descriptionIndex !== -1
    ) {

      headerRowIndex = i;

      skuIndex =
        columns.skuIndex;

      descriptionIndex =
        columns.descriptionIndex;

      break;

    }

  }


  if (
    headerRowIndex === -1
  ) {

    throw new Error(
      "No encuentro las columnas Material y Texto breve de material en el archivo."
    );

  }


  const rows:
    SapRow[] = [];


  for (
    let i =
      headerRowIndex + 1;
    i < matrix.length;
    i++
  ) {

    const row =
      matrix[i] ?? [];


    const sku =
      cleanText(
        row[
          skuIndex
        ]
      );


    const description =
      cleanText(
        row[
          descriptionIndex
        ]
      );


    if (
      !sku
    ) {

      continue;

    }


    const normalizedSku =
      sku.replace(
        /\.0$/,
        ""
      );


    if (
      !/^\d+$/.test(
        normalizedSku
      )
    ) {

      continue;

    }


    rows.push({

      sku:
        normalizedSku,

      description

    });

  }


  return rows;

}


/*
 * ==================================================
 * LEER EXCEL
 * ==================================================
 */

function readExcelRows(
  buffer: ArrayBuffer
): SapRow[] {

  const workbook =
    XLSX.read(
      buffer,
      {
        type: "array"
      }
    );


  if (
    workbook.SheetNames.length === 0
  ) {

    throw new Error(
      "El archivo Excel no contiene hojas."
    );

  }


  let lastError:
    unknown = null;


  for (
    const sheetName
    of workbook.SheetNames
  ) {

    const worksheet =
      workbook.Sheets[
        sheetName
      ];


    if (
      !worksheet
    ) {

      continue;

    }


    const matrix =
      XLSX.utils.sheet_to_json<
        unknown[]
      >(
        worksheet,
        {
          header: 1,
          raw: false,
          defval: ""
        }
      );


    try {

      return matrixToSapRows(
        matrix
      );

    } catch (
      error
    ) {

      lastError =
        error;

    }

  }


  if (
    lastError instanceof Error
  ) {

    throw lastError;

  }


  throw new Error(
    "No se han encontrado productos en el archivo Excel."
  );

}


/*
 * ==================================================
 * LEER TEXTO SAP
 * ==================================================
 */

function readTextRows(
  buffer: ArrayBuffer
): SapRow[] {

  const encodings = [
    "utf-16le",
    "utf-8"
  ];


  for (
    const encoding
    of encodings
  ) {

    try {

      const text =
        new TextDecoder(
          encoding
        ).decode(
          buffer
        );


      const clean =
        text.replace(
          /^\uFEFF/,
          ""
        );


      const lines =
        clean
          .split(
            /\r?\n/
          )
          .filter(
            line =>
              line.trim() !== ""
          );


      if (
        lines.length === 0
      ) {

        continue;

      }


      let separator =
        "\t";


      if (
        !lines[0].includes(
          "\t"
        )
      ) {

        if (
          lines[0].includes(
            ";"
          )
        ) {

          separator =
            ";";

        } else {

          separator =
            ",";

        }

      }


      const matrix =
        lines.map(
          line =>
            line.split(
              separator
            )
        );


      try {

        return matrixToSapRows(
          matrix
        );

      } catch {

        /*
         * Probamos siguiente codificación.
         */

      }

    } catch {

      /*
       * Probamos siguiente codificación.
       */

    }

  }


  throw new Error(
    "No se ha podido leer el archivo exportado desde SAP."
  );

}


/*
 * ==================================================
 * LEER ARCHIVO SEGÚN FORMATO
 * ==================================================
 */

async function readSapFile(
  file: File
): Promise<SapRow[]> {

  const buffer =
    await file.arrayBuffer();


  const fileName =
    file.name.toLowerCase();


  if (
    fileName.endsWith(
      ".xlsx"
    )
    ||
    fileName.endsWith(
      ".xlsm"
    )
  ) {

    return readExcelRows(
      buffer
    );

  }


  if (
    fileName.endsWith(
      ".xls"
    )
  ) {

    try {

      return readExcelRows(
        buffer
      );

    } catch {

      return readTextRows(
        buffer
      );

    }

  }


  if (
    fileName.endsWith(
      ".csv"
    )
    ||
    fileName.endsWith(
      ".txt"
    )
  ) {

    return readTextRows(
      buffer
    );

  }


  throw new Error(
    "Formato no admitido. Utiliza XLS, XLSX, XLSM, CSV o TXT."
  );

}


/*
 * ==================================================
 * CREAR PREVISUALIZACIÓN
 * ==================================================
 */

export async function previewSapProducts(
  file: File,
  existingProducts: Product[]
): Promise<SapPreviewResult> {

  const sapRows =
    await readSapFile(
      file
    );


  if (
    sapRows.length === 0
  ) {

    throw new Error(
      "No se han encontrado productos válidos en el archivo."
    );

  }


  const existingBySku =
    new Map<
      string,
      Product
    >();


  existingProducts.forEach(
    product => {

      existingBySku.set(
        product.sapCode.trim(),
        product
      );

    }
  );


  /*
   * Evitamos duplicados dentro del Excel.
   */

  const uniqueRows =
    new Map<
      string,
      SapRow
    >();


  let skipped = 0;


  sapRows.forEach(
    row => {

      if (
        !row.sku
        ||
        !row.description
      ) {

        skipped++;

        return;

      }


      uniqueRows.set(
        row.sku,
        row
      );

    }
  );


  const rows:
    SapProductPreview[] = [];


  let newProducts = 0;

  let existingCount = 0;

  let completeProducts = 0;

  let incompleteProducts = 0;


  uniqueRows.forEach(
    row => {

      const existing =
        existingBySku.get(
          row.sku
        );


      const diameter =
        extractDiameter(
          row.description
        );


      const thickness =
        extractThickness(
          row.description
        );


      const flow =
        extractFlow(
          row.description
        );


      const spacing =
        extractSpacing(
          row.description
        );


      const dripper =
        extractDripper(
          row.description
        );


      /*
       * Consideramos completa la información
       * técnica cuando se han podido identificar
       * los cuatro datos principales.
       */

      const completeTechnicalData =
        Boolean(
          diameter
          &&
          thickness
          &&
          flow
          &&
          spacing
        );


      if (
        existing
      ) {

        existingCount++;

      } else {

        newProducts++;

      }


      if (
        completeTechnicalData
      ) {

        completeProducts++;

      } else {

        incompleteProducts++;

      }


      rows.push({

        sku:
          row.sku,

        description:
          row.description,

        diameter,

        thickness,

        flow,

        spacing,

        dripper,

        status:
          existing
            ? "UPDATE"
            : "NEW",

        existingProductId:
          existing?.id,

        existingTemplateId:
          existing?.templateId,

        completeTechnicalData

      });

    }
  );


  rows.sort(
    (
      a,
      b
    ) =>
      a.sku.localeCompare(
        b.sku,
        undefined,
        {
          numeric: true
        }
      )
  );


  return {

    rows,

    totalRows:
      rows.length,

    newProducts,

    existingProducts:
      existingCount,

    completeProducts,

    incompleteProducts,

    skipped

  };

}


/*
 * ==================================================
 * CONFIRMAR IMPORTACIÓN
 * ==================================================
 */

export function confirmSapProducts(
  previewRows: SapProductPreview[],
  existingProducts: Product[]
): SapImportResult {

  const existingBySku =
    new Map<
      string,
      Product
    >();


  existingProducts.forEach(
    product => {

      existingBySku.set(
        product.sapCode.trim(),
        product
      );

    }
  );


  let nextId =
    existingProducts.reduce(
      (
        max,
        product
      ) =>
        Math.max(
          max,
          Number(
            product.id
          ) || 0
        ),
      0
    ) + 1;


  const finalBySku =
    new Map<
      string,
      Product
    >();


  /*
   * Conservamos primero todos los
   * productos que ya existen.
   */

  existingProducts.forEach(
    product => {

      finalBySku.set(
        product.sapCode,
        product
      );

    }
  );


  let created = 0;

  let updated = 0;

  let skipped = 0;


  previewRows.forEach(
    row => {

      if (
        !row.sku
        ||
        !row.description
      ) {

        skipped++;

        return;

      }


      const existing =
        existingBySku.get(
          row.sku
        );


      const id =
        existing
          ? existing.id
          : nextId++;


      if (
        existing
      ) {

        updated++;

      } else {

        created++;

      }


      const product: Product = {

        id,

        sapCode:
          row.sku,

        description:
          row.description,

        diameter:
          row.diameter,

        thickness:
          row.thickness,

        flow:
          row.flow,

        spacing:
          row.spacing,

        dripper:
          row.dripper,

        /*
         * Si el SKU ya existía, su plantilla
         * permanece exactamente igual.
         */

        templateId:
          existing?.templateId ??
          row.existingTemplateId ??
          0

      };


      finalBySku.set(
        row.sku,
        product
      );

    }
  );


  const products =
    Array.from(
      finalBySku.values()
    );


  products.sort(
    (
      a,
      b
    ) =>
      a.sapCode.localeCompare(
        b.sapCode,
        undefined,
        {
          numeric: true
        }
      )
  );


  return {

    products,

    totalRows:
      previewRows.length,

    imported:
      created +
      updated,

    created,

    updated,

    skipped

  };

}


/*
 * ==================================================
 * IMPORTACIÓN DIRECTA
 *
 * Se mantiene por compatibilidad con el
 * Products.tsx actual hasta que cambiemos
 * la pantalla en el siguiente paso.
 * ==================================================
 */

export async function importSapProducts(
  file: File,
  existingProducts: Product[]
): Promise<SapImportResult> {

  const preview =
    await previewSapProducts(
      file,
      existingProducts
    );


  return confirmSapProducts(
    preview.rows,
    existingProducts
  );

}