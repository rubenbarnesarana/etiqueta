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

  backgroundImage?: string;

  labelFormat?:
    | "FORMATO_1"
    | "FORMATO_2";

  labelWidth?: number;

  labelHeight?: number;

  labelData?:
    PrintLabelData;

}


//==================================================
// GENERAR ETIQUETA
//==================================================
//
// Esta función construye la etiqueta.
//
// IMPORTANTE:
//
// NO modifica:
// - impresos
// - pendientes
// - estado
// - planificación
//
// Esto permite utilizar exactamente la misma lógica
// tanto para impresión normal como para reimpresión.
//
//==================================================

function buildPrintResult(
  order: ProductionOrder,
  coilNumber: number
): PrintResult {

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

      coilNumber

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

      coilNumber

    };

  }


  //------------------------------------------------
  // FORMATO
  //------------------------------------------------

  const labelFormat =
    template.labelFormat ??
    "FORMATO_1";


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
   * 23/09/2026
   *
   * 230926
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
  // Si estuviera vacío,
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

    coilDescription =
      generateCoilDescription(
        product
      );


    coilTechnical =
      generateCoilTechnicalText(
        product,
        template
      );


    coilLegal =
      generateCoilLegalText();


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
        coilNumber
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
  // RESPUESTA
  //------------------------------------------------

  return {

    success:
      true,

    message:
      "OK",

    coilNumber,

    label,

    backgroundImage,

    labelFormat,

    labelWidth,

    labelHeight,

    labelData

  };

}


//==================================================
// PREPARAR ETIQUETA RESERVADA POR SUPABASE
//==================================================
//
// Esta función se utilizará cuando Supabase ya haya
// reservado atómicamente el número de bobina.
//
// MUY IMPORTANTE:
//
// - NO calcula la siguiente bobina localmente.
// - NO incrementa printed.
// - NO modifica estado.
// - NO modifica planificación.
// - Utiliza exactamente el coilNumber recibido.
//
//==================================================

export function prepareReservedPrintLabel(
  order: ProductionOrder,
  coilNumber: number
): PrintResult {

  if (
    !Number.isInteger(
      coilNumber
    ) ||
    coilNumber < 1
  ) {

    return {

      success:
        false,

      message:
        "El número de bobina reservado no es válido.",

      coilNumber

    };

  }


  return buildPrintResult(
    order,
    coilNumber
  );

}


//==================================================
// PREPARAR SIGUIENTE ETIQUETA
//==================================================
//
// Genera la siguiente etiqueta que corresponde
// a la orden.
//
// MUY IMPORTANTE:
//
// NO incrementa order.printed.
// NO cambia el estado.
// NO modifica la planificación.
//
// Esta función se utiliza ANTES de enviar
// físicamente la etiqueta a QZ Tray.
//
//==================================================

export function preparePrintLabel(
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
  // SIGUIENTE BOBINA
  //------------------------------------------------

  const currentCoil =
    order.firstCoil +
    order.printed;


  //------------------------------------------------
  // GENERAR ETIQUETA SIN MODIFICAR LA ORDEN
  //------------------------------------------------

  return buildPrintResult(
    order,
    currentCoil
  );

}


//==================================================
// CONFIRMAR ETIQUETA IMPRESA
//==================================================
//
// Esta función debe ejecutarse SOLAMENTE
// después de que qz.print() haya terminado
// correctamente.
//
// Aquí es donde se incrementa el contador.
//
// IMPORTANTE:
//
// Se mantiene temporalmente para compatibilidad
// con cualquier flujo antiguo.
//
// OrderPrint dejará de utilizar esta función cuando
// integremos la confirmación atómica de Supabase.
//
//==================================================

export function commitPrintedLabel(
  order: ProductionOrder,
  coilNumber: number
): PrintResult {

  //------------------------------------------------
  // VALIDAR NÚMERO DE BOBINA
  //------------------------------------------------

  const expectedCoil =
    order.firstCoil +
    order.printed;


  if (
    coilNumber !==
    expectedCoil
  ) {

    return {

      success:
        false,

      message:
        `La bobina ${coilNumber} ya no coincide con la siguiente bobina esperada (${expectedCoil}).`,

      coilNumber

    };

  }


  //------------------------------------------------
  // COMPROBAR QUE LA ORDEN NO ESTÁ FINALIZADA
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

      coilNumber,

      finished:
        true

    };

  }


  //------------------------------------------------
  // ACTUALIZAR CONTADOR
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

    coilNumber,

    finished

  };

}


//==================================================
// IMPRIMIR UNA ETIQUETA NORMAL
//==================================================
//
// FUNCIÓN LEGACY.
//
// Se mantiene temporalmente para que las pantallas
// existentes continúen funcionando mientras se
// integra la impresión física mediante QZ Tray.
//
// Esta función conserva exactamente el flujo anterior:
// genera la etiqueta e incrementa inmediatamente
// el contador.
//
// Cuando OrderPrint utilice completamente QZ Tray,
// dejará de llamar a esta función.
//
//==================================================

export function printLabel(
  order: ProductionOrder
): PrintResult {

  //------------------------------------------------
  // PREPARAR ETIQUETA
  //------------------------------------------------

  const result =
    preparePrintLabel(
      order
    );


  if (
    !result.success
  ) {

    return result;

  }


  //------------------------------------------------
  // CONFIRMAR IMPRESIÓN
  //------------------------------------------------

  const commitResult =
    commitPrintedLabel(
      order,
      result.coilNumber
    );


  if (
    !commitResult.success
  ) {

    return {

      ...result,

      success:
        false,

      message:
        commitResult.message,

      finished:
        commitResult.finished

    };

  }


  //------------------------------------------------
  // RESPUESTA
  //------------------------------------------------

  return {

    ...result,

    message:
      commitResult.message,

    finished:
      commitResult.finished

  };

}


//==================================================
// REIMPRIMIR UNA ETIQUETA
//==================================================
//
// Genera exactamente la bobina solicitada.
//
// MUY IMPORTANTE:
//
// NO incrementa order.printed.
// NO reduce pendientes.
// NO cambia el estado de la orden.
// NO modifica la planificación.
//
//==================================================

export function reprintLabel(
  order: ProductionOrder,
  coilNumber: number
): PrintResult {

  //------------------------------------------------
  // VALIDAR NÚMERO
  //------------------------------------------------

  if (
    !Number.isInteger(
      coilNumber
    )
  ) {

    return {

      success:
        false,

      message:
        "El número de bobina no es válido.",

      coilNumber

    };

  }


  //------------------------------------------------
  // PRIMERA BOBINA DE LA ORDEN
  //------------------------------------------------

  const firstPrintedCoil =
    order.firstCoil;


  //------------------------------------------------
  // ÚLTIMA BOBINA QUE REALMENTE SE HA IMPRESO
  //------------------------------------------------

  const lastPrintedCoil =
    order.firstCoil +
    order.printed -
    1;


  //------------------------------------------------
  // TODAVÍA NO HAY ETIQUETAS IMPRESAS
  //------------------------------------------------

  if (
    order.printed <=
    0
  ) {

    return {

      success:
        false,

      message:
        "Esta orden todavía no tiene etiquetas impresas.",

      coilNumber

    };

  }


  //------------------------------------------------
  // COMPROBAR QUE ESA BOBINA YA FUE IMPRESA
  //------------------------------------------------

  if (
    coilNumber <
      firstPrintedCoil ||
    coilNumber >
      lastPrintedCoil
  ) {

    return {

      success:
        false,

      message:
        `Solo se pueden reimprimir las bobinas ${firstPrintedCoil} a ${lastPrintedCoil}.`,

      coilNumber

    };

  }


  //------------------------------------------------
  // GENERAR LA ETIQUETA
  //
  // No se llama a updateOrder().
  //------------------------------------------------

  const result =
    buildPrintResult(
      order,
      coilNumber
    );


  if (
    !result.success
  ) {

    return result;

  }


  //------------------------------------------------
  // RESPUESTA
  //------------------------------------------------

  return {

    ...result,

    message:
      "REIMPRESIÓN_OK",

    finished:
      order.status ===
      "FINALIZADA"

  };

}