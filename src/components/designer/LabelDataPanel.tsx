import {
  Card,
  CardContent,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import { useDesigner } from "./DesignerContext";

export default function LabelDataPanel() {

  const {
    labelData,
    setLabelData
  } = useDesigner();

  function update(
    field: keyof typeof labelData,
    value: string
  ) {

    setLabelData(prev => ({
      ...prev,
      [field]: value
    }));

  }

  return (

    <Card>

      <CardContent>

        <Stack spacing={2}>

          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Datos de la etiqueta
          </Typography>

          <TextField
            label="SKU"
            value={labelData.SKU}
            onChange={(e) =>
              update("SKU", e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Descripción"
            value={labelData.DESCRIPTION}
            onChange={(e) =>
              update(
                "DESCRIPTION",
                e.target.value
              )
            }
            fullWidth
          />

          <TextField
            label="Fecha"
            value={labelData.DATE}
            onChange={(e) =>
              update(
                "DATE",
                e.target.value
              )
            }
            fullWidth
          />

          <TextField
            label="Lote"
            value={labelData.LOT}
            onChange={(e) =>
              update(
                "LOT",
                e.target.value
              )
            }
            fullWidth
          />

          <TextField
            label="Bobina"
            value={labelData.COIL}
            onChange={(e) =>
              update(
                "COIL",
                e.target.value
              )
            }
            fullWidth
          />

          <TextField
            label="Total rollos"
            value={labelData.ROLLS}
            onChange={(e) =>
              update(
                "ROLLS",
                e.target.value
              )
            }
            fullWidth
          />

        </Stack>

      </CardContent>

    </Card>

  );

}