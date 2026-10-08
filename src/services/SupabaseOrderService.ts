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
  comments: string;

  marking: string;
  sales_order: string;
  quantity: number;
  quantity_unit:
    | "M"
    | "UN";

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
 * RESULTADO REAPERTURA
 * ==================================================
 */

interface ReopenProductionOrderRow {
  id: number;
  order_number: string;
  rolls: number;
  printed: number;
  status: string;
  production_line: number;
  planning_position: number;
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


/*
 * ==================================================
 * CAMPOS ORDEN
 * ==================================================
 */

const ORDER_SELECT_FIELDS = `
  id,
  order_number,
  lot,
  customer,
  comments,
  marking,
  sales_order,
  quantity,
  quantity_unit,
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
`;


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

    comments:
      row.comments ??
      "",

    marking:
      row.marking ??
      "",

    salesOrder:
      row.sales_order ??
      "",

    quantity:
      Number(
        row.quantity ??
        0
      ),

    quantityUnit:
      row.quantity_unit ===
        "UN"
        ? "UN"
        : "M",

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
): ProductionOrderRow {

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

    comments:
      order.comments ??
      "",

    marking:
      order.marking ??
      "",

    sales_order:
      order.salesOrder ??
      "",

    quantity:
      order.quantity ??
      0,

    quantity_unit:
      order.quantityUnit ===
        "UN"
        ? "UN"
        : "M",

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
 * VERIFICAR ORDEN GUARDADA
 * ==================================================
 */

function verifySavedOrder(
  expected: ProductionOrderRow,
  saved: ProductionOrderRow
) {

  const expectedStatus =
    normalizeStatus(
      expected.status
    );


  const savedStatus =
    normalizeStatus(
      saved.status
    );


  const expectedPrinted =
    Number(
      expected.printed ??
      0
    );


  const savedPrinted =
    Number(
      saved.printed ??
      0
    );


  if (
    expectedStatus !==
      savedStatus ||
    expectedPrinted !==
      savedPrinted
  ) {

    throw new Error(
      [
        `Supabase no guardó correctamente la orden ${expected.order_number}.`,
        `Esperado: status=${expectedStatus}, printed=${expectedPrinted}.`,
        `Guardado: status=${savedStatus}, printed=${savedPrinted}.`
      ].join(
        " "
      )
    );
  }
}


/*
 * ==================================================
 * OBTENER UNA ORDEN DESDE SUPABASE
 * ==================================================
 */

async function getSupabaseOrder(
  orderNumber: string
):
  Promise<ProductionOrderRow | null> {

  const {
    data,
    error
  } =
    await supabase
      .from(
        "production_orders"
      )
      .select(
        ORDER_SELECT_FIELDS
      )
      .eq(
        "order_number",
        orderNumber
      )
      .maybeSingle();


  if (
    error
  ) {

    console.error(
      `Error obteniendo la orden ${orderNumber}:`,
      error
    );


    throw error;
  }


  return (
    data as
      ProductionOrderRow |
      null
  );
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
          ORDER_SELECT_FIELDS
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
 * REABRIR / REDUCIR CONTADOR
 * ==================================================
 */

async function reopenSupabaseOrder(
  orderNumber: string,
  printed: number
): Promise<void> {

  console.log(
    `[ORDEN ${orderNumber}] Reabriendo mediante RPC. Nuevo contador: ${printed}`
  );


  const {
    data,
    error
  } =
    await supabase.rpc(
      "reopen_production_order",
      {
        p_order_number:
          orderNumber,

        p_printed:
          printed
      }
    );


  if (
    error
  ) {

    console.error(
      `Error reabriendo la orden ${orderNumber}:`,
      error
    );


    throw error;
  }


  const rows =
    (
      data ??
      []
    ) as ReopenProductionOrderRow[];


  const row =
    rows[0];


  if (
    !row
  ) {

    throw new Error(
      `Supabase no devolvió ningún resultado al reabrir la orden ${orderNumber}.`
    );
  }


  console.log(
    `[ORDEN ${orderNumber}] Resultado reapertura:`,
    row
  );


  if (
    Number(
      row.printed
    ) !==
    Number(
      printed
    )
  ) {

    throw new Error(
      `No se pudo modificar el contador de la orden ${orderNumber}. Esperado=${printed}, Guardado=${row.printed}.`
    );
  }
}


/*
 * ==================================================
 * GUARDAR UNA ORDEN
 * ==================================================
 */

export async function saveSupabaseOrder(
  order: ProductionOrder
): Promise<void> {

  const expectedRow =
    mapOrderToRow(
      order
    );


  /*
   * ==================================================
   * 1. COMPROBAR ESTADO ACTUAL
   * ==================================================
   */

  const existingOrder =
    await getSupabaseOrder(
      expectedRow.order_number
    );


  /*
   * ==================================================
   * 2. ORDEN NUEVA
   * ==================================================
   */

  if (
    !existingOrder
  ) {

    const {
      data,
      error
    } =
      await supabase
        .from(
          "production_orders"
        )
        .insert(
          expectedRow
        )
        .select(
          ORDER_SELECT_FIELDS
        );


    if (
      error
    ) {

      console.error(
        `Error insertando la orden ${expectedRow.order_number}:`,
        error
      );


      throw error;
    }


    const rows =
      (
        data ??
        []
      ) as ProductionOrderRow[];


    const saved =
      rows[0];


    if (
      !saved
    ) {

      throw new Error(
        `Supabase no devolvió la nueva orden ${expectedRow.order_number}.`
      );
    }


    verifySavedOrder(
      expectedRow,
      saved
    );


    return;
  }


  /*
   * ==================================================
   * 3. DETECTAR SI ESTAMOS REDUCIENDO IMPRESIONES
   * ==================================================
   */

  const currentPrinted =
    Number(
      existingOrder.printed ??
      0
    );


  const newPrinted =
    Number(
      expectedRow.printed ??
      0
    );


  const isPrintedDecrease =
    newPrinted <
    currentPrinted;


  if (
    isPrintedDecrease
  ) {

    await reopenSupabaseOrder(
      expectedRow.order_number,
      newPrinted
    );


    /*
     * Después de la reapertura volvemos a leer
     * la orden para obtener estado real.
     */

    const reopenedOrder =
      await getSupabaseOrder(
        expectedRow.order_number
      );


    if (
      !reopenedOrder
    ) {

      throw new Error(
        `No se pudo recuperar la orden ${expectedRow.order_number} después de reabrirla.`
      );
    }


    /*
     * Actualizamos el resto de metadatos.
     *
     * NO tocamos:
     *
     * - printed
     * - status
     * - planning_position
     */

    const {
      data:
        updatedMetadata,

      error:
        metadataError
    } =
      await supabase
        .from(
          "production_orders"
        )
        .update({
          lot:
            expectedRow.lot,

          customer:
            expectedRow.customer,

          comments:
            expectedRow.comments,

          marking:
            expectedRow.marking,

          sales_order:
            expectedRow.sales_order,

          quantity:
            expectedRow.quantity,

          quantity_unit:
            expectedRow.quantity_unit,

          sku:
            expectedRow.sku,

          product:
            expectedRow.product,

          template_id:
            expectedRow.template_id,

          rolls:
            expectedRow.rolls,

          first_coil:
            expectedRow.first_coil,

          printer:
            expectedRow.printer,

          production_line:
            expectedRow.production_line
        })
        .eq(
          "order_number",
          expectedRow.order_number
        )
        .select(
          ORDER_SELECT_FIELDS
        );


    if (
      metadataError
    ) {

      console.error(
        `Error actualizando datos de la orden ${expectedRow.order_number}:`,
        metadataError
      );


      throw metadataError;
    }


    const metadataRows =
      (
        updatedMetadata ??
        []
      ) as ProductionOrderRow[];


    const finalSavedOrder =
      metadataRows[0];


    if (
      !finalSavedOrder
    ) {

      throw new Error(
        `Supabase no devolvió la orden ${expectedRow.order_number} después de actualizar sus datos.`
      );
    }


    if (
      Number(
        finalSavedOrder.printed
      ) !==
      newPrinted
    ) {

      throw new Error(
        `La reapertura de la orden ${expectedRow.order_number} no conservó el contador correcto.`
      );
    }


    const expectedStatus:
      "ABIERTA" |
      "FINALIZADA" =

      newPrinted <
      Number(
        expectedRow.rolls
      )
        ? "ABIERTA"
        : "FINALIZADA";


    if (
      normalizeStatus(
        finalSavedOrder.status
      ) !==
      expectedStatus
    ) {

      throw new Error(
        `La reapertura de la orden ${expectedRow.order_number} no conservó el estado correcto.`
      );
    }


    console.log(
      `[ORDEN ${expectedRow.order_number}] Reapertura guardada correctamente:`,
      finalSavedOrder
    );


    return;
  }


  /*
   * ==================================================
   * 4. ACTUALIZACIÓN NORMAL
   * ==================================================
   */

  const updateData = {
    lot:
      expectedRow.lot,

    customer:
      expectedRow.customer,

    comments:
      expectedRow.comments,

    marking:
      expectedRow.marking,

    sales_order:
      expectedRow.sales_order,

    quantity:
      expectedRow.quantity,

    quantity_unit:
      expectedRow.quantity_unit,

    sku:
      expectedRow.sku,

    product:
      expectedRow.product,

    template_id:
      expectedRow.template_id,

    rolls:
      expectedRow.rolls,

    first_coil:
      expectedRow.first_coil,

    printer:
      expectedRow.printer,

    production_line:
      expectedRow.production_line,

    planning_position:
      expectedRow.planning_position,

    status:
      expectedRow.status,

    printed:
      expectedRow.printed
  };


  const {
    data,
    error
  } =
    await supabase
      .from(
        "production_orders"
      )
      .update(
        updateData
      )
      .eq(
        "order_number",
        expectedRow.order_number
      )
      .select(
        ORDER_SELECT_FIELDS
      );


  if (
    error
  ) {

    console.error(
      `Error actualizando la orden ${expectedRow.order_number}:`,
      error
    );


    throw error;
  }


  const rows =
    (
      data ??
      []
    ) as ProductionOrderRow[];


  const saved =
    rows[0];


  if (
    !saved
  ) {

    throw new Error(
      `Supabase no actualizó la orden ${expectedRow.order_number}.`
    );
  }


  verifySavedOrder(
    expectedRow,
    saved
  );
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


  for (
    const order
    of orders
  ) {

    await saveSupabaseOrder(
      order
    );
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
 * REORDENAR PLANIFICACIÓN AL FINALIZAR
 * ==================================================
 */

async function reorderPlanningAfterFinishedOrder(
  orderNumber: string
): Promise<void> {

  const {
    data:
      finishedOrder,

    error:
      finishedOrderError
  } =
    await supabase
      .from(
        "production_orders"
      )
      .select(
        `
          id,
          order_number,
          production_line,
          planning_position,
          status
        `
      )
      .eq(
        "order_number",
        orderNumber
      )
      .maybeSingle();


  if (
    finishedOrderError
  ) {

    console.error(
      "Error obteniendo la orden finalizada para reordenar:",
      finishedOrderError
    );


    return;
  }


  if (
    !finishedOrder
  ) {

    return;
  }


  if (
    finishedOrder.status !==
    "FINALIZADA"
  ) {

    return;
  }


  const productionLine =
    Number(
      finishedOrder.production_line ??
      0
    );


  const finishedPosition =
    Number(
      finishedOrder.planning_position ??
      0
    );


  if (
    productionLine <=
      0 ||
    finishedPosition <=
      0
  ) {

    return;
  }


  const {
    error:
      finishedPositionError
  } =
    await supabase
      .from(
        "production_orders"
      )
      .update({
        planning_position:
          0
      })
      .eq(
        "order_number",
        orderNumber
      );


  if (
    finishedPositionError
  ) {

    console.error(
      "Error retirando la orden finalizada de la planificación:",
      finishedPositionError
    );


    return;
  }


  const {
    data:
      followingOrders,

    error:
      followingOrdersError
  } =
    await supabase
      .from(
        "production_orders"
      )
      .select(
        `
          id,
          order_number,
          planning_position
        `
      )
      .eq(
        "production_line",
        productionLine
      )
      .eq(
        "status",
        "ABIERTA"
      )
      .gt(
        "planning_position",
        finishedPosition
      )
      .order(
        "planning_position",
        {
          ascending:
            true
        }
      );


  if (
    followingOrdersError
  ) {

    console.error(
      "Error obteniendo las órdenes posteriores:",
      followingOrdersError
    );


    return;
  }


  const ordersToMove =
    followingOrders ??
    [];


  for (
    const followingOrder
    of ordersToMove
  ) {

    const currentPosition =
      Number(
        followingOrder.planning_position ??
        0
      );


    if (
      currentPosition <=
      0
    ) {

      continue;
    }


    const {
      error:
        moveError
    } =
      await supabase
        .from(
          "production_orders"
        )
        .update({
          planning_position:
            currentPosition -
            1
        })
        .eq(
          "id",
          followingOrder.id
        );


    if (
      moveError
    ) {

      console.error(
        `Error moviendo la orden ${followingOrder.order_number} a la posición ${currentPosition - 1}:`,
        moveError
      );


      return;
    }
  }
}


/*
 * ==================================================
 * RESERVAR IMPRESIÓN
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


  const result:
    OrderPrintCommitResult = {

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


  if (
    result.success &&
    result.finished
  ) {

    try {

      await reorderPlanningAfterFinishedOrder(
        orderNumber
      );

    }
    catch (
      reorderError
    ) {

      console.error(
        "La orden terminó correctamente, pero hubo un problema al reordenar la planificación:",
        reorderError
      );
    }
  }


  return result;
}


/*
 * ==================================================
 * LIBERAR RESERVA DE IMPRESIÓN
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