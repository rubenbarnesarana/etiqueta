import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import { useAuth } from "./AuthContext";

export default function Login() {

  const { login } = useAuth();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  function handleLogin() {

    const ok = login(username, password);

    if (!ok) {

      setError("Usuario o contraseña incorrectos");

      return;

    }

    setError("");

  }

  return (

    <Box

      sx={{

        width: "100vw",

        height: "100vh",

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        backgroundColor: "#F4F6F8"

      }}

    >

      <Card

        sx={{

          width: 420,

          borderRadius: 3

        }}

      >

        <CardContent>

          <Stack spacing={3}>

            <Typography

              variant="h4"

              align="center"

              fontWeight="bold"

              color="#0B7A3B"

            >

              ETIQUETA

            </Typography>

            <Typography

              align="center"

              color="text.secondary"

            >

              Inicio de sesión

            </Typography>

            {error !== "" && (

              <Alert severity="error">

                {error}

              </Alert>

            )}

            <TextField

              label="Usuario"

              fullWidth

              value={username}

              onChange={(e) =>

                setUsername(e.target.value)

              }

            />

            <TextField

              type="password"

              label="Contraseña"

              fullWidth

              value={password}

              onChange={(e) =>

                setPassword(e.target.value)

              }

              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  handleLogin();

                }

              }}

            />

            <Button

              variant="contained"

              size="large"

              onClick={handleLogin}

              sx={{

                backgroundColor: "#0B7A3B",

                "&:hover": {

                  backgroundColor: "#086530"

                }

              }}

            >

              ENTRAR

            </Button>

          </Stack>

        </CardContent>

      </Card>

    </Box>

  );

}