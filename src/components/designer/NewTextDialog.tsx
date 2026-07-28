import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";

interface Props {

  open: boolean;

  onClose: () => void;

  onAccept: (text: string) => void;

}

export default function NewTextDialog({

  open,

  onClose,

  onAccept

}: Props) {

  const [text, setText] = useState("");

  function accept() {

    onAccept(text);

    setText("");

  }

  return (

    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >

      <DialogTitle>

        🔤 Nuevo texto

      </DialogTitle>

      <DialogContent>

        <TextField

          autoFocus

          fullWidth

          label="Texto"

          sx={{ mt: 2 }}

          value={text}

          onChange={(e) => setText(e.target.value)}

        />

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose}>

          Cancelar

        </Button>

        <Button

          variant="contained"

          color="success"

          onClick={accept}

        >

          Aceptar

        </Button>

      </DialogActions>

    </Dialog>

  );

}