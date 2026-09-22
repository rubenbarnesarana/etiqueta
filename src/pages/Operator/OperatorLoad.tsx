import {
  useMemo,
  useRef,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PrintIcon from "@mui/icons-material/Print";

import {
  findOrder,
  getOrders
} from "../../services/OrderStorage";


export default function OperatorLoad() {

  const navigate =
    useNavigate();


  const [
    orderNumber,
    setOrderNumber
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  const [
    autocompleteOpen,
    setAutocompleteOpen
  ] = useState(false);


  const orderInputRef =
    useRef<
      HTMLInputElement |
      null
    >(null);


  /*
   * ==================================================
   * HISTÓRICO DE ÓRDENES
   * ==================================================
   */

  const orderHistory =
    useMemo(
      () =>
        [...getOrders()]
          .sort(
            (
              a,
              b
            ) =>
              b.id -
              a.id
          )
          .map(
            order =>
              order.order
          ),
      []
    );


  /*
   * ==================================================
   * ENFOCAR CAMPO
   * ==================================================
   */

  function focusOrderInput() {

    setTimeout(
      () => {

        orderInputRef
          .current
          ?.focus();


        orderInputRef
          .current
          ?.select();

      },
      100
    );

  }


  /*
   * ==================================================
   * CARGAR ORDEN
   * ==================================================
   */

  function loadOrder() {

    const number =
      orderNumber.trim();


    if (!number) {

      setError(
        "Introduce una orden de producción"
      );

      focusOrderInput();

      return;

    }


    const productionOrder =
      findOrder(
        number
      );


    if (!productionOrder) {

      setError(
        "Orden de producción no encontrada"
      );

      focusOrderInput();

      return;

    }


    setError("");

    setAutocompleteOpen(
      false
    );


    navigate(
      `/operator/print?order=${encodeURIComponent(
        productionOrder.order
      )}`
    );

  }


  return (

    <Box
      sx={{
        maxWidth: 900,
        mx: "auto"
      }}
    >

      {/* =============================================
          VOLVER
          ============================================= */}

      <Button
        variant="outlined"
        startIcon={
          <ArrowBackIcon />
        }
        onClick={
          () =>
            navigate(
              "/operator"
            )
        }
        sx={{
          mb: 3,
          fontWeight: 700
        }}
      >

        VOLVER

      </Button>


      {/* =============================================
          CABECERA
          ============================================= */}

      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2
        }}
      >

        <PrecisionManufacturingIcon
          sx={{
            fontSize: 46,
            color: "#0B7A3B"
          }}
        />


        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
          >
            Imprimir Orden
          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >
            Carga una orden de producción para imprimir sus etiquetas
          </Typography>

        </Box>

      </Box>


      {/* =============================================
          TARJETA
          ============================================= */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid #E0E0E0",

          borderRadius: 3,

          overflow: "hidden"
        }}
      >

        {/* BARRA VERDE */}

        <Box
          sx={{
            height: 7,
            backgroundColor:
              "#0B7A3B"
          }}
        />


        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 5
            },

            "&:last-child": {
              pb: {
                xs: 3,
                md: 5
              }
            }
          }}
        >

          <Typography
            variant="h6"
            fontWeight={700}
            textAlign="center"
            sx={{
              mb: 3
            }}
          >

            Orden de Producción

          </Typography>


          <Autocomplete
            freeSolo
            open={
              autocompleteOpen
            }
            onOpen={
              () =>
                setAutocompleteOpen(
                  true
                )
            }
            onClose={
              () =>
                setAutocompleteOpen(
                  false
                )
            }
            options={
              orderHistory
            }
            value={
              orderNumber
            }
            inputValue={
              orderNumber
            }
            onInputChange={(
              _event,
              value
            ) => {

              setOrderNumber(
                value
              );


              if (error) {

                setError("");

              }

            }}
            renderInput={
              params => (

                <TextField
                  {...params}
                  inputRef={
                    orderInputRef
                  }
                  fullWidth
                  autoFocus
                  label="Orden de Producción"
                  placeholder="Ej. 89000051035"
                  onKeyDown={
                    event => {

                      if (
                        event.key ===
                        "Enter"
                      ) {

                        event.preventDefault();

                        loadOrder();

                      }

                    }
                  }
                />

              )
            }
          />


          {error && (

            <Alert
              severity="error"
              sx={{
                mt: 2
              }}
            >

              {error}

            </Alert>

          )}


          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={
              <PrintIcon />
            }
            onClick={
              loadOrder
            }
            sx={{
              mt: 3,
              height: 56,
              fontWeight: 700,
              fontSize: 16,
              backgroundColor:
                "#0B7A3B",

              "&:hover": {
                backgroundColor:
                  "#086530"
              }
            }}
          >

            CARGAR ORDEN

          </Button>

        </CardContent>

      </Card>


      {/* =============================================
          LOGO
          ============================================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 5
        }}
      >

        <Box
          component="img"
          src="/images/rivulis-logo.png"
          alt="Rivulis"
          sx={{
            width: 170,
            maxHeight: 80,
            objectFit: "contain"
          }}
        />

      </Box>

    </Box>

  );

}