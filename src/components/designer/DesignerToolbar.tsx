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
import NumbersIcon from "@mui/icons-material/Numbers";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";


interface Props {

  onSave: () => void;

  onText: () => void;

  onOrder: () => void;

  onLot: () => void;

  onCoil: () => void;

  onSKU: () => void;

  onDescription: () => void;

  /*
   * TEXTO SUPERIOR
   * Se utilizará para UPPER_TEXT
   */
  onUpperText: () => void;

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

  onOrder,

  onLot,

  onCoil,

  onSKU,

  onDescription,

  onUpperText,

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
        p: 1,
        mb: 2,

        display: "flex",

        gap: 1,

        alignItems: "center",

        flexWrap: "wrap"
      }}
    >

      {/* GUARDAR */}

      <Tooltip title="Guardar plantilla">

        <IconButton
          onClick={onSave}
        >
          <SaveIcon />
        </IconButton>

      </Tooltip>


      <Divider
        orientation="vertical"
        flexItem
      />


      {/* TEXTO LIBRE */}

      <Tooltip title="Texto libre">

        <IconButton
          onClick={onText}
        >
          <TextFieldsIcon />
        </IconButton>

      </Tooltip>


      {/* ORDEN SAP */}

      <Tooltip title="Production Order">

        <IconButton
          onClick={onOrder}
        >
          <NumbersIcon />
        </IconButton>

      </Tooltip>


      {/* LOTE */}

      <Tooltip title="Lot Number">

        <IconButton
          onClick={onLot}
        >
          <Inventory2Icon />
        </IconButton>

      </Tooltip>


      {/* BOBINA */}

      <Tooltip title="Coil Number">

        <IconButton
          onClick={onCoil}
        >
          <ConfirmationNumberIcon />
        </IconButton>

      </Tooltip>


      {/* SKU */}

      <Tooltip title="SKU">

        <IconButton
          onClick={onSKU}
        >
          <ViewWeekIcon />
        </IconButton>

      </Tooltip>


      {/* DESCRIPCIÓN INFERIOR */}

      <Tooltip title="Descripción inferior">

        <IconButton
          onClick={onDescription}
        >
          <TextFieldsIcon />
        </IconButton>

      </Tooltip>


      {/* TEXTO SUPERIOR */}

      <Tooltip title="Texto superior (180°)">

        <IconButton
          onClick={onUpperText}
        >
          <RotateLeftIcon />
        </IconButton>

      </Tooltip>


      {/* CÓDIGO DE BARRAS */}

      <Tooltip title="Código de barras">

        <IconButton
          onClick={onBarcode}
        >
          <ViewWeekIcon />
        </IconButton>

      </Tooltip>


      {/* QR */}

      <Tooltip title="QR">

        <IconButton
          onClick={onQR}
        >
          <QrCode2Icon />
        </IconButton>

      </Tooltip>


      {/* LOGO */}

      <Tooltip title="Logo">

        <IconButton
          onClick={onLogo}
        >
          <ImageIcon />
        </IconButton>

      </Tooltip>


      <Divider
        orientation="vertical"
        flexItem
      />


      {/* DUPLICAR */}

      <Tooltip title="Duplicar">

        <IconButton
          onClick={onDuplicate}
        >
          <ContentCopyIcon />
        </IconButton>

      </Tooltip>


      {/* ELIMINAR */}

      <Tooltip title="Eliminar">

        <IconButton
          color="error"
          disabled={!canDelete}
          onClick={onDelete}
        >
          <DeleteIcon />
        </IconButton>

      </Tooltip>


      <Divider
        orientation="vertical"
        flexItem
      />


      {/* DESHACER */}

      <Tooltip title="Deshacer">

        <IconButton
          onClick={onUndo}
        >
          <UndoIcon />
        </IconButton>

      </Tooltip>


      {/* REHACER */}

      <Tooltip title="Rehacer">

        <IconButton
          onClick={onRedo}
        >
          <RedoIcon />
        </IconButton>

      </Tooltip>


      <Divider
        orientation="vertical"
        flexItem
      />


      {/* ZOOM - */}

      <Tooltip title="Zoom -">

        <IconButton
          onClick={onZoomOut}
        >
          <ZoomOutIcon />
        </IconButton>

      </Tooltip>


      {/* ZOOM + */}

      <Tooltip title="Zoom +">

        <IconButton
          onClick={onZoomIn}
        >
          <ZoomInIcon />
        </IconButton>

      </Tooltip>

    </Paper>

  );
}