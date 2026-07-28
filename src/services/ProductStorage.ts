import type { Product } from "../models/Product";

const STORAGE_KEY = "products";

export function getProducts(): Product[] {

  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  return JSON.parse(data);

}

export function saveProducts(products: Product[]) {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(products)

  );

}

export function addProduct(product: Product) {

  const products = getProducts();

  products.push(product);

  saveProducts(products);

}

export function deleteProduct(id: number) {

  const products = getProducts().filter(

    p => p.id !== id

  );

  saveProducts(products);

}

export function updateProduct(product: Product) {

  const products = getProducts().map(p =>

    p.id === product.id

      ? product

      : p

  );

  saveProducts(products);

}

export function findProduct(sapCode: string) {

  return getProducts().find(

    p => p.sapCode === sapCode

  );

}