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
         * Utilizamos el mismo criterio que
         * la pantalla de Planificación.
         *
         * Las posiciones antiguas 0 aparecen
         * antes que 1, 2, 3...
         */

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
 * NORMALIZAR POSICIONES DE UNA LÍNEA
 * ==================================================
 *
 * Convierte cualquier planificación existente:
 *
 * 0, 1
 * 1, 1, 3
 * 2, 5, 9
 *
 * en:
 *
 * 1, 2, 3...
 *
 * respetando el orden visual actual.
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


  /*
   * Guardamos también el índice original
   * para tener un desempate estable cuando
   * existen posiciones duplicadas.
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

}


/*
 * ==================================================
 * MOVER ORDEN DENTRO DE SU LÍNEA
 * ==================================================
 *
 * La función trabaja exactamente con el mismo
 * orden que se muestra en Planificación.
 *
 * Después de cada movimiento reescribe TODAS
 * las posiciones de la línea:
 *
 * 1, 2, 3, 4...
 *
 * De esta forma también repara automáticamente:
 *
 * - posiciones 0 antiguas
 * - posiciones duplicadas
 * - huecos
 *
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
   * Obtenemos las órdenes de la línea
   * exactamente en el orden visual actual.
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


          /*
           * Si dos órdenes tienen la misma
           * planningPosition mantenemos el
           * orden en el que estaban guardadas.
           */

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


  /*
   * Localizamos la orden seleccionada.
   */

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


  /*
   * Calculamos la nueva posición.
   */

  const newIndex =
    direction ===
    "UP"
      ? currentIndex - 1
      : currentIndex + 1;


  /*
   * Si intentamos subir la primera
   * o bajar la última, no hacemos nada.
   */

  if (
    newIndex < 0 ||
    newIndex >=
      lineOrders.length
  ) {

    return;

  }


  /*
   * Copiamos el array y movemos físicamente
   * la orden a su nueva posición.
   */

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


  /*
   * Generamos nuevamente:
   *
   * 1
   * 2
   * 3
   * ...
   */

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


  /*
   * Modificamos únicamente las órdenes
   * pertenecientes a esta línea.
   */

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


  /*
   * Guardamos una sola vez.
   */

  saveOrders(
    updated
  );

}