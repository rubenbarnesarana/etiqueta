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
      JSON.parse(data);


    if (!Array.isArray(orders)) {
      return [];
    }


    /*
     * Normalizamos también las órdenes antiguas.
     *
     * Las órdenes creadas antes de añadir
     * Lot Number no tendrán la propiedad lot.
     */

    return orders.map(
      (order: any) => ({

        id:
          Number(order.id),

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
            order.printer ?? "BA420"
          ),

        status:
          order.status ===
          "FINALIZADA"
            ? "FINALIZADA"
            : "ABIERTA",

        printed:
          Number(
            order.printed ?? 0
          )

      })
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


  orders.push(
    order
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

  const orders =
    getOrders().map(
      item =>
        Number(item.id) ===
        Number(order.id)
          ? order
          : item
    );


  saveOrders(
    orders
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
    getOrders().filter(
      order =>
        Number(order.id) !==
        Number(id)
  );


  saveOrders(
    orders
  );

}