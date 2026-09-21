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
   * de la línea de producción.
   *
   * 1 = Primera orden
   * 2 = Segunda orden
   * 3 = Tercera orden
   * ...
   *
   * 0 = Sin planificar
   */
  planningPosition: number;

  /*
   * Estado
   */
  status:
    | "ABIERTA"
    | "FINALIZADA";

  /*
   * Número de etiquetas
   * ya impresas
   */
  printed: number;
}


const STORAGE_KEY =
  "productionOrders";


/*
 * ==================================================
 * NORMALIZAR ORDEN
 * ==================================================
 *
 * Permite seguir utilizando órdenes antiguas
 * creadas antes de incorporar:
 *
 * - Lot Number
 * - Línea de producción
 * - Posición de planificación
 *
 * ==================================================
 */

function normalizeOrder(
  order: any
): ProductionOrder {

  const productionLine =
    Number(
      order.productionLine ?? 0
    );


  const planningPosition =
    Number(
      order.planningPosition ?? 0
    );


  return {

    id:
      Number(
        order.id
      ),

    order:
      String(
        order.order ?? ""
      ),

    lot:
      String(
        order.lot ?? ""
      ),

    sku:
      String(
        order.sku ?? ""
      ),

    product:
      String(
        order.product ?? ""
      ),

    templateId:
      Number(
        order.templateId ?? 0
      ),

    rolls:
      Number(
        order.rolls ?? 0
      ),

    firstCoil:
      Number(
        order.firstCoil ?? 1
      ),

    printer:
      String(
        order.printer ??
        "BA420"
      ),

    /*
     * Solo permitimos líneas 1 - 8.
     *
     * Las órdenes antiguas quedarán
     * temporalmente como línea 0.
     */

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
        order.printed ?? 0
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


  if (!data) {

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

  } catch {

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

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      orders
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
   * Si tiene línea asignada pero todavía
   * no tiene posición, la añadimos al final
   * de la planificación de esa línea.
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
   * Si estamos asignando por primera vez
   * una línea o hemos cambiado la orden
   * a otra línea, la colocamos al final
   * de la nueva línea.
   */

  const changedLine =
    previousOrder &&
    previousOrder.productionLine !==
    normalized.productionLine;


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
   * Si quitamos la línea, también
   * quitamos su posición.
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
   * Si la orden cambió de línea,
   * reorganizamos la línea anterior
   * para que no queden huecos.
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
   * Reorganizamos también la nueva línea.
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


  saveOrders(
    filtered
  );


  /*
   * Al borrar una orden reorganizamos
   * las posiciones de su línea.
   */

  if (
    orderToDelete &&
    orderToDelete.productionLine >= 1
  ) {

    normalizePlanningPositions(
      orderToDelete.productionLine
    );

  }

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

        /*
         * Las órdenes sin posición quedan
         * siempre al final.
         */

        const positionA =
          a.planningPosition > 0
            ? a.planningPosition
            : Number.MAX_SAFE_INTEGER;


        const positionB =
          b.planningPosition > 0
            ? b.planningPosition
            : Number.MAX_SAFE_INTEGER;


        return (
          positionA -
          positionB
        );

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
 * NORMALIZAR POSICIONES DE UNA LÍNEA
 * ==================================================
 *
 * Ejemplo:
 *
 * Antes:
 *
 * 1
 * 3
 * 7
 *
 * Después:
 *
 * 1
 * 2
 * 3
 *
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


  const lineOrders =
    orders
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

          const positionA =
            a.planningPosition > 0
              ? a.planningPosition
              : Number.MAX_SAFE_INTEGER;


          const positionB =
            b.planningPosition > 0
              ? b.planningPosition
              : Number.MAX_SAFE_INTEGER;


          if (
            positionA ===
            positionB
          ) {

            return (
              Number(
                a.id
              ) -
              Number(
                b.id
              )
            );

          }


          return (
            positionA -
            positionB
          );

        }
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


        return {

          ...order,

          planningPosition:
            positions.get(
              Number(
                order.id
              )
            ) ??
            order.planningPosition

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
 *
 * Recibe los IDs exactamente en el orden
 * en que queremos fabricar.
 *
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


  normalizePlanningPositions(
    productionLine
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
    target.productionLine < 1
  ) {

    return;

  }


  const lineOrders =
    getOrdersByLine(
      target.productionLine
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


  if (
    newIndex < 0 ||
    newIndex >=
      lineOrders.length
  ) {

    return;

  }


  const reordered =
    [
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


  reorderProductionLine(
    target.productionLine,
    reordered.map(
      order =>
        order.id
    )
  );

}