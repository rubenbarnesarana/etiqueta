export interface ProductionOrder {

  id: number;

  order: string;

  sku: string;

  product: string;

  templateId: number;

  rolls: number;

  firstCoil: number;

  printer: string;

  status: "ABIERTA" | "FINALIZADA";

  printed: number;

}

const STORAGE_KEY = "productionOrders";

const HISTORY_KEY = "orderHistory";

export function getOrders(): ProductionOrder[] {

  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {

    return JSON.parse(data);

  } catch {

    return [];

  }

}

export function saveOrders(orders: ProductionOrder[]) {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(orders)

  );

}

export function addOrder(order: ProductionOrder) {

  const orders = getOrders();

  orders.push(order);

  saveOrders(orders);

}

export function findOrder(orderNumber: string) {

  const order = getOrders().find(

    o => o.order === orderNumber

  );

  if (order) {

    saveOrderHistory(order.order);

  }

  return order;

}

export function updateOrder(order: ProductionOrder) {

  const orders = getOrders().map(o =>

    Number(o.id) === Number(order.id)

      ? order

      : o

  );

  saveOrders(orders);

}

export function deleteOrder(id: number) {

  const orders = getOrders().filter(

    o => Number(o.id) !== Number(id)

  );

  saveOrders(orders);

}

/*----------------------------------------------------*/
/* HISTORIAL */
/*----------------------------------------------------*/

export function getOrderHistory(): string[] {

  const data = localStorage.getItem(HISTORY_KEY);

  if (!data) return [];

  try {

    return JSON.parse(data);

  } catch {

    return [];

  }

}

export function saveOrderHistory(order: string) {

  let history = getOrderHistory();

  history = history.filter(x => x !== order);

  history.unshift(order);

  if (history.length > 20) {

    history = history.slice(0, 20);

  }

  localStorage.setItem(

    HISTORY_KEY,

    JSON.stringify(history)

  );

}

export function getLastOrder(): string {

  const history = getOrderHistory();

  return history.length > 0 ? history[0] : "";

}