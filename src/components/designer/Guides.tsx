import { Box } from "@mui/material";

interface Props {

  vertical:number|null;

  horizontal:number|null;

}

export default function Guides({

  vertical,

  horizontal

}:Props){

  return(

    <>

      {vertical!==null && (

        <Box

          sx={{

            position:"absolute",

            left:vertical,

            top:0,

            width:1,

            height:"100%",

            bgcolor:"#0094ff",

            pointerEvents:"none",

            zIndex:9999

          }}

        />

      )}

      {horizontal!==null && (

        <Box

          sx={{

            position:"absolute",

            top:horizontal,

            left:0,

            width:"100%",

            height:1,

            bgcolor:"#0094ff",

            pointerEvents:"none",

            zIndex:9999

          }}

        />

      )}

    </>

  );

}