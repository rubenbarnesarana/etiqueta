import {
  createContext,
  useContext,
  useState
} from "react";

import type {
  ReactNode
} from "react";

import type {
  DesignerElement
} from "./DesignerTypes";


export interface LabelData {

  ORDER: string;

  SKU: string;

  DESCRIPTION: string;

  /*
   * TEXTO SUPERIOR DE LA ETIQUETA
   *
   * Se genera automáticamente en producción.
   * En la plantilla se mostrará a 180°.
   */
  UPPER_TEXT: string;

  BARCODE: string;

  QR: string;

  DATE: string;

  LOT: string;

  COIL: string;

  ROLLS: string;

}


interface Context {

  elements:
    DesignerElement[];

  setElements:
    React.Dispatch<
      React.SetStateAction<
        DesignerElement[]
      >
    >;


  selected:
    number | null;

  setSelected:
    React.Dispatch<
      React.SetStateAction<
        number | null
      >
    >;


  clipboard:
    DesignerElement | null;

  setClipboard:
    React.Dispatch<
      React.SetStateAction<
        DesignerElement | null
      >
    >;


  undo:
    DesignerElement[][];

  setUndo:
    React.Dispatch<
      React.SetStateAction<
        DesignerElement[][]
      >
    >;


  redo:
    DesignerElement[][];

  setRedo:
    React.Dispatch<
      React.SetStateAction<
        DesignerElement[][]
      >
    >;


  labelData:
    LabelData;

  setLabelData:
    React.Dispatch<
      React.SetStateAction<
        LabelData
      >
    >;

}


const DesignerContext =
  createContext(
    {} as Context
  );


export function DesignerProvider({
  children
}: {
  children: ReactNode;
}) {

  const [
    elements,
    setElements
  ] =
    useState<
      DesignerElement[]
    >([]);


  const [
    selected,
    setSelected
  ] =
    useState<
      number | null
    >(null);


  const [
    clipboard,
    setClipboard
  ] =
    useState<
      DesignerElement | null
    >(null);


  const [
    undo,
    setUndo
  ] =
    useState<
      DesignerElement[][]
    >([]);


  const [
    redo,
    setRedo
  ] =
    useState<
      DesignerElement[][]
    >([]);


  /*
   * ==================================================
   * DATOS DE PRUEBA DEL DISEÑADOR
   * ==================================================
   *
   * Estos datos solamente sirven para
   * poder diseñar y colocar los campos
   * sobre la plantilla.
   *
   * En Producción serán sustituidos
   * automáticamente por los datos reales.
   *
   * IMPORTANTE:
   *
   * COIL = 1
   *
   * El contador de etiquetas impresas
   * comienza en 0.
   *
   * Pero la primera etiqueta que se
   * imprime es siempre Coil Number 1.
   */

  const [
    labelData,
    setLabelData
  ] =
    useState<LabelData>({

      /*
       * PRODUCTION ORDER
       */

      ORDER:
        "89000051042",


      /*
       * SKU
       */

      SKU:
        "101089504",


      /*
       * DESCRIPCIÓN INFERIOR
       */

      DESCRIPTION:
        "AS 20/47/3.8/0.50 R-300M",


      /*
       * TEXTO SUPERIOR
       *
       * Este es solamente un ejemplo
       * para diseñar la plantilla AMNON.
       *
       * En producción se generará
       * automáticamente.
       */

      UPPER_TEXT:
        "AMNON PC AS 20/3.8\n50CM E-1.2MM R-300M\nEmitting Pipe\nMax Pressure 3.5 BAR\nISO 9261",


      /*
       * CÓDIGO DE BARRAS
       */

      BARCODE:
        "101089504",


      /*
       * QR
       */

      QR:
        "101089504",


      /*
       * FECHA
       */

      DATE:
        "300726",


      /*
       * LOT NUMBER
       *
       * Solo es un dato de prueba.
       * En producción se genera
       * automáticamente.
       */

      LOT:
        "260918",


      /*
       * COIL NUMBER
       *
       * Primera etiqueta = 1
       */

      COIL:
        "1",


      /*
       * TOTAL ROLLOS
       */

      ROLLS:
        "10"

    });


  return (

    <DesignerContext.Provider
      value={{

        elements,
        setElements,

        selected,
        setSelected,

        clipboard,
        setClipboard,

        undo,
        setUndo,

        redo,
        setRedo,

        labelData,
        setLabelData

      }}
    >

      {children}

    </DesignerContext.Provider>

  );

}


export function useDesigner() {

  return useContext(
    DesignerContext
  );

}