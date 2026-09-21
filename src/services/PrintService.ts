import type {
  ProductionOrder
} from "./OrderStorage";

import {
  updateOrder
} from "./OrderStorage";

import {
  findProduct
} from "./ProductStorage";

import {
  findTemplate
} from "./TemplateStorage";

import {
  getAssignedTemplate
} from "./ProductTemplateStorage";

import {
  buildLabel
} from "./TemplateEngine";

import {
  generateUpperText,
  generateBottomDescription,
  generateCoilDescription,
  generateCoilTechnicalText,
  generateCoilLegalText,
  generateCoilOriginText
} from "./LabelTextGenerator";


//==================================================
// DATOS DINÁMICOS DE ETIQUETA
//==================================================

export interface PrintLabelData {

  ORDER: string;

  SKU: string;

  DESCRIPTION: string;

  UPPER_TEXT: string;

  COIL_DESCRIPTION: string;

  COIL_TECHNICAL: string;

  COIL_LEGAL: string;

  COIL_ORIGIN: string;

  BARCODE: string;

  QR: string;

  DATE: string;

  LOT: string;

  COIL: string;

  ROLLS: string;

}


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
  // DATOS DINÁMICOS
  // -----------------------------------------------

  labelData?:
    PrintLabelData;

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

      success:
        false,

      message:
        "La orden ya está completamente impresa.",

      coilNumber:
        order.firstCoil +
        order.printed,

      finished:
        true

    };

  }


  //------------------------------------------------
  // BUSCAR PRODUCTO
  //------------------------------------------------

  const product =
    findProduct(
      order.sku
    );


  if (
    !product
  ) {

    return {

      success:
        false,

      message:
        "Producto no encontrado.",

      coilNumber:
        0

    };

  }


  //------------------------------------------------
  // BUSCAR PLANTILLA
  //
  // PRIORIDAD:
  //
  // 1. Asignación SKU → plantilla
  // 2. Plantilla guardada en el producto
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

  if (
    !template
  ) {

    return {

      success:
        false,

      message:
        "El SKU no tiene una plantilla asignada.",

      coilNumber:
        0

    };

  }


  //------------------------------------------------
  // FORMATO
  //------------------------------------------------

  const labelFormat =
    template.labelFormat ??
    "FORMATO_1";


  //------------------------------------------------
  // NÚMERO DE BOBINA / ROLLO
  //------------------------------------------------

  const currentCoil =
    order.firstCoil +
    order.printed;


  //------------------------------------------------
  // FECHA
  //------------------------------------------------

  const now =
    new Date();


  /*
   * DATE
   *
   * DDMMYY
   *
   * Ejemplo:
   *
   * 21/09/2026
   *
   * 210926
   */

  const date =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    ) +

    String(
      now.getMonth() +
      1
    ).padStart(
      2,
      "0"
    ) +

    String(
      now.getFullYear()
    ).slice(
      -2
    );


  //------------------------------------------------
  // LOTE
  //------------------------------------------------
  //
  // Se utiliza siempre el lote guardado
  // en la orden.
  //
  // Si por cualquier motivo estuviera vacío,
  // se genera automáticamente YYMMDD.
  //------------------------------------------------

  const automaticLot =
    String(
      now.getFullYear()
    ).slice(
      -2
    ) +

    String(
      now.getMonth() +
      1
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


  const lot =
    order.lot?.trim() ||
    automaticLot;


  //------------------------------------------------
  // FORMATO 1
  // ROLLOS
  //------------------------------------------------

  let description =
    product.description;


  let upperText =
    "";


  if (
    labelFormat ===
    "FORMATO_1"
  ) {

    description =
      generateBottomDescription(
        product,
        template
      );


    upperText =
      generateUpperText(
        product,
        template
      );

  }


  //------------------------------------------------
  // FORMATO 2
  // BOBINAS
  //------------------------------------------------

  let coilDescription =
    "";


  let coilTechnical =
    "";


  let coilLegal =
    "";


  let coilOrigin =
    "";


  if (
    labelFormat ===
    "FORMATO_2"
  ) {

    /*
     * DESCRIPCIÓN SKU
     *
     * Ejemplo:
     *
     * EXCEL 16/8/1.2/0.15 2300m
     */

    coilDescription =
      generateCoilDescription(
        product
      );


    /*
     * INFORMACIÓN TÉCNICA
     *
     * Ejemplo:
     *
     * EXCEL 16/8 MIL 15 CM
     * 1.2 L/H at 1 Bar - B-2300M
     * EMITTING PIPE ISO 9261
     * Max Pressure 1.2 Bar
     */

    coilTechnical =
      generateCoilTechnicalText(
        product,
        template
      );


    /*
     * TEXTO FIJO INFERIOR
     */

    coilLegal =
      generateCoilLegalText();


    /*
     * ORIGEN
     */

    coilOrigin =
      generateCoilOriginText();

  }


  //------------------------------------------------
  // DATOS DINÁMICOS
  //------------------------------------------------

  const labelData:
    PrintLabelData = {


    //------------------------------------------------
    // PRODUCTION ORDER
    //------------------------------------------------

    ORDER:
      order.order,


    //------------------------------------------------
    // SKU
    //------------------------------------------------

    SKU:
      order.sku,


    //------------------------------------------------
    // FORMATO 1
    //------------------------------------------------

    DESCRIPTION:
      description,

    UPPER_TEXT:
      upperText,


    //------------------------------------------------
    // FORMATO 2
    //------------------------------------------------

    COIL_DESCRIPTION:
      coilDescription,

    COIL_TECHNICAL:
      coilTechnical,

    COIL_LEGAL:
      coilLegal,

    COIL_ORIGIN:
      coilOrigin,


    //------------------------------------------------
    // BARCODE
    //------------------------------------------------

    BARCODE:
      order.sku,


    //------------------------------------------------
    // QR
    //------------------------------------------------

    QR:
      order.sku,


    //------------------------------------------------
    // FECHA
    //------------------------------------------------

    DATE:
      date,


    //------------------------------------------------
    // LOT NUMBER
    //------------------------------------------------

    LOT:
      lot,


    //------------------------------------------------
    // COIL NUMBER
    //------------------------------------------------

    COIL:
      String(
        currentCoil
      ),


    //------------------------------------------------
    // TOTAL ROLLOS / BOBINAS
    //------------------------------------------------

    ROLLS:
      String(
        order.rolls
      )

  };


  //------------------------------------------------
  // CONSTRUIR ETIQUETA
  //------------------------------------------------
  //
  // Aquí se conservan:
  //
  // - posiciones
  // - tamaños
  // - rotaciones
  // - campos
  // - barcode
  //
  // configurados en el diseñador.
  //------------------------------------------------

  const label =
    buildLabel(
      template.elements,
      labelData
    );


  //------------------------------------------------
  // DIMENSIONES FÍSICAS
  //------------------------------------------------

  let labelWidth =
    80;


  let labelHeight =
    285;


  /*
   * FORMATO 2
   *
   * BOBINAS
   *
   * HORIZONTAL
   *
   * 240 mm ancho
   * 110 mm alto
   */

  if (
    labelFormat ===
    "FORMATO_2"
  ) {

    labelWidth =
      240;

    labelHeight =
      110;

  }


  //------------------------------------------------
  // IMAGEN DE FONDO
  //------------------------------------------------

  const backgroundImage =
    template.backgroundImage ??
    undefined;


  //------------------------------------------------
  // ACTUALIZAR CONTADOR DE IMPRESIÓN
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

    success:
      true,

    message:
      finished
        ? "ÚLTIMA_ETIQUETA"
        : "OK",

    coilNumber:
      currentCoil,

    label,

    finished,


    //------------------------------------------------
    // PLANTILLA
    //------------------------------------------------

    backgroundImage,

    labelFormat,

    labelWidth,

    labelHeight,


    //------------------------------------------------
    // DATOS REALES
    //------------------------------------------------

    labelData

  };

}