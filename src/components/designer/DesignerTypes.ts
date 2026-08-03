export interface DesignerElement {

  id: number;

  type:
    | "text"
    | "field"
    | "logo"
    | "barcode"
    | "qr";

  /*
   * Campo SAP al que está vinculado.
   *
   * Ejemplos:
   * SKU
   * LOT
   * DATE
   */
  field?: string;

  /*
   * Valor mostrado actualmente.
   */
  text: string;

  /*
   * Valor dinámico recibido.
   */
  value?: string;

  /*
   * Vinculación automática con un campo.
   *
   * Ejemplos:
   * SKU
   * DESCRIPTION
   * DATE
   * LOT
   * COIL
   * ROLLS
   */
  binding?: string;

  /*
   * Propiedades del código de barras.
   *
   * CODE128
   * EAN13
   * CODE39
   */
  barcodeFormat?:
    | "CODE128"
    | "EAN13"
    | "CODE39";

  /*
   * Altura visual de las barras.
   */
  barcodeHeight?: number;

  /*
   * Grosor/ancho de las barras.
   */
  barcodeWidth?: number;

  /*
   * Mostrar u ocultar el número
   * debajo del código de barras.
   */
  barcodeDisplayValue?: boolean;

  /*
   * Posición.
   */
  x: number;

  y: number;

  /*
   * Dimensiones.
   */
  width: number;

  height: number;

  /*
   * Rotación en grados.
   */
  rotation: number;

  /*
   * Texto.
   */
  fontSize: number;

  fontWeight: number;

  color: string;

  /*
   * Estado del objeto.
   */
  locked: boolean;

  visible: boolean;

}