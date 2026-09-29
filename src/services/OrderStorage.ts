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
 *
 * Las operaciones se ejecutan una detrás de otra.
 *
 * Esto evita que, por ejemplo:
 *
 * - mover varias órdenes rápidamente
 * - imprimir varias etiquetas
 * - cambiar una orden de línea
 *
 * pueda provocar que una petición antigua termine
 * después de una nueva y sobrescriba el estado final.
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

    rolls:
      Number(
        order.rolls ??
        0
      ),

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
      planningPosition > 0
        ? planningPosition
        : 0,

    status:
      order.status ===
        "FINALIZADA"
        ? "FINALIZADA"
        : "ABIERTA",

    printed:
      Number(
        order.printed ??
        0
      )

  };

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
 *
 * 1. Guarda inmediatamente en localStorage.
 * 2. Envía una copia a Supabase.
 *
 * La aplicación sigue siendo síncrona localmente,
 * por lo que no rompemos Producción, Planificación
 * ni Impresión.
 * ==================================================
 */

export function saveOrders(
  orders: ProductionOrder[]
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      orders
    )
  );


  /*
   * Creamos una copia independiente.
   *
   * Así una modificación posterior del array
   * no puede alterar una operación que esté
   * esperando en la cola.
   */
  const snapshot =
    orders.map(
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

  const orders =
    getOrders();


  const normalized =
    normalizeOrder(
      order
    );


  /*
   * Si tiene línea pero todavía no tiene posición,
   * la colocamos al final de esa línea.
   */
  if (
    normalized.productionLine >= 1 &&
    normalized.productionLine <= 8 &&
    normalized.planningPosition <= 0
  ) {

    const ordersInLine =
      orders.filter(
        item =>
          item.productionLine ===
          normalized.productionLine
      );


    const maxPosition =
      ordersInLine.reduce(
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


  orders.push(
    normalized
  );


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


  /*
   * Detectamos si la orden cambia de línea.
   */
  const changedLine =
    previousOrder &&
    previousOrder.productionLine !==
      normalized.productionLine;


  /*
   * Si se asigna por primera vez o cambia
   * de línea, se coloca al final.
   */
  if (
    normalized.productionLine >= 1 &&
    normalized.productionLine <= 8 &&
    (
      normalized.planningPosition <= 0 ||
      changedLine
    )
  ) {

    const ordersInNewLine =
      currentOrders.filter(
        item =>
          Number(
            item.id
          ) !==
            Number(
              normalized.id
            ) &&
          item.productionLine ===
            normalized.productionLine
      );


    const maxPosition =
      ordersInNewLine.reduce(
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


  /*
   * Si queda sin línea, queda también
   * sin posición.
   */
  if (
    normalized.productionLine ===
    0
  ) {

    normalized.planningPosition =
      0;

  }


  const orders =
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


  saveOrders(
    orders
  );


  /*
   * Si cambió de línea, reorganizamos
   * la línea anterior.
   */
  if (
    previousOrder &&
    changedLine &&
    previousOrder.productionLine >= 1
  ) {

    normalizePlanningPositions(
      previousOrder.productionLine
    );

  }


  /*
   * Reorganizamos la nueva línea.
   */
  if (
    normalized.productionLine >= 1
  ) {

    normalizePlanningPositions(
      normalized.productionLine
    );

  }

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


  const filtered =
    orders.filter(
      order =>
        Number(
          order.id
        ) !==
        Number(
          id
        )
    );


  /*
   * Primero actualizamos almacenamiento local
   * y el resto de órdenes en Supabase.
   */
  saveOrders(
    filtered
  );


  /*
   * Al borrar una orden reorganizamos
   * su antigua línea.
   */
  if (
    orderToDelete &&
    orderToDelete.productionLine >= 1
  ) {

    normalizePlanningPositions(
      orderToDelete.productionLine
    );

  }


  /*
   * La eliminación se añade al final de la cola.
   *
   * Así garantizamos que cualquier guardado
   * anterior termina antes de borrar la fila.
   */
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

        if (
          a.planningPosition !==
          b.planningPosition
        ) {

          return (
            a.planningPosition -
            b.planningPosition
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


  /*
   * Guardamos el índice original para mantener
   * un desempate estable cuando existen
   * posiciones duplicadas.
   */
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
          productionLine
      )
      .sort(
        (
          a,
          b
        ) => {

          if (
            a.order.planningPosition !==
            b.order.planningPosition
          ) {

            return (
              a.order.planningPosition -
              b.order.planningPosition
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


  lineOrders.forEach(
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


  const updated =
    orders.map(
      order => {

        if (
          order.productionLine !==
          productionLine
        ) {

          return order;

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


  const updated =
    orders.map(
      order => {

        if (
          order.productionLine !==
          productionLine
        ) {

          return order;

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
    target.productionLine < 1 ||
    target.productionLine > 8
  ) {

    return;

  }


  /*
   * Obtenemos las órdenes exactamente
   * en el mismo orden visual.
   */
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
          target.productionLine
      )
      .sort(
        (
          a,
          b
        ) => {

          if (
            a.order.planningPosition !==
            b.order.planningPosition
          ) {

            return (
              a.order.planningPosition -
              b.order.planningPosition
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
      ? currentIndex - 1
      : currentIndex + 1;


  /*
   * No hacemos nada si intenta subir la primera
   * o bajar la última.
   */
  if (
    newIndex < 0 ||
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


  const updated =
    orders.map(
      order => {

        if (
          order.productionLine !==
          target.productionLine
        ) {

          return order;

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


  saveOrders(
    updated
  );

}