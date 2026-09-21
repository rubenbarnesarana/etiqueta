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
   * TEXTO SUPERIOR
   * FORMATO 1 / ROLLOS
   */
  UPPER_TEXT: string;


  /*
   * ==================================================
   * CAMPOS FORMATO 2 / BOBINAS
   * ==================================================
   */

  /*
   * Descripción original del SKU.
   *
   * Ejemplo:
   * EXCEL 16/8/1.2/0.15 2300m
   */
  COIL_DESCRIPTION: string;


  /*
   * Información técnica automática.
   *
   * Ejemplo:
   *
   * EXCEL 16/8 MIL 15 CM
   * 1.2 L/H at 1 Bar - B-2300M
   * EMITTING PIPE ISO 9261
   * Max Pressure 1.2 Bar
   */
  COIL_TECHNICAL: string;


  /*
   * Texto legal / técnico fijo.
   *
   * El año se genera automáticamente
   * en Producción.
   */
  COIL_LEGAL: string;


  /*
   * Origen y planta.
   */
  COIL_ORIGIN: string;


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
   * Estos datos sirven únicamente para
   * visualizar los campos mientras se
   * diseña una plantilla.
   *
   * En Producción serán sustituidos
   * automáticamente por los datos reales
   * de la orden y del SKU.
   */

  const [
    labelData,
    setLabelData
  ] =
    useState<LabelData>({

      /*
       * ==================================================
       * PRODUCTION ORDER
       * ==================================================
       */

      ORDER:
        "89000050967",


      /*
       * ==================================================
       * SKU
       * ==================================================
       */

      SKU:
        "101090266",


      /*
       * ==================================================
       * FORMATO 1
       * DESCRIPCIÓN INFERIOR
       * ==================================================
       */

      DESCRIPTION:
        "AS 20/47/3.8/0.50 R-300M",


      /*
       * ==================================================
       * FORMATO 1
       * TEXTO SUPERIOR
       * ==================================================
       */

      UPPER_TEXT:
        "AMNON PC AS 20/3.8\n50CM E-1.2MM R-300M\nEmitting Pipe\nMax Pressure 3.5 BAR\nISO 9261",


      /*
       * ==================================================
       * FORMATO 2
       * DESCRIPCIÓN SKU
       * ==================================================
       */

      COIL_DESCRIPTION:
        "EXCEL 16/8/1.2/0.15 2300m",


      /*
       * ==================================================
       * FORMATO 2
       * INFORMACIÓN TÉCNICA
       * ==================================================
       */

      COIL_TECHNICAL:
        "EXCEL 16/8 MIL 15 CM\n1.2 L/H at 1 Bar - B-2300M\nEMITTING PIPE ISO 9261\nMax Pressure 1.2 Bar",


      /*
       * ==================================================
       * FORMATO 2
       * TEXTO LEGAL
       * ==================================================
       */

      COIL_LEGAL:
        "Non reusable and non-compensated emitting pipe.\nOperation at low pressure: regular.\nYear:2026",


      /*
       * ==================================================
       * FORMATO 2
       * ORIGEN / PLANTA
       * ==================================================
       */

      COIL_ORIGIN:
        "MADE IN SPAIN     QI02",


      /*
       * ==================================================
       * CÓDIGO DE BARRAS
       * ==================================================
       */

      BARCODE:
        "101090266",


      /*
       * ==================================================
       * QR
       * ==================================================
       */

      QR:
        "101090266",


      /*
       * ==================================================
       * FECHA
       * ==================================================
       */

      DATE:
        "210926",


      /*
       * ==================================================
       * LOT NUMBER
       * ==================================================
       *
       * En producción será la fecha del día
       * generada automáticamente.
       */

      LOT:
        "260921",


      /*
       * ==================================================
       * COIL NUMBER
       * ==================================================
       */

      COIL:
        "1",


      /*
       * ==================================================
       * TOTAL ROLLOS / BOBINAS
       * ==================================================
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