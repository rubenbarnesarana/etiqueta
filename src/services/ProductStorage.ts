import type {
  Product
} from "../models/Product";


const STORAGE_KEY =
  "products";


/*
 * ==================================================
 * NORMALIZAR PRODUCTO
 * ==================================================
 */

function normalizeProduct(
  product: any
): Product {

  return {
    id:
      Number(
        product.id
      ),

    sapCode:
      String(
        product.sapCode ??
        ""
      ),

    description:
      String(
        product.description ??
        ""
      ),

    upperText:
      String(
        product.upperText ??
        ""
      ),

    marking:
      String(
        product.marking ??
        ""
      ),

    diameter:
      String(
        product.diameter ??
        ""
      ),

    thickness:
      String(
        product.thickness ??
        ""
      ),

    flow:
      String(
        product.flow ??
        ""
      ),

    spacing:
      String(
        product.spacing ??
        ""
      ),

    dripper:
      String(
        product.dripper ??
        ""
      ),

    templateId:
      Number(
        product.templateId ??
        0
      )
  };
}


/*
 * ==================================================
 * OBTENER PRODUCTOS
 * ==================================================
 */

export function getProducts():
  Product[] {

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

    const parsed =
      JSON.parse(
        data
      );


    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }


    return parsed.map(
      normalizeProduct
    );

  }
  catch {

    return [];
  }
}


/*
 * ==================================================
 * GUARDAR PRODUCTOS
 * ==================================================
 */

export function saveProducts(
  products: Product[]
) {

  const normalized =
    products.map(
      normalizeProduct
    );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      normalized
    )
  );


  if (
    typeof window !==
    "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "productsUpdated"
      )
    );
  }
}


/*
 * ==================================================
 * AÑADIR PRODUCTO
 * ==================================================
 */

export function addProduct(
  product: Product
) {

  const products =
    getProducts();


  products.push(
    normalizeProduct(
      product
    )
  );


  saveProducts(
    products
  );
}


/*
 * ==================================================
 * ELIMINAR PRODUCTO
 * ==================================================
 */

export function deleteProduct(
  id: number
) {

  const products =
    getProducts().filter(
      product =>
        Number(
          product.id
        ) !==
        Number(
          id
        )
    );


  saveProducts(
    products
  );
}


/*
 * ==================================================
 * ACTUALIZAR PRODUCTO
 * ==================================================
 */

export function updateProduct(
  product: Product
) {

  const normalized =
    normalizeProduct(
      product
    );


  const products =
    getProducts().map(
      current =>
        Number(
          current.id
        ) ===
        Number(
          normalized.id
        )
          ? normalized
          : current
    );


  saveProducts(
    products
  );
}


/*
 * ==================================================
 * BUSCAR PRODUCTO POR SKU
 * ==================================================
 */

export function findProduct(
  sapCode: string
) {

  const cleanSapCode =
    String(
      sapCode ??
      ""
    ).trim();


  return getProducts().find(
    product =>
      product.sapCode ===
      cleanSapCode
  );
}