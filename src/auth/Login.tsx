import {
  useEffect,
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  useNavigate
} from "react-router-dom";

import {
  useAuth
} from "./AuthContext";


export default function Login() {

  const {
    login
  } = useAuth();

  const navigate =
    useNavigate();


  const [
    username,
    setUsername
  ] = useState("");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  const [
    loggingIn,
    setLoggingIn
  ] = useState(false);


  const [
    currentDate,
    setCurrentDate
  ] = useState(
    new Date()
  );


  /*
   * ==================================================
   * FECHA Y HORA ACTUAL
   * ==================================================
   */

  useEffect(() => {

    const timer =
      window.setInterval(
        () => {

          setCurrentDate(
            new Date()
          );

        },
        1000
      );


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, []);


  /*
   * ==================================================
   * LOGIN
   * ==================================================
   */

  async function handleLogin() {

    if (
      loggingIn
    ) {

      return;

    }


    if (
      !username.trim()
      ||
      !password
    ) {

      setError(
        "Introduce usuario y contraseña"
      );

      return;

    }


    setLoggingIn(
      true
    );


    setError(
      ""
    );


    try {

      const ok =
        await login(
          username,
          password
        );


      if (
        !ok
      ) {

        setError(
          "Usuario o contraseña incorrectos"
        );

        return;

      }


      setError(
        ""
      );


      /*
       * Después de iniciar sesión correctamente,
       * siempre volvemos a la pantalla de Inicio.
       *
       * replace: true evita conservar la página
       * anterior como destino de navegación.
       */
      navigate(
        "/",
        {
          replace: true
        }
      );

    }
    catch (
      error
    ) {

      console.error(
        "Error en el inicio de sesión:",
        error
      );


      setError(
        "No se pudo conectar con el servidor"
      );

    }
    finally {

      setLoggingIn(
        false
      );

    }

  }


  /*
   * ==================================================
   * FORMATO FECHA
   * ==================================================
   */

  const dateText =
    currentDate.toLocaleDateString(
      "es-ES",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );


  /*
   * ==================================================
   * FORMATO HORA
   * ==================================================
   */

  const timeText =
    currentDate.toLocaleTimeString(
      "es-ES",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );


  return (

    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#F4F6F8",

        boxSizing: "border-box",

        overflow: "hidden",

        p: {
          xs: 2,
          md: 4
        }
      }}
    >

      <Box
        sx={{
          width: "100%",

          maxWidth: 1250,

          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) minmax(380px, 440px)"
          },

          alignItems: "center",

          gap: {
            xs: 4,
            md: 8
          },

          boxSizing: "border-box"
        }}
      >


        {/* ==================================================
            IZQUIERDA
            LOGO RIVULIS
           ================================================== */}

        <Box
          sx={{
            minWidth: 0,

            display: {
              xs: "none",
              md: "flex"
            },

            alignItems: "center",

            justifyContent: "center"
          }}
        >

          <Box
            component="img"

            src="/images/rivulis-logo.png"

            alt="Rivulis"

            sx={{
              display: "block",

              width: "100%",

              maxWidth: 560,

              maxHeight: "65vh",

              objectFit: "contain"
            }}
          />

        </Box>


        {/* ==================================================
            DERECHA
            LOGIN
           ================================================== */}

        <Box
          sx={{
            width: "100%",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            minWidth: 0
          }}
        >

          <Card
            elevation={4}

            sx={{
              width: "100%",

              maxWidth: 420,

              borderRadius: 3,

              overflow: "hidden",

              boxSizing: "border-box"
            }}
          >


            {/* BARRA VERDE SUPERIOR */}

            <Box
              sx={{
                width: "100%",

                height: 7,

                backgroundColor: "#0B7A3B"
              }}
            />


            <CardContent
              sx={{
                p: {
                  xs: 3,
                  md: 4
                },

                "&:last-child": {
                  pb: {
                    xs: 3,
                    md: 4
                  }
                }
              }}
            >

              <Stack
                spacing={3}
              >


                {/* ==================================================
                    CABECERA
                   ================================================== */}

                <Box>

                  <Typography
                    sx={{
                      color: "#0B7A3B",

                      fontSize: {
                        xs: 25,
                        md: 29
                      },

                      fontWeight: 700,

                      textAlign: "center",

                      letterSpacing: 0.5
                    }}
                  >

                    PROGRAMA ETIQUETAS

                  </Typography>


                  <Typography
                    align="center"

                    color="text.secondary"

                    sx={{
                      mt: 1.5,

                      fontSize: 16
                    }}
                  >

                    Inicio de sesión

                  </Typography>


                  {/* FECHA Y HORA */}

                  <Box
                    sx={{
                      mt: 2,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      gap: 1
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: 14,

                        fontWeight: 500,

                        color: "#5F6B65"
                      }}
                    >

                      {dateText}

                    </Typography>


                    <Typography
                      sx={{
                        fontSize: 14,

                        color: "#A0A7A3"
                      }}
                    >

                      •

                    </Typography>


                    <Typography
                      sx={{
                        fontSize: 14,

                        fontWeight: 600,

                        color: "#0B7A3B",

                        fontVariantNumeric:
                          "tabular-nums"
                      }}
                    >

                      {timeText}

                    </Typography>

                  </Box>

                </Box>


                {/* ==================================================
                    ERROR
                   ================================================== */}

                {
                  error !== ""
                  &&
                  (

                    <Alert
                      severity="error"
                    >

                      {error}

                    </Alert>

                  )
                }


                {/* ==================================================
                    USUARIO
                   ================================================== */}

                <TextField
                  label="Usuario"

                  fullWidth

                  autoFocus

                  disabled={
                    loggingIn
                  }

                  value={
                    username
                  }

                  onChange={
                    event =>

                      setUsername(
                        event.target.value
                      )
                  }
                />


                {/* ==================================================
                    CONTRASEÑA
                   ================================================== */}

                <TextField
                  type="password"

                  label="Contraseña"

                  fullWidth

                  disabled={
                    loggingIn
                  }

                  value={
                    password
                  }

                  onChange={
                    event =>

                      setPassword(
                        event.target.value
                      )
                  }

                  onKeyDown={
                    event => {

                      if (
                        event.key === "Enter"
                      ) {

                        void handleLogin();

                      }

                    }
                  }
                />


                {/* ==================================================
                    BOTÓN
                   ================================================== */}

                <Button
                  variant="contained"

                  size="large"

                  fullWidth

                  disabled={
                    loggingIn
                  }

                  onClick={
                    () => {

                      void handleLogin();

                    }
                  }

                  startIcon={
                    loggingIn
                      ? (
                        <CircularProgress
                          size={20}
                          color="inherit"
                        />
                      )
                      : undefined
                  }

                  sx={{
                    height: 52,

                    fontSize: 16,

                    fontWeight: 600,

                    backgroundColor:
                      "#0B7A3B",

                    "&:hover": {
                      backgroundColor:
                        "#086530"
                    }
                  }}
                >

                  {
                    loggingIn
                      ? "ENTRANDO..."
                      : "ENTRAR"
                  }

                </Button>


                <Typography
                  variant="caption"

                  align="center"

                  color="text.secondary"
                >

                  Rivulis Irrigation

                </Typography>


              </Stack>

            </CardContent>

          </Card>

        </Box>


      </Box>

    </Box>

  );

}