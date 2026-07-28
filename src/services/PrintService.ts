import type { ProductionOrder } from "./OrderStorage";
import { updateOrder } from "./OrderStorage";

import { findProduct } from "./ProductStorage";
import { findTemplate } from "./TemplateStorage";
import { buildLabel } from "./TemplateEngine";

export interface PrintResult {

  success:boolean;

  message:string;

  coilNumber:number;

  label?:any[];

}

export function printLabel(order:ProductionOrder):PrintResult{

  if(order.printed>=order.rolls){

    return{

      success:false,

      message:"La orden ya está completamente impresa.",

      coilNumber:order.firstCoil+order.printed

    };

  }

  const product=findProduct(order.sku);

  if(!product){

    return{

      success:false,

      message:"Producto no encontrado.",

      coilNumber:0

    };

  }

  const template=findTemplate(product.templateId);

  if(!template){

    return{

      success:false,

      message:"La plantilla asignada no existe.",

      coilNumber:0

    };

  }

  const label=buildLabel(template.elements,{

    SKU:order.sku,

    DESCRIPTION:order.product,

    BARCODE:order.sku,

    QR:order.sku,

    DATE:new Date().toLocaleDateString(),

    LOT:"",

    COIL:String(order.firstCoil+order.printed),

    ROLLS:String(order.rolls)

  });

  const updated={

    ...order,

    printed:order.printed+1,

    status:

      order.printed+1>=order.rolls

      ?"FINALIZADA"

      :"ABIERTA"

  };

  updateOrder(updated);

  return{

    success:true,

    message:"OK",

    coilNumber:order.firstCoil+order.printed,

    label

  };

}