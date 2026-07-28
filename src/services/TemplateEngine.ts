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

export function buildLabel(

  elements: DesignerElement[],
  data: TemplateData

): DesignerElement[] {

  return elements.map(el => {

    if (el.type !== "field") {

      return el;

    }

    const value =
      data[el.field as keyof TemplateData] ?? "";

    return {

      ...el,

      text: value

    };

  });

}