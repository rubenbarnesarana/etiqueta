import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FactoryIcon from "@mui/icons-material/Factory";
import PrintIcon from "@mui/icons-material/Print";
import CommentIcon from "@mui/icons-material/Comment";
import CloseIcon from "@mui/icons-material/Close";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  ReactNode
} from "react";

import type {
  ProductionOrder
} from "../../services/OrderStorage";

import {
  getOrders,
  getPendingQuantity,
  moveOrderInPlanning
} from "../../services/OrderStorage";

import {
  getProductionLineSetting,
  loadProductionLineSettingsFromSupabase
} from "../../services/ProductionLineStorage";

import {
  getDefaultPrinter,
  printPlanningPdf
} from "../../services/QzPrintService";

import {
  findTemplate
} from "../../services/TemplateStorage";

import {
  findProduct
} from "../../services/ProductStorage";

import {
  getAssignedTemplate
} from "../../services/ProductTemplateStorage";

import BackButton from "../../components/common/BackButton";


const PRODUCTION_LINES = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8
];


const PLANNING_COLUMNS =
  "38px 175px 105px 125px 76px 76px minmax(225px, 1.55fr) minmax(120px, 1fr) 100px 118px 90px 68px";


const RIVULIS_GREEN:
  [number, number, number] =
  [
    11,
    122,
    59
  ];


const RIVULIS_DARK_GREEN:
  [number, number, number] =
  [
    6,
    91,
    43
  ];


const RIVULIS_LIGHT_GREEN:
  [number, number, number] =
  [
    232,
    243,
    235
  ];


const PENDING_RED:
  [number, number, number] =
  [
    211,
    47,
    47
  ];


/*
 * ==================================================
 * FORMATEAR NÚMERO
 * ==================================================
 */

function formatNumber(
  value: number
): string {

  const numeric =
    Number(
      value ?? 0
    );


  if (
    !Number.isFinite(
      numeric
    )
  ) {

    return "0";

  }


  return new Intl.NumberFormat(
    "es-ES",
    {
      maximumFractionDigits:
        2
    }
  ).format(
    numeric
  );

}


/*
 * ==================================================
 * FORMATEAR CANTIDAD
 * ==================================================
 */

function formatQuantity(
  quantity: number,
  unit: "M" | "UN"
): string {

  const value =
    Number(
      quantity ?? 0
    );


  if (
    !Number.isFinite(
      value
    ) ||
    value <=
      0
  ) {

    return "-";

  }


  return unit ===
    "UN"

    ? `${formatNumber(
        value
      )} un`

    : `${formatNumber(
        value
      )} m`;

}


/*
 * ==================================================
 * CANTIDAD PENDIENTE DE LA OF
 * ==================================================
 *
 * quantity = cantidad por rollo / bobina
 *
 * pending = rollos pendientes
 *
 * cantidad pendiente =
 * rollos pendientes × cantidad por rollo
 *
 * Ejemplo:
 * 649 × 500 m = 324.500 m
 * ==================================================
 */

function getOrderPendingQuantity(
  order: ProductionOrder
): number {

  const pendingRolls =
    Math.max(
      0,
      Number(
        getPendingQuantity(
          order
        )
      )
    );


  const quantityPerRoll =
    Math.max(
      0,
      Number(
        order.quantity ??
        0
      )
    );


  return (
    pendingRolls *
    quantityPerRoll
  );

}


/*
 * ==================================================
 * NORMALIZAR TEXTO
 * ==================================================
 */

function normalizeText(
  value: string
): string {

  return value
    .toUpperCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^A-Z0-9]/g,
      ""
    );

}


/*
 * ==================================================
 * OBTENER NOMBRE PLANTILLA DE UNA ORDEN
 * ==================================================
 */

function getOrderTemplateName(
  order: ProductionOrder
): string {

  const assigned:
    any =
    getAssignedTemplate(
      order.sku
    );


  const assignedId =
    typeof assigned ===
      "number"

      ? assigned

      : Number(
          assigned?.templateId ??
          assigned?.id ??
          0
        );


  if (
    assignedId >
      0
  ) {

    const template =
      findTemplate(
        assignedId
      );


    if (
      template
    ) {

      return (
        template.name ??
        ""
      );

    }

  }


  const product =
    findProduct(
      order.sku
    );


  if (
    product?.templateId
  ) {

    const template =
      findTemplate(
        Number(
          product.templateId
        )
      );


    if (
      template
    ) {

      return (
        template.name ??
        ""
      );

    }

  }


  const orderTemplate =
    findTemplate(
      Number(
        order.templateId ??
        0
      )
    );


  return (
    orderTemplate?.name ??
    ""
  );

}


/*
 * ==================================================
 * DESCRIPCIÓN DE PLANIFICACIÓN
 * ==================================================
 *
 * Únicamente añadimos NAAN PC MAX.
 * El resto se deja exactamente como está en la OF.
 * ==================================================
 */

function getPlanningDescription(
  order: ProductionOrder
): string {

  const description =
    String(
      order.product ??
      ""
    ).trim();


  if (
    !description
  ) {

    return "-";

  }


  const templateName =
    getOrderTemplateName(
      order
    );


  const normalizedTemplate =
    normalizeText(
      templateName
    );


  if (
    !normalizedTemplate.includes(
      "NAANPCMAX"
    )
  ) {

    return description;

  }


  const normalizedDescription =
    normalizeText(
      description
    );


  if (
    normalizedDescription.startsWith(
      "NAANPCMAX"
    )
  ) {

    return description;

  }


  return (
    `NAAN PC MAX ${description}`
  );

}


/*
 * ==================================================
 * IMAGEN A DATA URL
 * ==================================================
 */

async function imageUrlToDataUrl(
  url: string
): Promise<string> {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const image =
        new Image();


      image.onload =
        () => {

          try {

            const canvas =
              document.createElement(
                "canvas"
              );


            canvas.width =
              image.naturalWidth;


            canvas.height =
              image.naturalHeight;


            const context =
              canvas.getContext(
                "2d"
              );


            if (
              !context
            ) {

              reject(
                new Error(
                  "No se pudo preparar el logo."
                )
              );


              return;

            }


            context.drawImage(
              image,
              0,
              0
            );


            resolve(
              canvas.toDataURL(
                "image/png"
              )
            );

          }
          catch (
            error
          ) {

            reject(
              error
            );

          }

        };


      image.onerror =
        () => {

          reject(
            new Error(
              "No se pudo cargar el logo Rivulis."
            )
          );

        };


      image.src =
        url;

    }
  );

}


/*
 * ==================================================
 * CELDAS
 * ==================================================
 */

function Header({
  children,
  center = false
}: {
  children: ReactNode;
  center?: boolean;
}) {

  return (

    <Typography
      variant="caption"
      fontWeight={900}
      textAlign={
        center
          ? "center"
          : "left"
      }
      sx={{
        textTransform:
          "uppercase",

        color:
          "#455A64",

        fontSize:
          10.5,

        lineHeight:
          1.15
      }}
    >
      {children}
    </Typography>

  );

}


function CellBox({
  children
}: {
  children: ReactNode;
}) {

  return (

    <Box
      sx={{
        minWidth:
          0,

        overflow:
          "visible"
      }}
    >
      {children}
    </Box>

  );

}


/*
 * ==================================================
 * COMPONENTE
 * ==================================================
 */

export default function Planning() {

  const navigate =
    useNavigate();


  const [
    orders,
    setOrders
  ] =
    useState<
      ProductionOrder[]
    >([]);


  const [
    selectedLine,
    setSelectedLine
  ] =
    useState(
      1
    );


  const [
    lineComments,
    setLineComments
  ] =
    useState(
      ""
    );


  /*
   * ==================================================
   * PDF
   * ==================================================
   */

  const [
    previewOpen,
    setPreviewOpen
  ] =
    useState(
      false
    );


  const [
    previewUrl,
    setPreviewUrl
  ] =
    useState(
      ""
    );


  const [
    previewBlob,
    setPreviewBlob
  ] =
    useState<Blob | null>(
      null
    );


  const [
    generatingPreview,
    setGeneratingPreview
  ] =
    useState(
      false
    );


  const [
    previewError,
    setPreviewError
  ] =
    useState(
      ""
    );


  const [
    printing,
    setPrinting
  ] =
    useState(
      false
    );


  const [
    defaultPrinter,
    setDefaultPrinter
  ] =
    useState(
      ""
    );


  /*
   * ==================================================
   * CARGAR ÓRDENES
   * ==================================================
   */

  function loadOrders() {

    setOrders(
      getOrders()
    );

  }


  /*
   * ==================================================
   * COMENTARIOS
   * ==================================================
   */

  function loadLineComments(
    line: number
  ) {

    const setting =
      getProductionLineSetting(
        line
      );


    setLineComments(
      setting.comments ??
      ""
    );

  }


  async function refreshLineSettings() {

    try {

      await loadProductionLineSettingsFromSupabase();


      loadLineComments(
        selectedLine
      );

    }
    catch (
      error
    ) {

      console.error(
        "No se pudieron actualizar los comentarios de línea:",
        error
      );

    }

  }


  /*
   * ==================================================
   * EVENTOS
   * ==================================================
   */

  useEffect(
    () => {

      loadOrders();


      loadLineComments(
        selectedLine
      );


      void refreshLineSettings();


      function handleFocus() {

        loadOrders();


        void refreshLineSettings();

      }


      function handleOrdersUpdated() {

        loadOrders();

      }


      function handleLineSettingsUpdated() {

        loadLineComments(
          selectedLine
        );

      }


      window.addEventListener(
        "focus",
        handleFocus
      );


      window.addEventListener(
        "productionOrdersUpdated",
        handleOrdersUpdated
      );


      window.addEventListener(
        "productionLineSettingsUpdated",
        handleLineSettingsUpdated
      );


      return () => {

        window.removeEventListener(
          "focus",
          handleFocus
        );


        window.removeEventListener(
          "productionOrdersUpdated",
          handleOrdersUpdated
        );


        window.removeEventListener(
          "productionLineSettingsUpdated",
          handleLineSettingsUpdated
        );

      };

    },
    [
      selectedLine
    ]
  );


  useEffect(
    () => {

      return () => {

        if (
          previewUrl
        ) {

          URL.revokeObjectURL(
            previewUrl
          );

        }

      };

    },
    [
      previewUrl
    ]
  );


  /*
   * ==================================================
   * ÓRDENES ACTIVAS
   * ==================================================
   */

  const activeOrders =
    useMemo(
      () =>
        orders.filter(
          order =>
            order.productionLine >=
              1 &&
            order.productionLine <=
              8 &&
            order.status !==
              "FINALIZADA" &&
            getPendingQuantity(
              order
            ) >
              0
        ),
      [
        orders
      ]
    );


  /*
   * ==================================================
   * ÓRDENES DE LA LÍNEA
   * ==================================================
   */

  const lineOrders =
    useMemo(
      () => {

        return activeOrders
          .filter(
            order =>
              order.productionLine ===
              selectedLine
          )
          .sort(
            (
              a,
              b
            ) => {

              const positionA =
                Number(
                  a.planningPosition ??
                  0
                );


              const positionB =
                Number(
                  b.planningPosition ??
                  0
                );


              const safeA =
                positionA >
                  0

                  ? positionA

                  : Number.MAX_SAFE_INTEGER;


              const safeB =
                positionB >
                  0

                  ? positionB

                  : Number.MAX_SAFE_INTEGER;


              if (
                safeA !==
                  safeB
              ) {

                return (
                  safeA -
                  safeB
                );

              }


              return (
                Number(
                  a.id
                ) -
                Number(
                  b.id
                )
              );

            }
          );

      },
      [
        activeOrders,
        selectedLine
      ]
    );


  /*
   * ==================================================
   * CONTADORES
   * ==================================================
   */

  function getLineCount(
    line: number
  ): number {

    return activeOrders.filter(
      order =>
        order.productionLine ===
        line
    ).length;

  }


  const totalRolls =
    lineOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        Number(
          order.rolls ??
          0
        ),
      0
    );


  const totalPrinted =
    lineOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        Number(
          order.printed ??
          0
        ),
      0
    );


  const totalPending =
    lineOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        getPendingQuantity(
          order
        ),
      0
    );


  /*
   * ==================================================
   * ABRIR ORDEN
   * ==================================================
   */

  function openOrder(
    order: ProductionOrder
  ) {

    navigate(
      `/operator/print?order=${encodeURIComponent(
        order.order
      )}`
    );

  }


  /*
   * ==================================================
   * MOVER ORDEN
   * ==================================================
   */

  function moveOrder(
    orderId: number,
    direction:
      "up" |
      "down"
  ) {

    moveOrderInPlanning(
      orderId,
      direction
    );


    loadOrders();

  }


  /*
   * ==================================================
   * CREAR PDF
   * ==================================================
   */

  async function createPlanningPdf():
  Promise<Blob> {

    const doc =
      new jsPDF({
        orientation:
          "landscape",

        unit:
          "mm",

        format:
          "a4"
      });


    const pageWidth =
      doc.internal.pageSize.getWidth();


    const now =
      new Date();


    const dateText =
      new Intl.DateTimeFormat(
        "es-ES",
        {
          day:
            "2-digit",

          month:
            "2-digit",

          year:
            "numeric",

          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      ).format(
        now
      );


    doc.setTextColor(
      ...RIVULIS_GREEN
    );


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.setFontSize(
      15
    );


    doc.text(
      dateText,
      10,
      15
    );


    /*
     * LOGO
     */

    try {

      const logo =
        await imageUrlToDataUrl(
          "/images/rivulis-logo.png"
        );


      const logoProperties =
        doc.getImageProperties(
          logo
        );


      const maxLogoWidth =
        48;


      const maxLogoHeight =
        18;


      const ratio =
        logoProperties.width /
        logoProperties.height;


      let logoWidth =
        maxLogoWidth;


      let logoHeight =
        logoWidth /
        ratio;


      if (
        logoHeight >
          maxLogoHeight
      ) {

        logoHeight =
          maxLogoHeight;


        logoWidth =
          logoHeight *
          ratio;

      }


      doc.addImage(
        logo,
        "PNG",
        pageWidth -
          10 -
          logoWidth,
        8,
        logoWidth,
        logoHeight
      );

    }
    catch (
      error
    ) {

      console.error(
        "No se pudo incluir el logo en el PDF:",
        error
      );

    }


    let currentY =
      28;


    /*
     * COMENTARIO DE LÍNEA
     */

    if (
      lineComments.trim()
    ) {

      doc.setFillColor(
        ...RIVULIS_LIGHT_GREEN
      );


      doc.roundedRect(
        10,
        currentY,
        pageWidth -
          20,
        14,
        2,
        2,
        "F"
      );


      doc.setTextColor(
        ...RIVULIS_DARK_GREEN
      );


      doc.setFont(
        "helvetica",
        "bold"
      );


      doc.setFontSize(
        10
      );


      const commentLines =
        doc.splitTextToSize(
          lineComments,
          pageWidth -
            28
        );


      doc.text(
        commentLines,
        14,
        currentY +
          5.5
      );


      currentY +=
        18;

    }


    /*
     * CABECERA DE LÍNEA
     */

    doc.setFillColor(
      ...RIVULIS_GREEN
    );


    doc.rect(
      10,
      currentY,
      pageWidth -
        20,
      12,
      "F"
    );


    doc.setTextColor(
      255,
      255,
      255
    );


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.setFontSize(
      15
    );


    doc.text(
      `Línea de Producción ${selectedLine}`,
      pageWidth /
        2,
      currentY +
        8.5,
      {
        align:
          "center"
      }
    );


    currentY +=
      18;


    /*
     * TABLA
     */

    const tableBody =
      lineOrders.map(
        (
          order,
          index
        ) => [

          `${index + 1}º`,

          order.order,

          order.marking ||
            "-",

          /*
           * METROS / UNIDADES PENDIENTES
           */

          formatQuantity(
            getOrderPendingQuantity(
              order
            ),
            order.quantityUnit ===
              "UN"

              ? "UN"

              : "M"
          ),

          String(
            order.rolls
          ),

          String(
            getPendingQuantity(
              order
            )
          ),

          getPlanningDescription(
            order
          ),

          order.customer ||
            "-",

          order.sku,

          order.salesOrder ||
            "-"

        ]
      );


    autoTable(
      doc,
      {
        startY:
          currentY,

        margin: {
          left:
            10,

          right:
            10,

          bottom:
            10
        },

        head: [
          [
            "#",
            "OF",
            "Marcaje",
            "Metros / Unid.",
            "Nº R/B Tot",
            "Nº R/B Pen",
            "Descripción",
            "Cliente",
            "SKU",
            "P. Venta"
          ]
        ],

        body:
          tableBody,

        theme:
          "grid",

        showHead:
          "everyPage",

        styles: {
          font:
            "helvetica",

          fontSize:
            7.4,

          cellPadding:
            2.1,

          valign:
            "middle",

          lineColor:
            [
              215,
              215,
              215
            ],

          lineWidth:
            0.15
        },

        headStyles: {
          fillColor:
            RIVULIS_GREEN,

          textColor:
            [
              255,
              255,
              255
            ],

          fontStyle:
            "bold",

          halign:
            "center"
        },

        columnStyles: {
          0: {
            halign:
              "center",
            cellWidth:
              10
          },

          1: {
            cellWidth:
              28
          },

          2: {
            cellWidth:
              24
          },

          3: {
            halign:
              "center",
            cellWidth:
              27
          },

          4: {
            halign:
              "center",
            cellWidth:
              19
          },

          5: {
            halign:
              "center",
            cellWidth:
              19
          },

          6: {
            cellWidth:
              65
          },

          7: {
            cellWidth:
              34
          },

          8: {
            cellWidth:
              27
          },

          9: {
            cellWidth:
              28
          }
        },

        didParseCell: (
          data
        ) => {

          if (
            data.section ===
              "body" &&
            data.column.index ===
              5
          ) {

            data.cell.styles.textColor =
              PENDING_RED;


            data.cell.styles.fontStyle =
              "bold";

          }

        }
      }
    );


    return doc.output(
      "blob"
    );

  }


  /*
   * ==================================================
   * ABRIR PREVISUALIZACIÓN
   * ==================================================
   */

  async function handlePrintPreview() {

    if (
      lineOrders.length ===
        0
    ) {

      return;

    }


    setGeneratingPreview(
      true
    );


    setPreviewError(
      ""
    );


    try {

      const [
        pdfBlob,
        printer
      ] =
        await Promise.all([
          createPlanningPdf(),
          getDefaultPrinter()
        ]);


      if (
        previewUrl
      ) {

        URL.revokeObjectURL(
          previewUrl
        );

      }


      const url =
        URL.createObjectURL(
          pdfBlob
        );


      setPreviewBlob(
        pdfBlob
      );


      setPreviewUrl(
        url
      );


      setDefaultPrinter(
        printer ??
        ""
      );


      setPreviewOpen(
        true
      );

    }
    catch (
      error
    ) {

      console.error(
        "Error preparando planificación:",
        error
      );


      setPreviewError(
        error instanceof
          Error

          ? error.message

          : "No se pudo generar la planificación."
      );


      setPreviewOpen(
        true
      );

    }
    finally {

      setGeneratingPreview(
        false
      );

    }

  }


  /*
   * ==================================================
   * CERRAR PDF
   * ==================================================
   */

  function closePrintPreview() {

    if (
      printing
    ) {

      return;

    }


    setPreviewOpen(
      false
    );


    setPreviewError(
      ""
    );

  }


  /*
   * ==================================================
   * IMPRESIÓN DIRECTA
   * ==================================================
   */

  async function handleDirectPrint() {

    if (
      !previewBlob
    ) {

      return;

    }


    setPrinting(
      true
    );


    setPreviewError(
      ""
    );


    try {

      await printPlanningPdf(
        previewBlob,
        `Planificación Línea ${selectedLine}`
      );


      if (
        previewUrl
      ) {

        URL.revokeObjectURL(
          previewUrl
        );

      }


      setPreviewUrl(
        ""
      );


      setPreviewBlob(
        null
      );


      setDefaultPrinter(
        ""
      );


      setPreviewOpen(
        false
      );


      setPreviewError(
        ""
      );

    }
    catch (
      error
    ) {

      console.error(
        "Error imprimiendo planificación:",
        error
      );


      setPreviewError(
        error instanceof
          Error

          ? error.message

          : "No se pudo imprimir la planificación."
      );

    }
    finally {

      setPrinting(
        false
      );

    }

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <>

      <Box
        sx={{
          width:
            "100%",

          minWidth:
            0
        }}
      >

        <BackButton
          showBack={false}
        />


        <Box
          sx={{
            mb:
              3,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            gap:
              2
          }}
        >

          <CalendarMonthIcon
            sx={{
              fontSize:
                46,

              color:
                "#0B7A3B"
            }}
          />


          <Box>

            <Typography
              variant="h4"
              fontWeight={800}
            >
              Planificación
            </Typography>


            <Typography
              color="text.secondary"
            >
              Planificación de las líneas de producción
            </Typography>

          </Box>

        </Box>


        <Paper
          elevation={0}
          sx={{
            mb:
              2,

            border:
              "1px solid #E0E0E0",

            borderRadius:
              2,

            overflow:
              "hidden"
          }}
        >

          <Tabs
            value={
              selectedLine
            }
            onChange={
              (
                _event,
                value
              ) =>
                setSelectedLine(
                  Number(
                    value
                  )
                )
            }
            variant="fullWidth"
            sx={{
              backgroundColor:
                "#F8FAF8",

              "& .MuiTabs-indicator": {
                backgroundColor:
                  "#0B7A3B",

                height:
                  4
              },

              "& .MuiTab-root": {
                fontWeight:
                  800,

                minHeight:
                  64,

                minWidth:
                  0
              },

              "& .Mui-selected": {
                color:
                  "#0B7A3B !important"
              }
            }}
          >

            {
              PRODUCTION_LINES.map(
                line => {

                  const count =
                    getLineCount(
                      line
                    );


                  return (

                    <Tab
                      key={
                        line
                      }
                      value={
                        line
                      }
                      label={

                        <Stack
                          direction="row"
                          spacing={0.7}
                          alignItems="center"
                        >

                          <span>
                            LÍNEA {line}
                          </span>


                          <Box
                            sx={{
                              minWidth:
                                27,

                              height:
                                27,

                              px:
                                0.5,

                              borderRadius:
                                "14px",

                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              fontWeight:
                                900,

                              backgroundColor:
                                selectedLine ===
                                  line

                                  ? "#0B7A3B"

                                  : count >
                                      0

                                    ? "#DCEFE1"

                                    : "#EEEEEE",

                              color:
                                selectedLine ===
                                  line

                                  ? "#FFFFFF"

                                  : count >
                                      0

                                    ? "#0B7A3B"

                                    : "#757575"
                            }}
                          >
                            {count}
                          </Box>

                        </Stack>

                      }
                    />

                  );

                }
              )
            }

          </Tabs>

        </Paper>


        <Paper
          variant="outlined"
          sx={{
            borderRadius:
              2,

            overflow:
              "hidden"
          }}
        >

          <Box
            sx={{
              px:
                2,

              py:
                1.5,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                2,

              flexWrap:
                "wrap",

              backgroundColor:
                "#E8F3EB",

              borderBottom:
                "1px solid #E0E0E0"
            }}
          >

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >

              <FactoryIcon
                sx={{
                  color:
                    "#0B7A3B"
                }}
              />


              <Typography
                variant="h6"
                fontWeight={900}
                color="#0B7A3B"
              >
                Línea de Producción {selectedLine}
              </Typography>

            </Stack>


            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >

              <Chip
                label={
                  `${lineOrders.length} OF`
                }
                size="small"
                sx={{
                  fontWeight:
                    800
                }}
              />


              <Chip
                label={
                  `R/B: ${totalRolls}`
                }
                size="small"
                variant="outlined"
              />


              <Chip
                label={
                  `Imp.: ${totalPrinted}`
                }
                size="small"
                variant="outlined"
              />


              <Chip
                label={
                  `Pend.: ${totalPending}`
                }
                size="small"
                color={
                  totalPending >
                    0

                    ? "warning"

                    : "success"
                }
              />


              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={
                  generatingPreview

                    ? (
                      <CircularProgress
                        size={17}
                        color="inherit"
                      />
                    )

                    : (
                      <PrintIcon />
                    )
                }
                disabled={
                  generatingPreview ||
                  lineOrders.length ===
                    0
                }
                onClick={
                  () =>
                    void handlePrintPreview()
                }
                sx={{
                  fontWeight:
                    800
                }}
              >
                IMPRIMIR
              </Button>

            </Stack>

          </Box>


          {
            lineComments &&
            (

              <Box
                sx={{
                  px:
                    2,

                  py:
                    1.2,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    1,

                  backgroundColor:
                    "#F5FBF7",

                  borderBottom:
                    "1px solid #E0E0E0"
                }}
              >

                <CommentIcon
                  sx={{
                    color:
                      "#D84315",

                    fontSize:
                      20
                  }}
                />


                <Typography
                  fontWeight={800}
                  color="#D84315"
                >
                  {lineComments}
                </Typography>

              </Box>

            )
          }


          {
            lineOrders.length ===
              0

              ? (

                <Box
                  sx={{
                    p:
                      5,

                    textAlign:
                      "center"
                  }}
                >

                  <FactoryIcon
                    sx={{
                      fontSize:
                        48,

                      color:
                        "#BDBDBD"
                    }}
                  />


                  <Typography
                    color="text.secondary"
                  >
                    Sin órdenes planificadas en la Línea {selectedLine}
                  </Typography>

                </Box>

              )

              : (

                <Box
                  sx={{
                    overflowX:
                      "auto"
                  }}
                >

                  <Box
                    sx={{
                      minWidth:
                        1510
                    }}
                  >

                    <Box
                      sx={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          PLANNING_COLUMNS,

                        columnGap:
                          0.7,

                        px:
                          1,

                        py:
                          1.1,

                        backgroundColor:
                          "#F5F7FA"
                      }}
                    >

                      <Header center>
                        #
                      </Header>

                      <Header>
                        OF
                      </Header>

                      <Header>
                        Marcaje
                      </Header>

                      <Header center>
                        Metros / Unid.
                      </Header>

                      <Header center>
                        R/B Tot
                      </Header>

                      <Header center>
                        R/B Pen
                      </Header>

                      <Header>
                        Descripción
                      </Header>

                      <Header>
                        Cliente
                      </Header>

                      <Header>
                        SKU
                      </Header>

                      <Header>
                        Pedido Venta
                      </Header>

                      <Header center>
                        Progreso
                      </Header>

                      <Header center>
                        Orden
                      </Header>

                    </Box>


                    {
                      lineOrders.map(
                        (
                          order,
                          index
                        ) => {

                          const pending =
                            getPendingQuantity(
                              order
                            );


                          const progress =
                            order.rolls >
                              0

                              ? Math.min(
                                  100,
                                  (
                                    order.printed /
                                    order.rolls
                                  ) *
                                    100
                                )

                              : 0;


                          const pendingQuantity =
                            getOrderPendingQuantity(
                              order
                            );


                          const unit:
                            "M" |
                            "UN" =

                            order.quantityUnit ===
                              "UN"

                              ? "UN"

                              : "M";


                          return (

                            <Box
                              key={
                                order.id
                              }
                              onClick={
                                () =>
                                  openOrder(
                                    order
                                  )
                              }
                              sx={{
                                display:
                                  "grid",

                                gridTemplateColumns:
                                  PLANNING_COLUMNS,

                                columnGap:
                                  0.7,

                                minHeight:
                                  64,

                                px:
                                  1,

                                alignItems:
                                  "center",

                                cursor:
                                  "pointer",

                                borderTop:
                                  "1px solid #EEEEEE",

                                "&:hover": {
                                  backgroundColor:
                                    "#F6FBF7"
                                }
                              }}
                            >

                              <CellBox>

                                <Typography
                                  fontWeight={900}
                                  textAlign="center"
                                >
                                  {index + 1}
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  fontWeight={800}
                                  color="primary.main"
                                  title={
                                    order.order
                                  }
                                  sx={{
                                    whiteSpace:
                                      "nowrap",

                                    overflow:
                                      "visible",

                                    textOverflow:
                                      "clip",

                                    fontVariantNumeric:
                                      "tabular-nums"
                                  }}
                                >
                                  {order.order}
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  variant="body2"
                                  noWrap
                                >
                                  {
                                    order.marking ||
                                    "-"
                                  }
                                </Typography>

                              </CellBox>


                              {/*
                               * METROS / UNIDADES PENDIENTES
                               */}

                              <CellBox>

                                <Typography
                                  variant="body2"
                                  fontWeight={800}
                                  textAlign="center"
                                  sx={{
                                    color:
                                      "#0B7A3B",

                                    whiteSpace:
                                      "nowrap"
                                  }}
                                >
                                  {
                                    formatQuantity(
                                      pendingQuantity,
                                      unit
                                    )
                                  }
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  fontWeight={800}
                                  textAlign="center"
                                >
                                  {order.rolls}
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  fontWeight={900}
                                  textAlign="center"
                                  color={
                                    pending >
                                      0

                                      ? "error.main"

                                      : "success.main"
                                  }
                                >
                                  {pending}
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  variant="body2"
                                  title={
                                    getPlanningDescription(
                                      order
                                    )
                                  }
                                  sx={{
                                    overflow:
                                      "hidden",

                                    display:
                                      "-webkit-box",

                                    WebkitLineClamp:
                                      2,

                                    WebkitBoxOrient:
                                      "vertical"
                                  }}
                                >
                                  {
                                    getPlanningDescription(
                                      order
                                    )
                                  }
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  variant="body2"
                                  noWrap
                                >
                                  {
                                    order.customer ||
                                    "-"
                                  }
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  variant="body2"
                                  noWrap
                                >
                                  {order.sku}
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  noWrap
                                >
                                  {
                                    order.salesOrder ||
                                    "-"
                                  }
                                </Typography>

                              </CellBox>


                              <CellBox>

                                <Box
                                  sx={{
                                    minWidth:
                                      0
                                  }}
                                >

                                  <LinearProgress
                                    variant="determinate"
                                    value={
                                      progress
                                    }
                                    sx={{
                                      height:
                                        7,

                                      borderRadius:
                                        5,

                                      mb:
                                        0.4
                                    }}
                                  />


                                  <Typography
                                    variant="caption"
                                    display="block"
                                    textAlign="center"
                                  >
                                    {
                                      Math.round(
                                        progress
                                      )
                                    }%
                                  </Typography>

                                </Box>

                              </CellBox>


                              <CellBox>

                                <Stack
                                  direction="column"
                                  alignItems="center"
                                  spacing={0}
                                >

                                  <IconButton
                                    size="small"
                                    disabled={
                                      index ===
                                        0
                                    }
                                    onClick={
                                      event => {

                                        event.stopPropagation();


                                        moveOrder(
                                          order.id,
                                          "up"
                                        );

                                      }
                                    }
                                  >
                                    <KeyboardArrowUpIcon />
                                  </IconButton>


                                  <IconButton
                                    size="small"
                                    disabled={
                                      index ===
                                        lineOrders.length -
                                        1
                                    }
                                    onClick={
                                      event => {

                                        event.stopPropagation();


                                        moveOrder(
                                          order.id,
                                          "down"
                                        );

                                      }
                                    }
                                  >
                                    <KeyboardArrowDownIcon />
                                  </IconButton>

                                </Stack>

                              </CellBox>

                            </Box>

                          );

                        }
                      )
                    }

                  </Box>

                </Box>

              )
          }

        </Paper>

      </Box>


      <Dialog
        open={
          previewOpen
        }
        onClose={
          closePrintPreview
        }
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            height:
              "92vh"
          }
        }}
      >

        <DialogTitle>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >

            <Box>

              <Typography
                variant="h6"
                fontWeight={800}
              >
                Planificación Línea {selectedLine}
              </Typography>


              {
                defaultPrinter &&
                (

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Impresora: {defaultPrinter}
                  </Typography>

                )
              }

            </Box>


            <IconButton
              onClick={
                closePrintPreview
              }
              disabled={
                printing
              }
            >
              <CloseIcon />
            </IconButton>

          </Stack>

        </DialogTitle>


        <DialogContent
          dividers
          sx={{
            p:
              1,

            display:
              "flex",

            flexDirection:
              "column",

            minHeight:
              0
          }}
        >

          {
            previewError &&
            (

              <Alert
                severity="error"
                sx={{
                  mb:
                    1
                }}
              >
                {previewError}
              </Alert>

            )
          }


          {
            generatingPreview

              ? (

                <Box
                  sx={{
                    flex:
                      1,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center"
                  }}
                >
                  <CircularProgress />
                </Box>

              )

              : previewUrl

                ? (

                  <Box
                    component="iframe"
                    src={
                      previewUrl
                    }
                    title={`Planificación Línea ${selectedLine}`}
                    sx={{
                      width:
                        "100%",

                      flex:
                        1,

                      minHeight:
                        0,

                      border:
                        0
                    }}
                  />

                )

                : (

                  <Box
                    sx={{
                      p:
                        4,

                      textAlign:
                        "center"
                    }}
                  >
                    <Typography
                      color="text.secondary"
                    >
                      No hay vista previa disponible.
                    </Typography>
                  </Box>

                )
          }

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              closePrintPreview
            }
            disabled={
              printing
            }
          >
            CERRAR
          </Button>


          <Button
            variant="contained"
            color="success"
            startIcon={
              printing

                ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                )

                : (
                  <PrintIcon />
                )
            }
            disabled={
              printing ||
              !previewBlob
            }
            onClick={
              () =>
                void handleDirectPrint()
            }
          >
            {
              printing
                ? "IMPRIMIENDO..."
                : "IMPRIMIR"
            }
          </Button>

        </DialogActions>

      </Dialog>

    </>

  );

}