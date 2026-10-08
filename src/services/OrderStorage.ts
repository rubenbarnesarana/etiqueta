import {
  deleteSupabaseOrder,
  saveSupabaseOrders
} from "./SupabaseOrderService";


export interface ProductionOrder {
  id: number;

  /*
   * Production Order
   */
  order: string;

  /*
   * Lot Number
   */
  lot: string;

  /*
   * Cliente
   */
  customer: string;

  /*
   * Comentarios de planificación
   */
  comments: string;

  /*
   * Marcaje de fabricación
   *
   * Ejemplos:
   * EXCEL_22_8
   * AMNON_16_1
   * MICRO25
   */
  marking: string;

  /*
   * Pedido de venta
   *
   * Ejemplo:
   * 405053377
   */
  salesOrder: string;

  /*
   * Cantidad de producto
   *
   * No confundir con rolls.
   *
   * quantity:
   * metros o unidades de producto.
   *
   * rolls:
   * número de bobinas / rollos / cajas
   * que deben etiquetarse.
   */
  quantity: number;

  /*
   * Unidad de la cantidad
   *
   * M  = metros
   * UN = unidades
   */
  quantityUnit:
    | "M"
    | "UN";

  /*
   * Producto
   */
  sku: string;
  product: string;

  /*
   * Plantilla
   */
  templateId: number;

  /*
   * Producción
   */
  rolls: number;

  /*
   * Primer Coil Number
   */
  firstCoil: number;

  /*
   * Impresora
   */
  printer: string;

  /*
   * Línea de producción
   *
   * 0 = Sin asignar
   * 1 - 8 = Línea asignada
   */
  productionLine: number;

  /*
   * Posición dentro de la planificación
   *
   * 0 = Sin planificar
   * 1, 2, 3... = Orden de fabricación
   */
  planningPosition: number;

  /*
   * Estado
   */
  status:
    | "ABIERTA"
    | "FINALIZADA";

  /*
   * Número de etiquetas ya impresas
   */
  printed: number;
}


const STORAGE_KEY =
  "productionOrders";


/*
 * ==================================================
 * COLA DE SINCRONIZACIÓN SUPABASE
 * ==================================================
 */

let supabaseQueue:
  Promise<void> =
  Promise.resolve();


function queueSupabaseOperation(
  operation: () => Promise<void>
) {
  supabaseQueue =
    supabaseQueue
      .then(
        operation
      )
      .catch(
        error => {
          console.error(
            "Error sincronizando órdenes con Supabase:",
            error
          );
        }
      );
}


/*
 * ==================================================
 * ESPERAR SINCRONIZACIÓN SUPABASE
 * ==================================================
 */

export async function waitForOrderSupabaseSync():
  Promise<void> {

  await supabaseQueue;
}


/*
 * ==================================================
 * NORMALIZAR ORDEN
 * ==================================================
 */

function normalizeOrder(
  order: any
): ProductionOrder {

  const productionLine =
    Number(
      order.productionLine ??
      0
    );


  const planningPosition =
    Number(
      order.planningPosition ??
      0
    );


  const rolls =
    Math.max(
      0,
      Number(
        order.rolls ??
        0
      )
    );


  const printed =
    Math.min(
      rolls,
      Math.max(
        0,
        Number(
          order.printed ??
          0
        )
      )
    );


  const quantity =
    Math.max(
      0,
      Number(
        order.quantity ??
        0
      )
    );


  const quantityUnit:
    "M" |
    "UN" =
    String(
      order.quantityUnit ??
      "M"
    ).toUpperCase() ===
    "UN"
      ? "UN"
      : "M";


  const status:
    "ABIERTA" |
    "FINALIZADA" =

    rolls > 0 &&
    printed >= rolls
      ? "FINALIZADA"
      : order.status ===
          "FINALIZADA"
        ? "FINALIZADA"
        : "ABIERTA";


  return {
    id:
      Number(
        order.id
      ),

    order:
      String(
        order.order ??
        ""
      ),

    lot:
      String(
        order.lot ??
        ""
      ),

    customer:
      String(
        order.customer ??
        ""
      ),

    comments:
      String(
        order.comments ??
        ""
      ),

    marking:
      String(
        order.marking ??
        ""
      ),

    salesOrder:
      String(
        order.salesOrder ??
        ""
      ),

    quantity,

    quantityUnit,

    sku:
      String(
        order.sku ??
        ""
      ),

    product:
      String(
        order.product ??
        ""
      ),

    templateId:
      Number(
        order.templateId ??
        0
      ),

    rolls,

    firstCoil:
      Number(
        order.firstCoil ??
        1
      ),

    printer:
      String(
        order.printer ??
        "BA420"
      ),

    productionLine:
      productionLine >= 1 &&
      productionLine <= 8
        ? productionLine
        : 0,

    planningPosition:
      status ===
      "FINALIZADA"
        ? 0
        : planningPosition > 0
          ? planningPosition
          : 0,

    status,

    printed
  };
}


/*
 * ==================================================
 * SABER SI UNA ORDEN ESTÁ ACTIVA
 * ==================================================
 */

function isActiveOrder(
  order: ProductionOrder
): boolean {

  return (
    order.status ===
      "ABIERTA" &&
    order.rolls -
      order.printed >
      0
  );
}


/*
 * ==================================================
 * NORMALIZAR POSICIONES EN MEMORIA
 * ==================================================
 */

function normalizeLinePositions(
  sourceOrders: ProductionOrder[],
  productionLine: number
): ProductionOrder[] {

  if (
    productionLine < 1 ||
    productionLine > 8
  ) {
    return sourceOrders;
  }


  const activeLineOrders =
    sourceOrders
      .map(
        (
          order,
          storageIndex
        ) => ({
          order,
          storageIndex
        })
      )
      .filter(
        item =>
          item.order.productionLine ===
            productionLine &&
          isActiveOrder(
            item.order
          )
      )
      .sort(
        (
          a,
          b
        ) => {
          const positionA =
            a.order.planningPosition >
            0
              ? a.order.planningPosition
              : Number.MAX_SAFE_INTEGER;


          const positionB =
            b.order.planningPosition >
            0
              ? b.order.planningPosition
              : Number.MAX_SAFE_INTEGER;


          if (
            positionA !==
            positionB
          ) {
            return (
              positionA -
              positionB
            );
          }


          return (
            a.storageIndex -
            b.storageIndex
          );
        }
      )
      .map(
        item =>
          item.order
      );


  const positions =
    new Map<
      number,
      number
    >();


  activeLineOrders.forEach(
    (
      order,
      index
    ) => {
      positions.set(
        Number(
          order.id
        ),
        index + 1
      );
    }
  );


  return sourceOrders.map(
    order => {
      if (
        order.productionLine !==
        productionLine
      ) {
        return order;
      }


      if (
        !isActiveOrder(
          order
        )
      ) {
        return {
          ...order,

          planningPosition:
            0
        };
      }


      return {
        ...order,

        planningPosition:
          positions.get(
            Number(
              order.id
            )
          ) ??
          0
      };
    }
  );
}


/*
 * ==================================================
 * LEER ÓRDENES
 * ==================================================
 */

export function getOrders():
  ProductionOrder[] {

  const data =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (
    !data
  ) {
    return [];
  }


  try {
    const orders =
      JSON.parse(
        data
      );


    if (
      !Array.isArray(
        orders
      )
    ) {
      return [];
    }


    return orders.map(
      normalizeOrder
    );
  }
  catch {
    return [];
  }
}


/*
 * ==================================================
 * GUARDAR ÓRDENES
 * ==================================================
 */

export function saveOrders(
  orders: ProductionOrder[]
) {

  const normalizedOrders =
    orders.map(
      normalizeOrder
    );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalizedOrders
    )
  );


  if (
    typeof window !==
    "undefined"
  ) {
    window.dispatchEvent(
      new Event(
        "productionOrdersUpdated"
      )
    );
  }


  const snapshot =
    normalizedOrders.map(
      order => ({
        ...order
      })
    );


  queueSupabaseOperation(
    () =>
      saveSupabaseOrders(
        snapshot
      )
  );
}


/*
 * ==================================================
 * AÑADIR ORDEN
 * ==================================================
 */

export function addOrder(
  order: ProductionOrder
) {

  let orders =
    getOrders();


  const normalized =
    normalizeOrder(
      order
    );


  if (
    !isActiveOrder(
      normalized
    )
  ) {
    normalized.planningPosition =
      0;
  }
  else if (
    normalized.productionLine >= 1 &&
    normalized.productionLine <= 8
  ) {

    if (
      normalized.planningPosition <=
      0
    ) {

      const activeOrdersInLine =
        orders.filter(
          item =>
            item.productionLine ===
              normalized.productionLine &&
            isActiveOrder(
              item
            )
        );


      const maxPosition =
        activeOrdersInLine.reduce(
          (
            max,
            item
          ) =>
            Math.max(
              max,
              item.planningPosition
            ),
          0
        );


      normalized.planningPosition =
        maxPosition +
        1;
    }
  }


  orders.push(
    normalized
  );


  if (
    normalized.productionLine >= 1
  ) {
    orders =
      normalizeLinePositions(
        orders,
        normalized.productionLine
      );
  }


  saveOrders(
    orders
  );
}


/*
 * ==================================================
 * BUSCAR ORDEN
 * ==================================================
 */

export function findOrder(
  orderNumber: string
) {

  return getOrders().find(
    order =>
      order.order ===
      orderNumber
  );
}


/*
 * ==================================================
 * ACTUALIZAR ORDEN
 * ==================================================
 */

export function updateOrder(
  order: ProductionOrder
) {

  const currentOrders =
    getOrders();


  const previousOrder =
    currentOrders.find(
      item =>
        Number(
          item.id
        ) ===
        Number(
          order.id
        )
    );


  const normalized =
    normalizeOrder(
      order
    );


  if (
    normalized.rolls >
    0 &&
    normalized.printed <
      normalized.rolls
  ) {
    normalized.status =
      "ABIERTA";
  }
  else if (
    normalized.rolls >
    0 &&
    normalized.printed >=
      normalized.rolls
  ) {
    normalized.status =
      "FINALIZADA";
  }


  const changedLine =
    Boolean(
      previousOrder &&
      previousOrder.productionLine !==
        normalized.productionLine
    );


  const reopened =
    Boolean(
      previousOrder &&
      previousOrder.status ===
        "FINALIZADA" &&
      normalized.status ===
        "ABIERTA"
    );


  if (
    reopened
  ) {
    normalized.planningPosition =
      0;
  }


  if (
    changedLine
  ) {
    normalized.planningPosition =
      0;
  }


  if (
    normalized.status ===
      "ABIERTA" &&
    normalized.productionLine >=
      1 &&
    normalized.productionLine <=
      8 &&
    normalized.planningPosition <=
      0
  ) {

    const activeOrdersInNewLine =
      currentOrders.filter(
        item =>
          Number(
            item.id
          ) !==
            Number(
              normalized.id
            ) &&
          item.productionLine ===
            normalized.productionLine &&
          isActiveOrder(
            item
          )
      );


    const maxPosition =
      activeOrdersInNewLine.reduce(
        (
          max,
          item
        ) =>
          Math.max(
            max,
            item.planningPosition
          ),
        0
      );


    normalized.planningPosition =
      maxPosition +
      1;
  }


  if (
    normalized.productionLine ===
    0
  ) {
    normalized.planningPosition =
      0;
  }


  if (
    normalized.status ===
    "FINALIZADA"
  ) {
    normalized.planningPosition =
      0;
  }


  let updatedOrders =
    currentOrders.map(
      item =>
        Number(
          item.id
        ) ===
        Number(
          normalized.id
        )
          ? normalized
          : item
    );


  if (
    previousOrder &&
    changedLine &&
    previousOrder.productionLine >=
      1 &&
    previousOrder.productionLine <=
      8
  ) {
    updatedOrders =
      normalizeLinePositions(
        updatedOrders,
        previousOrder.productionLine
      );
  }


  if (
    normalized.productionLine >=
      1 &&
    normalized.productionLine <=
      8
  ) {
    updatedOrders =
      normalizeLinePositions(
        updatedOrders,
        normalized.productionLine
      );
  }


  saveOrders(
    updatedOrders
  );
}


/*
 * ==================================================
 * ELIMINAR ORDEN
 * ==================================================
 */

export function deleteOrder(
  id: number
) {

  const orders =
    getOrders();


  const orderToDelete =
    orders.find(
      order =>
        Number(
          order.id
        ) ===
        Number(
          id
        )
    );


  let filtered =
    orders.filter(
      order =>
        Number(
          order.id
        ) !==
        Number(
          id
        )
    );


  if (
    orderToDelete &&
    orderToDelete.productionLine >=
      1 &&
    orderToDelete.productionLine <=
      8
  ) {
    filtered =
      normalizeLinePositions(
        filtered,
        orderToDelete.productionLine
      );
  }


  saveOrders(
    filtered
  );


  queueSupabaseOperation(
    () =>
      deleteSupabaseOrder(
        id
      )
  );
}


/*
 * ==================================================
 * OBTENER ÓRDENES DE UNA LÍNEA
 * ==================================================
 */

export function getOrdersByLine(
  productionLine: number
):
  ProductionOrder[] {

  return getOrders()
    .filter(
      order =>
        order.productionLine ===
        productionLine
    )
    .sort(
      (
        a,
        b
      ) => {
        const activeA =
          isActiveOrder(
            a
          );


        const activeB =
          isActiveOrder(
            b
          );


        if (
          activeA &&
          !activeB
        ) {
          return -1;
        }


        if (
          !activeA &&
          activeB
        ) {
          return 1;
        }


        const positionA =
          a.planningPosition >
          0
            ? a.planningPosition
            : Number.MAX_SAFE_INTEGER;


        const positionB =
          b.planningPosition >
          0
            ? b.planningPosition
            : Number.MAX_SAFE_INTEGER;


        if (
          positionA !==
          positionB
        ) {
          return (
            positionA -
            positionB
          );
        }


        return 0;
      }
    );
}


/*
 * ==================================================
 * OBTENER ÓRDENES SIN LÍNEA
 * ==================================================
 */

export function getUnassignedOrders():
  ProductionOrder[] {

  return getOrders()
    .filter(
      order =>
        order.productionLine ===
        0
    );
}


/*
 * ==================================================
 * PENDIENTES DE UNA ORDEN
 * ==================================================
 */

export function getPendingQuantity(
  order: ProductionOrder
): number {

  return Math.max(
    0,
    order.rolls -
      order.printed
  );
}


/*
 * ==================================================
 * NORMALIZAR POSICIONES
 * ==================================================
 */

export function normalizePlanningPositions(
  productionLine: number
) {

  if (
    productionLine < 1 ||
    productionLine > 8
  ) {
    return;
  }


  const orders =
    getOrders();


  const updated =
    normalizeLinePositions(
      orders,
      productionLine
    );


  saveOrders(
    updated
  );
}


/*
 * ==================================================
 * CAMBIAR ORDEN DE PLANIFICACIÓN
 * ==================================================
 */

export function reorderProductionLine(
  productionLine: number,
  orderedIds: number[]
) {

  if (
    productionLine < 1 ||
    productionLine > 8
  ) {
    return;
  }


  const orders =
    getOrders();


  const positions =
    new Map<
      number,
      number
    >();


  orderedIds.forEach(
    (
      id,
      index
    ) => {
      positions.set(
        Number(
          id
        ),
        index + 1
      );
    }
  );


  let updated =
    orders.map(
      order => {
        if (
          order.productionLine !==
          productionLine
        ) {
          return order;
        }


        if (
          !isActiveOrder(
            order
          )
        ) {
          return {
            ...order,

            planningPosition:
              0
          };
        }


        const newPosition =
          positions.get(
            Number(
              order.id
            )
          );


        if (
          newPosition ===
          undefined
        ) {
          return order;
        }


        return {
          ...order,

          planningPosition:
            newPosition
        };
      }
    );


  updated =
    normalizeLinePositions(
      updated,
      productionLine
    );


  saveOrders(
    updated
  );
}


/*
 * ==================================================
 * MOVER ORDEN DENTRO DE SU LÍNEA
 * ==================================================
 */

export function moveOrderInPlanning(
  orderId: number,
  direction:
    | "UP"
    | "DOWN"
) {

  const orders =
    getOrders();


  const target =
    orders.find(
      order =>
        Number(
          order.id
        ) ===
        Number(
          orderId
        )
    );


  if (
    !target ||
    target.productionLine <
      1 ||
    target.productionLine >
      8 ||
    !isActiveOrder(
      target
    )
  ) {
    return;
  }


  const lineOrders =
    orders
      .map(
        (
          order,
          storageIndex
        ) => ({
          order,
          storageIndex
        })
      )
      .filter(
        item =>
          item.order.productionLine ===
            target.productionLine &&
          isActiveOrder(
            item.order
          )
      )
      .sort(
        (
          a,
          b
        ) => {
          const positionA =
            a.order.planningPosition >
            0
              ? a.order.planningPosition
              : Number.MAX_SAFE_INTEGER;


          const positionB =
            b.order.planningPosition >
            0
              ? b.order.planningPosition
              : Number.MAX_SAFE_INTEGER;


          if (
            positionA !==
            positionB
          ) {
            return (
              positionA -
              positionB
            );
          }


          return (
            a.storageIndex -
            b.storageIndex
          );
        }
      )
      .map(
        item =>
          item.order
      );


  const currentIndex =
    lineOrders.findIndex(
      order =>
        Number(
          order.id
        ) ===
        Number(
          orderId
        )
    );


  if (
    currentIndex ===
    -1
  ) {
    return;
  }


  const newIndex =
    direction ===
    "UP"
      ? currentIndex -
        1
      : currentIndex +
        1;


  if (
    newIndex <
      0 ||
    newIndex >=
      lineOrders.length
  ) {
    return;
  }


  const reordered = [
    ...lineOrders
  ];


  const [
    moved
  ] =
    reordered.splice(
      currentIndex,
      1
    );


  reordered.splice(
    newIndex,
    0,
    moved
  );


  const positions =
    new Map<
      number,
      number
    >();


  reordered.forEach(
    (
      order,
      index
    ) => {
      positions.set(
        Number(
          order.id
        ),
        index + 1
      );
    }
  );


  let updated =
    orders.map(
      order => {
        if (
          order.productionLine !==
          target.productionLine
        ) {
          return order;
        }


        if (
          !isActiveOrder(
            order
          )
        ) {
          return {
            ...order,

            planningPosition:
              0
          };
        }


        const newPosition =
          positions.get(
            Number(
              order.id
            )
          );


        if (
          newPosition ===
          undefined
        ) {
          return order;
        }


        return {
          ...order,

          planningPosition:
            newPosition
        };
      }
    );


  updated =
    normalizeLinePositions(
      updated,
      target.productionLine
    );


  saveOrders(
    updated
  );
}