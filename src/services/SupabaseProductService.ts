import {
  supabase
} from "./Supabase";

import type {
  Product
} from "../models/Product";

import {
  getAssignments,
  saveAssignments,
  assignTemplateToSku,
  removeAssignment
} from "./ProductTemplateStorage";


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
 * SINCRONIZAR UNA ASIGNACIÓN EN CACHÉ LOCAL
 * ==================================================
 *
 * La persistencia central se realiza en Supabase
 * mediante el trigger sobre public.products.
 *
 * Aquí únicamente mantenemos actualizada la copia
 * local que utiliza PrintService.
 * ==================================================
 */

function syncLocalAssignment(
  product: Product
) {

  const templateId =
    Number(
      product.templateId ??
      0
    );


  if (
    Number.isFinite(
      templateId
    ) &&
    templateId > 0
  ) {

    assignTemplateToSku(
      product.sapCode,
      templateId
    );

  }
  else {

    removeAssignment(
      product.sapCode
    );

  }

}


/*
 * ==================================================
 * SINCRONIZAR VARIAS ASIGNACIONES EN CACHÉ LOCAL
 * ==================================================
 *
 * Se realiza una única escritura en localStorage.
 *
 * Esto es importante durante una importación SAP
 * con miles de productos.
 * ==================================================
 */

function syncLocalAssignments(
  products: Product[]
) {

  const currentAssignments =
    getAssignments();


  const assignmentsMap =
    new Map<
      string,
      number
    >();


  currentAssignments.forEach(
    assignment => {

      const sku =
        String(
          assignment.sku
        ).trim();


      const templateId =
        Number(
          assignment.templateId
        );


      if (
        sku !== "" &&
        Number.isFinite(
          templateId
        ) &&
        templateId > 0
      ) {

        assignmentsMap.set(
          sku,
          templateId
        );

      }

    }
  );


  products.forEach(
    product => {

      const sku =
        String(
          product.sapCode
        ).trim();


      if (
        sku === ""
      ) {

        return;

      }


      const templateId =
        Number(
          product.templateId ??
          0
        );


      if (
        Number.isFinite(
          templateId
        ) &&
        templateId > 0
      ) {

        assignmentsMap.set(
          sku,
          templateId
        );

      }
      else {

        assignmentsMap.delete(
          sku
        );

      }

    }
  );


  saveAssignments(
    Array.from(
      assignmentsMap.entries()
    ).map(
      (
        [
          sku,
          templateId
        ]
      ) => ({

        sku,

        templateId

      })
    )
  );

}


/*
 * ==================================================
 * OBTENER TODOS LOS PRODUCTOS
 * ==================================================
 *
 * Se descargan por bloques para no depender
 * del límite máximo de filas de Supabase.
 *
 * Al finalizar también actualizamos la caché local
 * de asignaciones SKU -> plantilla.
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


  const products =
    allRows.map(
      row =>
        mapRowToProduct(
          row
        )
    );


  /*
   * La descarga completa de productos representa
   * el estado central actual de Supabase.
   *
   * Por tanto reconstruimos también la caché local
   * completa de asignaciones.
   */

  saveAssignments(
    products
      .filter(
        product => {

          const templateId =
            Number(
              product.templateId ??
              0
            );


          return (
            String(
              product.sapCode
            ).trim() !== "" &&
            Number.isFinite(
              templateId
            ) &&
            templateId > 0
          );

        }
      )
      .map(
        product => ({

          sku:
            String(
              product.sapCode
            ).trim(),

          templateId:
            Number(
              product.templateId
            )

        })
      )
  );


  return products;

}


/*
 * ==================================================
 * CREAR / ACTUALIZAR PRODUCTO
 * ==================================================
 *
 * Supabase guarda products.
 *
 * El trigger de Supabase mantiene automáticamente
 * product_template_assignments.
 *
 * Después actualizamos la caché local.
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


  /*
   * Supabase ya ha confirmado el guardado.
   * Actualizamos ahora la caché local.
   */

  syncLocalAssignment(
    product
  );

}


/*
 * ==================================================
 * GUARDAR VARIOS PRODUCTOS
 * ==================================================
 *
 * Usado, entre otros casos, para la importación SAP.
 *
 * El trigger central sincroniza automáticamente
 * product_template_assignments en Supabase.
 *
 * La caché local se actualiza una sola vez al final.
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


  /*
   * Todos los bloques se han guardado correctamente.
   *
   * Actualizamos la caché local en una sola operación.
   */

  syncLocalAssignments(
    products
  );

}


/*
 * ==================================================
 * ELIMINAR PRODUCTO
 * ==================================================
 *
 * Al borrar products:
 *
 * 1. El trigger de Supabase elimina automáticamente
 *    product_template_assignments.
 *
 * 2. Aquí eliminamos también la asignación de la
 *    caché local.
 * ==================================================
 */

export async function deleteSupabaseProduct(
  id: number
): Promise<void> {

  /*
   * Pedimos el SKU de la fila eliminada.
   *
   * Así no necesitamos cambiar la llamada actual
   * desde Products.tsx.
   */

  const {
    data,
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
      )
      .select(
        "sap_code"
      )
      .maybeSingle();


  if (
    error
  ) {

    console.error(
      "Error eliminando producto de Supabase:",
      error
    );

    throw error;

  }


  const deletedSku =
    String(
      data?.sap_code ??
      ""
    ).trim();


  if (
    deletedSku !== ""
  ) {

    removeAssignment(
      deletedSku
    );

  }

}