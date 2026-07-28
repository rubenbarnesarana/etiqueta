export interface DesignerElement {

  id: number;

  type: "text" | "field" | "logo" | "barcode" | "qr";

  field?: string;

  text: string;

  x: number;

  y: number;

  width: number;

  height: number;

  rotation: number;

  fontSize: number;

  fontWeight: number;

  color: string;

  locked: boolean;

  visible: boolean;

}