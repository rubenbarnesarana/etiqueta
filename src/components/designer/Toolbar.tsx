import {
  Paper,
  Stack,
  Button,
  Divider
} from "@mui/material";

interface Props {
  onAddText: () => void;
  onAddField: () => void;
  onDelete: () => void;
}

export default function Toolbar({
  onAddText,
  onAddField,
  onDelete
}: Props) {

  return (

    <Paper
      sx={{
        p: 1,
        mb: 2
      }}
    >

      <Stack
        direction="row"
        spacing={1}
      >

        <Button
          variant="contained"
          onClick={onAddText}
        >
          Texto
        </Button>

        <Button
          variant="contained"
          onClick={onAddField}
        >
          Campo
        </Button>

        <Divider
          orientation="vertical"
          flexItem
        />

        <Button
          color="error"
          variant="contained"
          onClick={onDelete}
        >
          Eliminar
        </Button>

      </Stack>

    </Paper>

  );

}