import {
  supabase
} from "./Supabase";

import type {
  Product
} from "../models/Product";


interface ProductRow {

  id: number;

  sap_code: string;

  description: string;

  upper_text: string;

  diameter: string;

  thickness: string;

  flow: string;

  spacing: string;

  dripper: string;

  template_id: number;

}


/*
 * ==================================================
 * CONFIGURACIÓN
 * ==================================================
 */

const READ_BATCH_SIZE =
  1000;

const WRITE_BATCH_SIZE =
  500;


/*
 * ==================================================
 * CONVERTIR SUPABASE -> PRODUCT
 * ==================================================
 */

function mapRowToProduct(
  row: ProductRow
): Product {

  return {

    id:
      Number(
        row.id
      ),

    sapCode:
      row.sap_code ??
      "",

    description:
      row.description ??
      "",

    upperText:
      row.upper_text ??
      "",

    diameter:
      row.diameter ??
      "",

    thickness:
      row.thickness ??
      "",

    flow:
      row.flow ??
      "",

    spacing:
      row.spacing ??
      "",

    dripper:
      row.dripper ??
      "",

    templateId:
      Number(
        row.template_id ??
        0
      )

  };

}


/*
 * ==================================================
 * CONVERTIR PRODUCT -> SUPABASE
 * ==================================================
 */

function mapProductToRow(
  product: Product
) {

  return {

    id:
      product.id,

    sap_code:
      product.sapCode,

    description:
      product.description,

    upper_text:
      product.upperText ??
      "",

    diameter:
      product.diameter ??
      "",

    thickness:
      product.thickness ??
      "",

    flow:
      product.flow ??
      "",

    spacing:
      product.spacing ??
      "",

    dripper:
      product.dripper ??
      "",

    template_id:
      product.templateId ??
      0

  };

}


/*
 * ==================================================
 * OBTENER TODOS LOS PRODUCTOS
 * ==================================================
 *
 * Se descargan por bloques para no depender
 * del límite máximo de filas de Supabase.
 * ==================================================
 */

export async function getSupabaseProducts():
Promise<Product[]> {

  const allRows:
    ProductRow[] = [];


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
          "products"
        )
        .select(
          `
            id,
            sap_code,
            description,
            upper_text,
            diameter,
            thickness,
            flow,
            spacing,
            dripper,
            template_id
          `
        )
        .order(
          "sap_code",
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
        "Error cargando productos desde Supabase:",
        error
      );

      throw error;

    }


    const rows =
      (
        data ??
        []
      ) as ProductRow[];


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
      mapRowToProduct(
        row
      )
  );

}


/*
 * ==================================================
 * CREAR / ACTUALIZAR PRODUCTO
 * ==================================================
 */

export async function saveSupabaseProduct(
  product: Product
): Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "products"
      )
      .upsert(
        mapProductToRow(
          product
        ),
        {
          onConflict:
            "sap_code"
        }
      );


  if (
    error
  ) {

    console.error(
      "Error guardando producto en Supabase:",
      error
    );

    throw error;

  }

}


/*
 * ==================================================
 * GUARDAR VARIOS PRODUCTOS
 * ==================================================
 */

export async function saveSupabaseProducts(
  products: Product[]
): Promise<void> {

  if (
    products.length ===
    0
  ) {

    return;

  }


  const rows =
    products.map(
      product =>
        mapProductToRow(
          product
        )
    );


  for (
    let index = 0;
    index < rows.length;
    index += WRITE_BATCH_SIZE
  ) {

    const batch =
      rows.slice(
        index,
        index +
        WRITE_BATCH_SIZE
      );


    const {
      error
    } =
      await supabase
        .from(
          "products"
        )
        .upsert(
          batch,
          {
            onConflict:
              "sap_code"
          }
        );


    if (
      error
    ) {

      console.error(
        "Error guardando productos en Supabase:",
        error
      );

      throw error;

    }

  }

}


/*
 * ==================================================
 * ELIMINAR PRODUCTO
 * ==================================================
 */

export async function deleteSupabaseProduct(
  id: number
): Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "products"
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
      "Error eliminando producto de Supabase:",
      error
    );

    throw error;

  }

}