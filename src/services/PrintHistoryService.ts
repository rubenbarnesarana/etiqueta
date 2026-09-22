import {
  supabase
} from "./Supabase";


export type PrintType =
  | "PRINT"
  | "REPRINT";


export interface PrintHistoryRecord {

  id?: number;

  printed_at?: string;

  username: string;

  production_order: string;

  sku: string;

  description?: string;

  lot?: string;

  coil_number?: number;

  quantity?: number;

  printer?: string;

  template_id?: number;

  template_name?: string;

  print_type?: PrintType;

  production_line?: number;

  created_at?: string;

}


export interface CreatePrintHistoryRecord {

  username: string;

  productionOrder: string;

  sku: string;

  description?: string;

  lot?: string;

  coilNumber?: number;

  quantity?: number;

  printer?: string;

  templateId?: number;

  templateName?: string;

  printType?: PrintType;

  productionLine?: number;

}


/*
 * ==================================================
 * REGISTRAR IMPRESIÓN
 * ==================================================
 */

export async function registerPrint(
  data: CreatePrintHistoryRecord
): Promise<PrintHistoryRecord> {

  const record = {

    username:
      data.username.trim(),

    production_order:
      data.productionOrder.trim(),

    sku:
      data.sku.trim(),

    description:
      data.description?.trim() ||
      null,

    lot:
      data.lot?.trim() ||
      null,

    coil_number:
      data.coilNumber ??
      null,

    quantity:
      data.quantity ??
      1,

    printer:
      data.printer?.trim() ||
      null,

    template_id:
      data.templateId ??
      null,

    template_name:
      data.templateName?.trim() ||
      null,

    print_type:
      data.printType ??
      "PRINT",

    production_line:
      data.productionLine ??
      null

  };


  const {
    data: insertedData,
    error
  } = await supabase
    .from("print_history")
    .insert(record)
    .select()
    .single();


  if (
    error
  ) {

    console.error(
      "Error registrando impresión:",
      error
    );

    throw new Error(
      `No se pudo registrar la impresión: ${error.message}`
    );

  }


  return insertedData as PrintHistoryRecord;

}


/*
 * ==================================================
 * OBTENER HISTORIAL
 * ==================================================
 */

export async function getPrintHistory(
  limit = 1000
): Promise<PrintHistoryRecord[]> {

  const {
    data,
    error
  } = await supabase
    .from("print_history")
    .select("*")
    .order(
      "printed_at",
      {
        ascending: false
      }
    )
    .limit(limit);


  if (
    error
  ) {

    console.error(
      "Error cargando historial:",
      error
    );

    throw new Error(
      `No se pudo cargar el historial: ${error.message}`
    );

  }


  return (
    data ??
    []
  ) as PrintHistoryRecord[];

}


/*
 * ==================================================
 * HISTORIAL POR ORDEN
 * ==================================================
 */

export async function getPrintHistoryByOrder(
  productionOrder: string
): Promise<PrintHistoryRecord[]> {

  const {
    data,
    error
  } = await supabase
    .from("print_history")
    .select("*")
    .eq(
      "production_order",
      productionOrder.trim()
    )
    .order(
      "printed_at",
      {
        ascending: false
      }
    );


  if (
    error
  ) {

    console.error(
      "Error cargando historial de la orden:",
      error
    );

    throw new Error(
      `No se pudo cargar el historial de la orden: ${error.message}`
    );

  }


  return (
    data ??
    []
  ) as PrintHistoryRecord[];

}


/*
 * ==================================================
 * HISTORIAL POR SKU
 * ==================================================
 */

export async function getPrintHistoryBySku(
  sku: string
): Promise<PrintHistoryRecord[]> {

  const {
    data,
    error
  } = await supabase
    .from("print_history")
    .select("*")
    .eq(
      "sku",
      sku.trim()
    )
    .order(
      "printed_at",
      {
        ascending: false
      }
    );


  if (
    error
  ) {

    console.error(
      "Error cargando historial del SKU:",
      error
    );

    throw new Error(
      `No se pudo cargar el historial del SKU: ${error.message}`
    );

  }


  return (
    data ??
    []
  ) as PrintHistoryRecord[];

}


/*
 * ==================================================
 * BORRAR TODO EL HISTORIAL
 * ==================================================
 */

export async function deleteAllPrintHistory(): Promise<number> {

  /*
   * Pedimos los IDs eliminados para saber
   * exactamente cuántos registros se han borrado.
   */

  const {
    data,
    error
  } = await supabase
    .from("print_history")
    .delete()
    .gt(
      "id",
      0
    )
    .select("id");


  if (
    error
  ) {

    console.error(
      "Error borrando historial:",
      error
    );

    throw new Error(
      `No se pudo borrar el historial: ${error.message}`
    );

  }


  return (
    data ??
    []
  ).length;

}