import {
  Paper,
  IconButton,
  Divider,
  Tooltip
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ImageIcon from "@mui/icons-material/Image";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

interface Props {

  onSave: () => void;

  onText: () => void;

  onSKU: () => void;

  onDescription: () => void;

  onBarcode: () => void;

  onQR: () => void;

  onLogo: () => void;

  onDuplicate: () => void;

  onDelete: () => void;

  onUndo: () => void;

  onRedo: () => void;

  onZoomIn: () => void;

  onZoomOut: () => void;

  canDelete: boolean;

}

export default function DesignerToolbar({

  onSave,

  onText,

  onSKU,

  onDescription,

  onBarcode,

  onQR,

  onLogo,

  onDuplicate,

  onDelete,

  onUndo,

  onRedo,

  onZoomIn,

  onZoomOut,

  canDelete

}: Props) {

  return (

    <Paper

      sx={{

        p:1,

        mb:2,

        display:"flex",

        gap:1,

        alignItems:"center"

      }}

    >

      <Tooltip title="Guardar">

        <IconButton onClick={onSave}>

          <SaveIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="Texto">

        <IconButton onClick={onText}>

          <TextFieldsIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="SKU">

        <IconButton onClick={onSKU}>

          <ViewWeekIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="Descripción">

        <IconButton onClick={onDescription}>

          <TextFieldsIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="Código barras">

        <IconButton onClick={onBarcode}>

          <ViewWeekIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="QR">

        <IconButton onClick={onQR}>

          <QrCode2Icon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="Logo">

        <IconButton onClick={onLogo}>

          <ImageIcon/>

        </IconButton>

      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Duplicar">

        <IconButton onClick={onDuplicate}>

          <ContentCopyIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="Eliminar">

        <IconButton

          color="error"

          disabled={!canDelete}

          onClick={onDelete}

        >

          <DeleteIcon/>

        </IconButton>

      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Deshacer">

        <IconButton onClick={onUndo}>

          <UndoIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="Rehacer">

        <IconButton onClick={onRedo}>

          <RedoIcon/>

        </IconButton>

      </Tooltip>

      <Divider orientation="vertical" flexItem />

      <Tooltip title="Zoom -">

        <IconButton onClick={onZoomOut}>

          <ZoomOutIcon/>

        </IconButton>

      </Tooltip>

      <Tooltip title="Zoom +">

        <IconButton onClick={onZoomIn}>

          <ZoomInIcon/>

        </IconButton>

      </Tooltip>

    </Paper>

  );

}