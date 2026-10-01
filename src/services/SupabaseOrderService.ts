import {
  supabase
} from "./Supabase";

import type {
  ProductionOrder
} from "./OrderStorage";


interface ProductionOrderRow {

  id: number;

  order_number: string;

  lot: string;

  customer: string;

  sku: string;

  product: string;

  template_id: number;

  rolls: number;

  first_coil: number;

  printer: string;

  production_line: number;

  planning_position: number;

  status:
    | "ABIERTA"
    | "FINALIZADA";

  printed: number;

}


/*
 * ==================================================
 * RESULTADO RESERVA DE IMPRESIÓN
 * ==================================================
 */

interface OrderPrintLockRow {

  success: boolean;

  message: string;

  coil_number: number;

  printed: number;

  rolls: number;

  status: string;

}


export interface OrderPrintLockResult {

  success: boolean;

  message: string;

  coilNumber: number;

  printed: number;

  rolls: number;

  status:
    | "ABIERTA"
    | "FINALIZADA";

}


/*
 * ==================================================
 * RESULTADO CONFIRMACIÓN DE IMPRESIÓN
 * ==================================================
 */

interface OrderPrintCommitRow {

  success: boolean;

  message: string;

  coil_number: number;

  printed: number;

  rolls: number;

  status: string;

  finished: boolean;

}


export interface OrderPrintCommitResult {

  success: boolean;

  message: string;

  coilNumber: number;

  printed: number;

  rolls: number;

  status:
    | "ABIERTA"
    | "FINALIZADA";

  finished: boolean;

}


/*
 * ==================================================
 * CONFIGURACIÓN
 * ==================================================
 */

const READ_BATCH_SIZE =
  1000;

const WRITE_BATCH_SIZE =
  500;


/*
 * ==================================================
 * SUPABASE -> PRODUCTION ORDER
 * ==================================================
 */

function mapRowToOrder(
  row: ProductionOrderRow
): ProductionOrder {

  return {

    id:
      Number(
        row.id
      ),

    order:
      row.order_number ??
      "",

    lot:
      row.lot ??
      "",

    customer:
      row.customer ??
      "",

    sku:
      row.sku ??
      "",

    product:
      row.product ??
      "",

    templateId:
      Number(
        row.template_id ??
        0
      ),

    rolls:
      Number(
        row.rolls ??
        0
      ),

    firstCoil:
      Number(
        row.first_coil ??
        1
      ),

    printer:
      row.printer ??
      "BA420",

    productionLine:
      Number(
        row.production_line ??
        0
      ),

    planningPosition:
      Number(
        row.planning_position ??
        0
      ),

    status:
      row.status ===
        "FINALIZADA"
        ? "FINALIZADA"
        : "ABIERTA",

    printed:
      Number(
        row.printed ??
        0
      )

  };

}


/*
 * ==================================================
 * PRODUCTION ORDER -> SUPABASE
 * ==================================================
 */

function mapOrderToRow(
  order: ProductionOrder
) {

  return {

    id:
      order.id,

    order_number:
      order.order,

    lot:
      order.lot ??
      "",

    customer:
      order.customer ??
      "",

    sku:
      order.sku ??
      "",

    product:
      order.product ??
      "",

    template_id:
      order.templateId ??
      0,

    rolls:
      order.rolls ??
      0,

    first_coil:
      order.firstCoil ??
      1,

    printer:
      order.printer ??
      "BA420",

    production_line:
      order.productionLine ??
      0,

    planning_position:
      order.planningPosition ??
      0,

    status:
      order.status ===
        "FINALIZADA"
        ? "FINALIZADA"
        : "ABIERTA",

    printed:
      order.printed ??
      0

  };

}


/*
 * ==================================================
 * NORMALIZAR ESTADO
 * ==================================================
 */

function normalizeStatus(
  status: string
):
  | "ABIERTA"
  | "FINALIZADA" {

  return status ===
    "FINALIZADA"
    ? "FINALIZADA"
    : "ABIERTA";

}


/*
 * ==================================================
 * OBTENER TODAS LAS ÓRDENES
 * ==================================================
 */

export async function getSupabaseOrders():
Promise<ProductionOrder[]> {

  const allRows:
    ProductionOrderRow[] = [];


  let from =
    0;


  while (
    true
  ) {

    const to =
      from +
      READ_BATCH_SIZE -
      1;


    const {
      data,
      error
    } =
      await supabase
        .from(
          "production_orders"
        )
        .select(
          `
            id,
            order_number,
            lot,
            customer,
            sku,
            product,
            template_id,
            rolls,
            first_coil,
            printer,
            production_line,
            planning_position,
            status,
            printed
          `
        )
        .order(
          "id",
          {
            ascending:
              true
          }
        )
        .range(
          from,
          to
        );


    if (
      error
    ) {

      console.error(
        "Error cargando órdenes desde Supabase:",
        error
      );

      throw error;

    }


    const rows =
      (
        data ??
        []
      ) as ProductionOrderRow[];


    allRows.push(
      ...rows
    );


    if (
      rows.length <
      READ_BATCH_SIZE
    ) {

      break;

    }


    from +=
      READ_BATCH_SIZE;

  }


  return allRows.map(
    row =>
      mapRowToOrder(
        row
      )
  );

}


/*
 * ==================================================
 * GUARDAR UNA ORDEN
 * ==================================================
 */

export async function saveSupabaseOrder(
  order: ProductionOrder
): Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "production_orders"
      )
      .upsert(
        mapOrderToRow(
          order
        ),
        {
          onConflict:
            "order_number"
        }
      );


  if (
    error
  ) {

    console.error(
      "Error guardando orden en Supabase:",
      error
    );

    throw error;

  }

}


/*
 * ==================================================
 * GUARDAR VARIAS ÓRDENES
 * ==================================================
 */

export async function saveSupabaseOrders(
  orders: ProductionOrder[]
): Promise<void> {

  if (
    orders.length ===
    0
  ) {

    return;

  }


  const rows =
    orders.map(
      order =>
        mapOrderToRow(
          order
        )
    );


  for (
    let index = 0;
    index < rows.length;
    index += WRITE_BATCH_SIZE
  ) {

    const batch =
      rows.slice(
        index,
        index +
        WRITE_BATCH_SIZE
      );


    const {
      error
    } =
      await supabase
        .from(
          "production_orders"
        )
        .upsert(
          batch,
          {
            onConflict:
              "order_number"
          }
        );


    if (
      error
    ) {

      console.error(
        "Error guardando órdenes en Supabase:",
        error
      );

      throw error;

    }

  }

}


/*
 * ==================================================
 * ELIMINAR ORDEN
 * ==================================================
 */

export async function deleteSupabaseOrder(
  id: number
): Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "production_orders"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {

    console.error(
      "Error eliminando orden de Supabase:",
      error
    );

    throw error;

  }

}


/*
 * ==================================================
 * RESERVAR IMPRESIÓN
 * ==================================================
 *
 * Reserva temporalmente la siguiente bobina
 * de una orden.
 *
 * Solamente un equipo puede tener la reserva
 * activa al mismo tiempo.
 *
 * NO incrementa el contador.
 *
 * ==================================================
 */

export async function acquireSupabaseOrderPrintLock(
  orderNumber: string,
  lockToken: string
): Promise<OrderPrintLockResult> {

  const {
    data,
    error
  } =
    await supabase.rpc(
      "acquire_order_print_lock",
      {

        p_order_number:
          orderNumber,

        p_lock_token:
          lockToken

      }
    );


  if (
    error
  ) {

    console.error(
      "Error reservando impresión de orden:",
      error
    );

    throw error;

  }


  const rows =
    (
      data ??
      []
    ) as OrderPrintLockRow[];


  const row =
    rows[0];


  if (
    !row
  ) {

    throw new Error(
      "Supabase no ha devuelto el resultado de la reserva de impresión."
    );

  }


  return {

    success:
      Boolean(
        row.success
      ),

    message:
      String(
        row.message ??
        ""
      ),

    coilNumber:
      Number(
        row.coil_number ??
        0
      ),

    printed:
      Number(
        row.printed ??
        0
      ),

    rolls:
      Number(
        row.rolls ??
        0
      ),

    status:
      normalizeStatus(
        row.status
      )

  };

}


/*
 * ==================================================
 * CONFIRMAR IMPRESIÓN
 * ==================================================
 *
 * Se ejecuta SOLAMENTE después de que QZ haya
 * confirmado correctamente la impresión física.
 *
 * Supabase:
 *
 * - comprueba que la reserva pertenece al equipo
 * - comprueba el número de bobina
 * - incrementa printed de forma atómica
 * - actualiza el estado
 * - libera el bloqueo
 *
 * ==================================================
 */

export async function commitSupabaseOrderPrint(
  orderNumber: string,
  lockToken: string,
  coilNumber: number
): Promise<OrderPrintCommitResult> {

  const {
    data,
    error
  } =
    await supabase.rpc(
      "commit_order_print",
      {

        p_order_number:
          orderNumber,

        p_lock_token:
          lockToken,

        p_coil_number:
          coilNumber

      }
    );


  if (
    error
  ) {

    console.error(
      "Error confirmando impresión de orden:",
      error
    );

    throw error;

  }


  const rows =
    (
      data ??
      []
    ) as OrderPrintCommitRow[];


  const row =
    rows[0];


  if (
    !row
  ) {

    throw new Error(
      "Supabase no ha devuelto el resultado de la confirmación de impresión."
    );

  }


  return {

    success:
      Boolean(
        row.success
      ),

    message:
      String(
        row.message ??
        ""
      ),

    coilNumber:
      Number(
        row.coil_number ??
        0
      ),

    printed:
      Number(
        row.printed ??
        0
      ),

    rolls:
      Number(
        row.rolls ??
        0
      ),

    status:
      normalizeStatus(
        row.status
      ),

    finished:
      Boolean(
        row.finished
      )

  };

}


/*
 * ==================================================
 * LIBERAR RESERVA DE IMPRESIÓN
 * ==================================================
 *
 * Se utiliza cuando:
 *
 * - falla QZ
 * - falla la generación de la imagen
 * - se produce cualquier error antes de confirmar
 *
 * NO modifica el contador.
 *
 * ==================================================
 */

export async function releaseSupabaseOrderPrintLock(
  orderNumber: string,
  lockToken: string
): Promise<boolean> {

  const {
    data,
    error
  } =
    await supabase.rpc(
      "release_order_print_lock",
      {

        p_order_number:
          orderNumber,

        p_lock_token:
          lockToken

      }
    );


  if (
    error
  ) {

    console.error(
      "Error liberando reserva de impresión:",
      error
    );

    throw error;

  }


  return Boolean(
    data
  );

}