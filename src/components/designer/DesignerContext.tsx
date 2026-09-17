import {
  createContext,
  useContext,
  useState
} from "react";

import type { ReactNode } from "react";
import type { DesignerElement } from "./DesignerTypes";

export interface LabelData {

  ORDER: string;

  SKU: string;

  DESCRIPTION: string;

  BARCODE: string;

  QR: string;

  DATE: string;

  LOT: string;

  COIL: string;

  ROLLS: string;

}

interface Context {

  elements: DesignerElement[];

  setElements: React.Dispatch<
    React.SetStateAction<DesignerElement[]>
  >;

  selected: number | null;

  setSelected: React.Dispatch<
    React.SetStateAction<number | null>
  >;

  clipboard: DesignerElement | null;

  setClipboard: React.Dispatch<
    React.SetStateAction<DesignerElement | null>
  >;

  undo: DesignerElement[][];

  setUndo: React.Dispatch<
    React.SetStateAction<DesignerElement[][]>
  >;

  redo: DesignerElement[][];

  setRedo: React.Dispatch<
    React.SetStateAction<DesignerElement[][]>
  >;

  labelData: LabelData;

  setLabelData: React.Dispatch<
    React.SetStateAction<LabelData>
  >;

}

const DesignerContext =
  createContext({} as Context);

export function DesignerProvider({

  children

}: {

  children: ReactNode;

}) {

  const [elements, setElements] =
    useState<DesignerElement[]>([]);

  const [selected, setSelected] =
    useState<number | null>(null);

  const [clipboard, setClipboard] =
    useState<DesignerElement | null>(null);

  const [undo, setUndo] =
    useState<DesignerElement[][]>([]);

  const [redo, setRedo] =
    useState<DesignerElement[][]>([]);

  /*
   * DATOS DE PRUEBA
   *
   * Estos datos se utilizan mientras
   * trabajamos con el diseñador.
   *
   * Posteriormente serán sustituidos
   * automáticamente por los datos de
   * la Orden de Producción.
   */

  const [labelData, setLabelData] =
    useState<LabelData>({

      ORDER: "405053310",

      SKU: "123456789",

      DESCRIPTION:
        "Producto de prueba",

      BARCODE:
        "123456789",

      QR:
        "123456789",

      DATE:
        "300726",

      LOT:
        "260730",

      COIL:
        "001",

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