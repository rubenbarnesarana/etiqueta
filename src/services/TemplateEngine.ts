import type { DesignerElement } from "../components/designer/DesignerTypes";

export interface TemplateData {

  SKU: string;
  DESCRIPTION: string;
  BARCODE: string;
  QR: string;
  DATE: string;
  LOT: string;
  COIL: string;
  ROLLS: string;
  LOGO?: string;

}

function replaceValue(

  text: string,

  data: TemplateData

): string {

  return text

    .replaceAll("{SKU}", data.SKU)

    .replaceAll("{DESCRIPTION}", data.DESCRIPTION)

    .replaceAll("{BARCODE}", data.BARCODE)

    .replaceAll("{QR}", data.QR)

    .replaceAll("{DATE}", data.DATE)

    .replaceAll("{LOT}", data.LOT)

    .replaceAll("{COIL}", data.COIL)

    .replaceAll("{ROLLS}", data.ROLLS);

}

export function buildLabel(

  elements: DesignerElement[],

  data: TemplateData

): DesignerElement[] {

  return elements.map(el => {

    const copy = {

      ...el

    };

    //----------------------------------
    // CAMPOS
    //----------------------------------

    if (

      copy.type === "field" ||

      copy.type === "text"

    ) {

      copy.text = replaceValue(

        copy.text,

        data

      );

    }

    //----------------------------------
    // CODIGO DE BARRAS
    //----------------------------------

    if (copy.type === "barcode") {

      if (

        copy.field === "SKU" ||

        copy.text === "{SKU}"

      ) {

        copy.text = data.SKU;

      }

      else {

        copy.text = replaceValue(

          copy.text,

          data

        );

      }

    }

    //----------------------------------
    // QR
    //----------------------------------

    if (copy.type === "qr") {

      copy.text = data.QR;

    }

    return copy;

  });

}