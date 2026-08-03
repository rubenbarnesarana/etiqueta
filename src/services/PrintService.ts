import type { ProductionOrder } from "./OrderStorage";
import { updateOrder } from "./OrderStorage";

import { findProduct } from "./ProductStorage";
import { findTemplate } from "./TemplateStorage";
import { buildLabel } from "./TemplateEngine";

export interface PrintResult {

  success: boolean;

  message: string;

  coilNumber: number;

  label?: any[];

  finished?: boolean;

}

export function printLabel(order: ProductionOrder): PrintResult {

  //--------------------------------------------------
  // La orden ya terminó
  //--------------------------------------------------

  if (order.printed >= order.rolls) {

    return {

      success: false,

      message: "La orden ya está completamente impresa.",

      coilNumber: order.firstCoil + order.printed,

      finished: true

    };

  }

  //--------------------------------------------------
  // Buscar producto
  //--------------------------------------------------

  const product = findProduct(order.sku);

  if (!product) {

    return {

      success: false,

      message: "Producto no encontrado.",

      coilNumber: 0

    };

  }

  //--------------------------------------------------
  // Buscar plantilla
  //--------------------------------------------------

  const template = findTemplate(product.templateId);

  if (!template) {

    return {

      success: false,

      message: "La plantilla asignada no existe.",

      coilNumber: 0

    };

  }

  //--------------------------------------------------
  // Construir etiqueta
  //--------------------------------------------------

  const currentCoil = order.firstCoil + order.printed;

  const label = buildLabel(template.elements, {

    SKU: order.sku,

    DESCRIPTION: order.product,

    BARCODE: order.sku,

    QR: order.sku,

    DATE: new Date().toLocaleDateString(),

    LOT: "",

    COIL: String(currentCoil),

    ROLLS: String(order.rolls)

  });

  //--------------------------------------------------
  // Actualizar orden
  //--------------------------------------------------

  const printed = order.printed + 1;

  const finished = printed >= order.rolls;

  const updated: ProductionOrder = {

    ...order,

    printed,

    status: finished
      ? "FINALIZADA"
      : "ABIERTA"

  };

  updateOrder(updated);

  //--------------------------------------------------
  // Respuesta
  //--------------------------------------------------

  return {

    success: true,

    message: finished
      ? "ÚLTIMA_ETIQUETA"
      : "OK",

    coilNumber: currentCoil,

    label,

    finished

  };

}