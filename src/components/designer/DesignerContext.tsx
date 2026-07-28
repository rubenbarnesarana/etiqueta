import {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";

import type { DesignerElement } from "./DesignerTypes";

interface DesignerContextType {

  elements: DesignerElement[];

  setElements: React.Dispatch<React.SetStateAction<DesignerElement[]>>;

  selected: number | null;

  setSelected: React.Dispatch<React.SetStateAction<number | null>>;

}

const DesignerContext = createContext<DesignerContextType | undefined>(undefined);

export function DesignerProvider({
  children
}: {
  children: ReactNode;
}) {

  const [elements, setElements] = useState<DesignerElement[]>([]);

  const [selected, setSelected] = useState<number | null>(null);

  return (

    <DesignerContext.Provider
      value={{
        elements,
        setElements,
        selected,
        setSelected
      }}
    >

      {children}

    </DesignerContext.Provider>

  );

}

export function useDesigner() {

  const context = useContext(DesignerContext);

  if (!context) {

    throw new Error(
      "useDesigner debe utilizarse dentro de DesignerProvider"
    );

  }

  return context;

}