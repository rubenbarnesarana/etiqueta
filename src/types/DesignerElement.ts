export interface DesignerElement {

  id: number;

  type:
    | "text"
    | "logo"
    | "sku"
    | "description"
    | "barcode"
    | "qr"
    | "date"
    | "lot"
    | "line"
    | "rectangle"
    | "image"
    | "icon";

  x: number;

  y: number;

  width: number;

  height: number;

  rotation: number;

  properties: any;

}