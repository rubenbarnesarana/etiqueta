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

  return getOrders().find(

    o => o.order === orderNumber

  );

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