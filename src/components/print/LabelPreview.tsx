import { Box, Typography } from "@mui/material";
import type { DesignerElement } from "../designer/DesignerTypes";

interface Props {
  elements: DesignerElement[];
}

export default function LabelPreview({ elements }: Props) {

  return (

    <Box
      sx={{
        position: "relative",
        width: 520,
        height: 340,
        background: "#fff",
        border: "1px solid #000",
        overflow: "hidden"
      }}
    >

      {elements.map(el => (

        <Box
          key={el.id}
          sx={{
            position: "absolute",
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            transform: `rotate(${el.rotation}deg)`
          }}
        >

          {el.type === "barcode" ? (

            <Box>

              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: 28,
                  lineHeight: 1
                }}
              >
                ||||||||||||||||||||||||||||
              </Typography>

              <Typography
                align="center"
                fontSize={12}
              >
                {el.text}
              </Typography>

            </Box>

          ) : (

            <Typography
              sx={{
                fontSize: el.fontSize,
                fontWeight: el.fontWeight,
                color: el.color
              }}
            >
              {el.text}
            </Typography>

          )}

        </Box>

      ))}

    </Box>

  );

}