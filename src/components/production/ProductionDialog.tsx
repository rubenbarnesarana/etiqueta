import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem
} from "@mui/material";

import { getProducts } from "../../services/ProductStorage";
import { getTemplates } from "../../services/TemplateStorage";

interface Props {

  open:boolean;

  onClose:()=>void;

  onSave:(order:any)=>void;

  editing?:any;

}

export default function ProductionDialog({

  open,

  onClose,

  onSave,

  editing

}:Props){

  const products=getProducts();

  const templates=getTemplates();

  const [order,setOrder]=useState("");

  const [sku,setSku]=useState("");

  const [product,setProduct]=useState("");

  const [template,setTemplate]=useState("");

  const [templateId,setTemplateId]=useState(0);

  const [rolls,setRolls]=useState("");

  const [firstCoil,setFirstCoil]=useState("1");

  const [printer,setPrinter]=useState("BA420");

  useEffect(()=>{

    if(editing){

      setOrder(editing.order);

      setSku(editing.sku);

      setProduct(editing.product);

      setTemplateId(editing.templateId ?? 0);

      setTemplate(

        templates.find(t=>t.id===editing.templateId)?.name ?? ""

      );

      setRolls(String(editing.rolls));

      setFirstCoil(String(editing.firstCoil));

      setPrinter(editing.printer);

    }

  },[editing]);

  function changeSKU(value:string){

    setSku(value);

    const p=products.find(

      x=>x.sapCode===value

    );

    if(!p)return;

    setProduct(p.description);

    setTemplateId(p.templateId);

    setTemplate(

      templates.find(t=>t.id===p.templateId)?.name ?? ""

    );

  }

  function save(){

    onSave({

      id:editing?.id ?? Date.now(),

      order,

      sku,

      product,

      templateId,

      rolls:Number(rolls),

      printed:editing?.printed ?? 0,

      firstCoil:Number(firstCoil),

      printer,

      status:editing?.status ?? "ABIERTA"

    });

  }

  return(

<Dialog

open={open}

onClose={onClose}

maxWidth="md"

fullWidth

>

<DialogTitle>

{editing?"Editar":"Nueva"} Orden

</DialogTitle>

<DialogContent>

<Grid

container

spacing={2}

mt={1}

>

<Grid size={{xs:12,md:6}}>

<TextField

fullWidth

label="Orden SAP"

value={order}

onChange={(e)=>setOrder(e.target.value)}

/>

</Grid>

<Grid size={{xs:12,md:6}}>

<TextField

select

fullWidth

label="SKU"

value={sku}

onChange={(e)=>changeSKU(e.target.value)}

>

{products.map(p=>(

<MenuItem

key={p.id}

value={p.sapCode}

>

{p.sapCode} - {p.description}

</MenuItem>

))}

</TextField>

</Grid>

<Grid size={{xs:12,md:6}}>

<TextField

fullWidth

label="Producto"

value={product}

InputProps={{

readOnly:true

}}

/>

</Grid>

<Grid size={{xs:12,md:6}}>

<TextField

fullWidth

label="Plantilla"

value={template}

InputProps={{

readOnly:true

}}

/>

</Grid>

<Grid size={{xs:12,md:4}}>

<TextField

fullWidth

type="number"

label="Total Rollos"

value={rolls}

onChange={(e)=>setRolls(e.target.value)}

/>

</Grid>

<Grid size={{xs:12,md:4}}>

<TextField

fullWidth

type="number"

label="Bobina Inicial"

value={firstCoil}

onChange={(e)=>setFirstCoil(e.target.value)}

/>

</Grid>

<Grid size={{xs:12,md:4}}>

<TextField

select

fullWidth

label="Impresora"

value={printer}

onChange={(e)=>setPrinter(e.target.value)}

>

<MenuItem value="BA420">

Toshiba BA420

</MenuItem>

<MenuItem value="BA400">

Toshiba BA400

</MenuItem>

</TextField>

</Grid>

</Grid>

</DialogContent>

<DialogActions>

<Button onClick={onClose}>

Cancelar

</Button>

<Button

variant="contained"

onClick={save}

>

Guardar

</Button>

</DialogActions>

</Dialog>

);

}