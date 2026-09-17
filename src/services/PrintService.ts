import type { ProductionOrder } from "./OrderStorage";
import { updateOrder } from "./OrderStorage";

import { findProduct } from "./ProductStorage";

import {
  findTemplate
} from "./TemplateStorage";

import {
  getAssignedTemplate
} from "./ProductTemplateStorage";

import {
  buildLabel
} from "./TemplateEngine";


//==================================================
// RESULTADO DE IMPRESIÓN
//==================================================

export interface PrintResult {

  success: boolean;

  message: string;

  coilNumber: number;

  label?: any[];

  finished?: boolean;

  // -----------------------------------------------
  // DATOS DE LA PLANTILLA
  // -----------------------------------------------

  backgroundImage?: string;

  labelFormat?:
    | "FORMATO_1"
    | "FORMATO_2";

  labelWidth?: number;

  labelHeight?: number;

  // -----------------------------------------------
  // DATOS DINÁMICOS DE LA ETIQUETA
  // -----------------------------------------------

  labelData?: {

    SKU: string;

    DESCRIPTION: string;

    BARCODE: string;

    QR: string;

    DATE: string;

    LOT: string;

    COIL: string;

    ROLLS: string;

  };

}


//==================================================
// IMPRIMIR UNA ETIQUETA
//==================================================

export function printLabel(
  order: ProductionOrder
): PrintResult {


  //------------------------------------------------
  // LA ORDEN YA TERMINÓ
  //------------------------------------------------

  if (
    order.printed >=
    order.rolls
  ) {

    return {

      success: false,

      message:
        "La orden ya está completamente impresa.",

      coilNumber:
        order.firstCoil +
        order.printed,

      finished: true

    };

  }


  //------------------------------------------------
  // BUSCAR PRODUCTO
  //------------------------------------------------

  const product =
    findProduct(
      order.sku
    );


  if (!product) {

    return {

      success: false,

      message:
        "Producto no encontrado.",

      coilNumber: 0

    };

  }


  //------------------------------------------------
  // BUSCAR PLANTILLA
  //
  // PRIORIDAD:
  //
  // 1. Asignación SKU → plantilla
  // 2. Plantilla antigua del producto
  //------------------------------------------------

  const assignedTemplate =
    getAssignedTemplate(
      order.sku
    );


  let template;


  if (
    assignedTemplate
  ) {

    template =
      findTemplate(
        assignedTemplate.id
      );

  } else {

    template =
      findTemplate(
        product.templateId
      );

  }


  //------------------------------------------------
  // COMPROBAR PLANTILLA
  //------------------------------------------------

  if (!template) {

    return {

      success: false,

      message:
        "El SKU no tiene una plantilla asignada.",

      coilNumber: 0

    };

  }


  //------------------------------------------------
  // NUMERO DE BOBINA
  //------------------------------------------------

  const currentCoil =
    order.firstCoil +
    order.printed;


  //------------------------------------------------
  // FECHA
  //------------------------------------------------

  const now =
    new Date();


  const date =
    now.toLocaleDateString(
      "es-ES"
    );


  //------------------------------------------------
  // LOTE
  //
  // Por ahora utilizamos YYMMDD.
  //------------------------------------------------

  const lot =
    String(
      now.getFullYear()
    ).slice(-2) +

    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    ) +

    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  //------------------------------------------------
  // DATOS DINÁMICOS
  //------------------------------------------------

  const labelData = {

    SKU:
      order.sku,

    DESCRIPTION:
      order.product,

    BARCODE:
      order.sku,

    QR:
      order.sku,

    DATE:
      date,

    LOT:
      lot,

    COIL:
      String(
        currentCoil
      ),

    ROLLS:
      String(
        order.rolls
      )

  };


  //------------------------------------------------
  // CONSTRUIR ELEMENTOS DINÁMICOS
  //
  // Aquí se mantienen los elementos configurados
  // en el diseñador.
  //------------------------------------------------

  const label =
    buildLabel(
      template.elements,
      labelData
    );


  //------------------------------------------------
  // FORMATO
  //------------------------------------------------

  const labelFormat =
    template.labelFormat ??
    "FORMATO_1";


  let labelWidth =
    80;

  let labelHeight =
    285;


  if (
    labelFormat ===
    "FORMATO_2"
  ) {

    labelWidth =
      110;

    labelHeight =
      240;

  }


  //------------------------------------------------
  // IMAGEN DE FONDO
  //
  // Esta es la plantilla real que se debe utilizar
  // como base de impresión.
  //------------------------------------------------

  const backgroundImage =
    template.backgroundImage ??
    undefined;


  //------------------------------------------------
  // ACTUALIZAR ORDEN
  //------------------------------------------------

  const printed =
    order.printed +
    1;


  const finished =
    printed >=
    order.rolls;


  const updated:
    ProductionOrder = {

    ...order,

    printed,

    status:
      finished
        ? "FINALIZADA"
        : "ABIERTA"

  };


  updateOrder(
    updated
  );


  //------------------------------------------------
  // RESPUESTA
  //------------------------------------------------

  return {

    success: true,

    message:
      finished
        ? "ÚLTIMA_ETIQUETA"
        : "OK",

    coilNumber:
      currentCoil,

    label,

    finished,

    // ---------------------------------------------
    // PLANTILLA
    // ---------------------------------------------

    backgroundImage,

    labelFormat,

    labelWidth,

    labelHeight,

    // ---------------------------------------------
    // DATOS
    // ---------------------------------------------

    labelData

  };

}