import {
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  MenuItem
} from "@mui/material";

import { useDesigner } from "./DesignerContext";

export default function PropertyPanel() {

  const {
    elements,
    selected,
    setElements
  } = useDesigner();

  const element =
    elements.find(e => e.id === selected);

  function update(field: string, value: any) {

    if (!element) return;

    setElements(
      elements.map(el =>
        el.id === element.id
          ? {
              ...el,
              [field]: value
            }
          : el
      )
    );

  }

  if (!element) {

    return (

      <Card>

        <CardContent>

          <Typography>

            Seleccione un objeto

          </Typography>

        </CardContent>

      </Card>

    );

  }

  return (

    <Card>

      <CardContent>

        <Stack spacing={2}>

          <Typography
            variant="h6"
          >

            Propiedades

          </Typography>

          <TextField
            label="Texto"
            value={element.text}
            onChange={(e) =>
              update(
                "text",
                e.target.value
              )
            }
          />

          <TextField
            label="Posición X"
            type="number"
            value={element.x}
            onChange={(e) =>
              update(
                "x",
                Number(e.target.value)
              )
            }
          />

          <TextField
            label="Posición Y"
            type="number"
            value={element.y}
            onChange={(e) =>
              update(
                "y",
                Number(e.target.value)
              )
            }
          />

          <TextField
            label="Ancho"
            type="number"
            value={element.width}
            onChange={(e) =>
              update(
                "width",
                Number(e.target.value)
              )
            }
          />

          <TextField
            label="Alto"
            type="number"
            value={element.height}
            onChange={(e) =>
              update(
                "height",
                Number(e.target.value)
              )
            }
          />

          <TextField
            label="Rotación"
            type="number"
            value={element.rotation}
            onChange={(e) =>
              update(
                "rotation",
                Number(e.target.value)
              )
            }
          />

          <TextField
            label="Tamaño letra"
            type="number"
            value={element.fontSize}
            onChange={(e) =>
              update(
                "fontSize",
                Number(e.target.value)
              )
            }
          />

          <TextField
            select
            label="Negrita"
            value={element.fontWeight}
            onChange={(e) =>
              update(
                "fontWeight",
                Number(e.target.value)
              )
            }
          >

            <MenuItem value={400}>
              Normal
            </MenuItem>

            <MenuItem value={700}>
              Negrita
            </MenuItem>

          </TextField>

          <TextField
            type="color"
            label="Color"
            value={element.color}
            onChange={(e) =>
              update(
                "color",
                e.target.value
              )
            }
            InputLabelProps={{
              shrink: true
            }}
          />

        </Stack>

      </CardContent>

    </Card>

  );

}