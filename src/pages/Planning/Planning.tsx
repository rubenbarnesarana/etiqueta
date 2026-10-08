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
  "38px 132px 105px 112px 76px 76px minmax(225px, 1.55fr) minmax(120px, 1fr) 100px 118px 90px 68px";
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
 * CANTIDAD
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
    value <= 0
  ) {
    return "-";
  }
  const formatted =
    new Intl.NumberFormat(
      "es-ES",
      {
        maximumFractionDigits:
          2
      }
    ).format(
      value
    );
  return unit ===
    "UN"
    ? `${formatted} un`
    : `${formatted} m`;
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
   * Vista previa PDF
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
  /*
   * Impresión directa QZ
   */
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
   * ÓRDENES
   * ==================================================
   */
  function loadOrders() {
    setOrders(
      getOrders()
    );
  }
  /*
   * ==================================================
   * COMENTARIO
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
  /*
   * ==================================================
   * LIMPIAR URL
   * ==================================================
   */
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
   * SIN ASIGNAR
   * ==================================================
   */
  const unassignedOrders =
    useMemo(
      () =>
        orders.filter(
          order =>
            order.productionLine ===
              0 &&
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
   * ÓRDENES LÍNEA
   * ==================================================
   */
  const lineOrders =
    useMemo(
      () =>
        orders
          .filter(
            order =>
              order.productionLine ===
                selectedLine &&
              order.status !==
                "FINALIZADA" &&
              getPendingQuantity(
                order
              ) >
                0
          )
          .sort(
            (
              a,
              b
            ) => {
              const positionA =
                a.planningPosition >
                  0
                  ? a.planningPosition
                  : Number.MAX_SAFE_INTEGER;
              const positionB =
                b.planningPosition >
                  0
                  ? b.planningPosition
                  : Number.MAX_SAFE_INTEGER;
              return (
                positionA -
                positionB
              );
            }
          ),
      [
        orders,
        selectedLine
      ]
    );
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
  function getLineOrderCount(
    line: number
  ) {
    return orders.filter(
      order =>
        order.productionLine ===
          line &&
        order.status !==
          "FINALIZADA" &&
        getPendingQuantity(
          order
        ) >
          0
    ).length;
  }
  function openOrder(
    order: ProductionOrder
  ) {
    navigate(
      `/operator/print?order=${encodeURIComponent(
        order.order
      )}`
    );
  }
  function moveOrder(
    orderId: number,
    direction:
      | "UP"
      | "DOWN"
  ) {
    moveOrderInPlanning(
      orderId,
      direction
    );
    loadOrders();
  }
  /*
   * ==================================================
   * GENERAR PDF
   * ==================================================
   */
  async function generatePlanningPdf():
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
        "No se pudo añadir el logo:",
        error
      );
    }
    /*
     * FECHA Y HORA
     */
    const now =
      new Date();
    const dateText =
      now.toLocaleDateString(
        "es-ES",
        {
          day:
            "2-digit",
          month:
            "2-digit",
          year:
            "numeric"
        }
      );
    const timeText =
      now.toLocaleTimeString(
        "es-ES",
        {
          hour:
            "2-digit",
          minute:
            "2-digit"
        }
      );
    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.setFontSize(
      15
    );
    doc.setTextColor(
      RIVULIS_DARK_GREEN[0],
      RIVULIS_DARK_GREEN[1],
      RIVULIS_DARK_GREEN[2]
    );
    doc.text(
      `${dateText} · ${timeText}`,
      10,
      18
    );
    let currentY =
      31;
    /*
     * COMENTARIOS
     */
    if (
      lineComments.trim()
    ) {
      const commentLines =
        doc.splitTextToSize(
          lineComments.trim(),
          pageWidth - 32
        );
      const commentHeight =
        Math.max(
          17,
          12 +
          commentLines.length *
            5
        );
      doc.setFillColor(
        RIVULIS_LIGHT_GREEN[0],
        RIVULIS_LIGHT_GREEN[1],
        RIVULIS_LIGHT_GREEN[2]
      );
      doc.setDrawColor(
        RIVULIS_GREEN[0],
        RIVULIS_GREEN[1],
        RIVULIS_GREEN[2]
      );
      doc.roundedRect(
        10,
        currentY,
        pageWidth - 20,
        commentHeight,
        1.5,
        1.5,
        "FD"
      );
      doc.setFont(
        "helvetica",
        "bold"
      );
      doc.setFontSize(
        10
      );
      doc.setTextColor(
        20,
        20,
        20
      );
      doc.text(
        "Comentarios:",
        14,
        currentY + 6
      );
      doc.setFont(
        "helvetica",
        "normal"
      );
      doc.setFontSize(
        10.5
      );
      doc.setTextColor(
        220,
        0,
        0
      );
      doc.text(
        commentLines,
        14,
        currentY + 12
      );
      currentY +=
        commentHeight +
        4;
    }
    /*
     * TÍTULO LÍNEA
     */
    doc.setFillColor(
      RIVULIS_GREEN[0],
      RIVULIS_GREEN[1],
      RIVULIS_GREEN[2]
    );
    doc.setDrawColor(
      RIVULIS_DARK_GREEN[0],
      RIVULIS_DARK_GREEN[1],
      RIVULIS_DARK_GREEN[2]
    );
    doc.roundedRect(
      10,
      currentY,
      pageWidth - 20,
      13,
      1,
      1,
      "FD"
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
      16
    );
    doc.text(
      `Línea de Producción ${selectedLine}`,
      pageWidth / 2,
      currentY + 8.5,
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
          formatQuantity(
            Number(
              order.quantity ??
              0
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
          order.product,
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
          textColor:
            [
              25,
              25,
              25
            ],
          lineColor:
            [
              185,
              195,
              188
            ],
          lineWidth:
            0.25,
          valign:
            "middle",
          overflow:
            "linebreak"
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
            "center",
          valign:
            "middle",
          lineColor:
            RIVULIS_DARK_GREEN,
          lineWidth:
            0.3,
          cellPadding:
            2.4
        },
        alternateRowStyles: {
          fillColor:
            [
              245,
              250,
              246
            ]
        },
        columnStyles: {
          0: {
            cellWidth:
              9,
            halign:
              "center",
            fontStyle:
              "bold",
            fillColor:
              [
                220,
                239,
                225
              ],
            textColor:
              RIVULIS_DARK_GREEN
          },
          1: {
            cellWidth:
              28,
            fontStyle:
              "bold"
          },
          2: {
            cellWidth:
              23,
            halign:
              "center"
          },
          3: {
            cellWidth:
              25,
            halign:
              "center"
          },
          4: {
            cellWidth:
              19,
            halign:
              "center",
            fontStyle:
              "bold"
          },
          5: {
            cellWidth:
              19,
            halign:
              "center",
            fontStyle:
              "bold",
            textColor:
              PENDING_RED
          },
          6: {
            cellWidth:
              65,
            halign:
              "center"
          },
          7: {
            cellWidth:
              40,
            halign:
              "center"
          },
          8: {
            cellWidth:
              25,
            halign:
              "center"
          },
          9: {
            cellWidth:
              25,
            halign:
              "center"
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
   * VISTA PREVIA
   * ==================================================
   */
  async function openPrintPreview() {
    if (
      lineOrders.length ===
        0
    ) {
      return;
    }
    setPreviewError(
      ""
    );
    setDefaultPrinter(
      ""
    );
    setGeneratingPreview(
      true
    );
    setPreviewOpen(
      true
    );
    try {
      const [
        pdfBlob,
        printer
      ] =
        await Promise.all([
          generatePlanningPdf(),
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
    }
    catch (
      error
    ) {
      console.error(
        "Error preparando planificación:",
        error
      );
      setPreviewError(
        error instanceof Error
          ? error.message
          : "No se pudo generar la planificación."
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
   * CERRAR VISTA PREVIA
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
      /*
       * Esperamos a que QZ confirme que el trabajo
       * se ha enviado correctamente a la impresora.
       */
      await printPlanningPdf(
        previewBlob,
        `Planificación Línea ${selectedLine}`
      );
      /*
       * ==================================================
       * IMPRESIÓN CORRECTA
       * ==================================================
       *
       * Cerramos automáticamente la vista previa
       * y volvemos a la pantalla de planificación.
       * ==================================================
       */
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
      /*
       * Si falla, NO cerramos la ventana.
       * Así puedes ver el error e intentarlo otra vez.
       */
      setPreviewError(
        error instanceof Error
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
              fontWeight={700}
              sx={{
                color:
                  "#087D3E"
              }}
            >
              Planificación
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                mt:
                  0.5
              }}
            >
              Orden de fabricación de las líneas de producción
            </Typography>
          </Box>
        </Box>
        {
          unassignedOrders.length >
            0 &&
          (
            <Paper
              elevation={0}
              sx={{
                mb:
                  3,
                p:
                  2,
                border:
                  "1px solid #FFCC80",
                backgroundColor:
                  "#FFF8E1",
                borderRadius:
                  2
              }}
            >
              <Typography
                fontWeight={700}
              >
                Órdenes sin línea asignada
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  mt:
                    1
                }}
              >
                {
                  unassignedOrders.map(
                    order => (
                      <Chip
                        key={
                          order.id
                        }
                        label={
                          `${order.order} · ${order.sku}`
                        }
                        size="small"
                        onClick={
                          () =>
                            openOrder(
                              order
                            )
                        }
                        sx={{
                          cursor:
                            "pointer"
                        }}
                      />
                    )
                  )
                }
              </Stack>
            </Paper>
          )
        }
        <Paper
          elevation={0}
          sx={{
            mb:
              2.5,
            border:
              "1px solid #D7DDD9",
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
                "#FAFBFA",
              minHeight:
                64,
              "& .MuiTabs-indicator": {
                backgroundColor:
                  "#0B7A3B",
                height:
                  4
              },
              "& .MuiTab-root": {
                minHeight:
                  64,
                minWidth:
                  0,
                px:
                  0.6,
                fontWeight:
                  800
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
                    getLineOrderCount(
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
                          justifyContent="center"
                        >
                          <Typography
                            component="span"
                            fontWeight={800}
                            sx={{
                              fontSize: {
                                xs:
                                  "0.72rem",
                                lg:
                                  "0.88rem"
                              },
                              whiteSpace:
                                "nowrap"
                            }}
                          >
                            LÍNEA {line}
                          </Typography>
                          <Box
                            sx={{
                              minWidth:
                                27,
                              height:
                                27,
                              px:
                                count >
                                  9
                                  ? 0.8
                                  : 0.4,
                              borderRadius:
                                "14px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              flexShrink:
                                0,
                              fontWeight:
                                900,
                              fontSize:
                                "0.78rem",
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
                                    : "#757575",
                              border:
                                count >
                                  0
                                  ? "1px solid #AED8B9"
                                  : "1px solid #E0E0E0"
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
          elevation={0}
          sx={{
            width:
              "100%",
            minWidth:
              0,
            overflow:
              "hidden",
            border:
              "1px solid #D8DDD9",
            borderRadius:
              2
          }}
        >
          <Box
            sx={{
              px:
                2,
              py:
                1.5,
              backgroundColor:
                "#E8F3EB",
              borderBottom:
                "1px solid #D8DDD9"
            }}
          >
            <Box
              sx={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  1.2,
                flexWrap:
                  "wrap",
                minWidth:
                  0
              }}
            >
              <FactoryIcon
                sx={{
                  color:
                    "#0B7A3B",
                  fontSize:
                    27
                }}
              />
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{
                  color:
                    "#0B7A3B",
                  whiteSpace:
                    "nowrap"
                }}
              >
                LÍNEA {selectedLine}
              </Typography>
              {
                lineComments &&
                (
                  <Box
                    sx={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        0.6,
                      flex:
                        "1 1 250px",
                      minWidth:
                        0
                    }}
                  >
                    <CommentIcon
                      sx={{
                        fontSize:
                          17,
                        flexShrink:
                          0,
                        color:
                          "#D84315"
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      noWrap
                      sx={{
                        color:
                          "#D84315"
                      }}
                    >
                      {lineComments}
                    </Typography>
                  </Box>
                )
              }
              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{
                  ml:
                    "auto"
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    <PrintIcon />
                  }
                  onClick={
                    () =>
                      void openPrintPreview()
                  }
                  disabled={
                    lineOrders.length ===
                      0
                  }
                  sx={{
                    height:
                      32,
                    px:
                      1.5,
                    fontWeight:
                      800,
                    borderColor:
                      "#0B7A3B",
                    color:
                      "#0B7A3B",
                    backgroundColor:
                      "#FFFFFF"
                  }}
                >
                  IMPRIMIR PLANIFICACIÓN
                </Button>
                <Chip
                  label={
                    lineOrders.length ===
                      1
                      ? "1 ORDEN"
                      : `${lineOrders.length} ÓRDENES`
                  }
                  size="small"
                  sx={{
                    height:
                      29,
                    fontWeight:
                      900,
                    color:
                      "#FFFFFF",
                    backgroundColor:
                      "#0B7A3B"
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
              </Stack>
            </Box>
          </Box>
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
                <Box>
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
                    <Header center>#</Header>
                    <Header>OF</Header>
                    <Header>Marcaje</Header>
                    <Header center>Metros / Unid.</Header>
                    <Header center>R/B Tot</Header>
                    <Header center>R/B Pen</Header>
                    <Header>Descripción</Header>
                    <Header>Cliente</Header>
                    <Header>SKU</Header>
                    <Header>Pedido Venta</Header>
                    <Header center>Progreso</Header>
                    <Header center>Orden</Header>
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
                                "1px solid #EEEEEE"
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
                                noWrap
                              >
                                {order.order}
                              </Typography>
                            </CellBox>
                            <CellBox>
                              <Typography
                                variant="body2"
                                noWrap
                              >
                                {order.marking || "-"}
                              </Typography>
                            </CellBox>
                            <CellBox>
                              <Typography
                                variant="body2"
                                textAlign="center"
                              >
                                {
                                  formatQuantity(
                                    Number(
                                      order.quantity ??
                                      0
                                    ),
                                    order.quantityUnit ===
                                      "UN"
                                      ? "UN"
                                      : "M"
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
                                fontWeight={800}
                                textAlign="center"
                                color="error.main"
                              >
                                {pending}
                              </Typography>
                            </CellBox>
                            <CellBox>
                              <Typography
                                variant="body2"
                              >
                                {order.product}
                              </Typography>
                            </CellBox>
                            <CellBox>
                              <Typography
                                variant="body2"
                              >
                                {order.customer || "-"}
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
                                noWrap
                              >
                                {order.salesOrder || "-"}
                              </Typography>
                            </CellBox>
                            <CellBox>
                              <LinearProgress
                                variant="determinate"
                                value={
                                  progress
                                }
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display:
                                    "block",
                                  textAlign:
                                    "center"
                                }}
                              >
                                {Math.round(progress)}%
                              </Typography>
                            </CellBox>
                            <CellBox>
                              <Box
                                onClick={
                                  event =>
                                    event.stopPropagation()
                                }
                                sx={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "center"
                                }}
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
                                        "UP"
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
                                        "DOWN"
                                      );
                                    }
                                  }
                                >
                                  <KeyboardArrowDownIcon />
                                </IconButton>
                              </Box>
                            </CellBox>
                          </Box>
                        );
                      }
                    )
                  }
                </Box>
              )
          }
        </Paper>
      </Box>
      {/* ==================================================
          VISTA PREVIA
          ================================================== */}
      <Dialog
        open={
          previewOpen
        }
        onClose={
          closePrintPreview
        }
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width:
              "94vw",
            height:
              "92vh",
            maxWidth:
              "1500px",
            overflow:
              "hidden"
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              "#0B7A3B",
            color:
              "#FFFFFF",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center"
          }}
        >
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >
            <PrintIcon />
            <Box>
              <Typography
                fontWeight={900}
              >
                Vista previa de planificación
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color:
                    "rgba(255,255,255,0.85)"
                }}
              >
                Línea {selectedLine}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={
              closePrintPreview
            }
            disabled={
              printing
            }
            sx={{
              color:
                "#FFFFFF"
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p:
              0,
            display:
              "flex",
            flexDirection:
              "column",
            minHeight:
              0,
            backgroundColor:
              "#525659"
          }}
        >
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
                      "center",
                    backgroundColor:
                      "#FFFFFF"
                  }}
                >
                  <CircularProgress />
                </Box>
              )
              : previewError
                ? (
                  <Box
                    sx={{
                      p:
                        2,
                      backgroundColor:
                        "#FFFFFF"
                    }}
                  >
                    <Alert
                      severity="error"
                    >
                      {previewError}
                    </Alert>
                  </Box>
                )
                : previewUrl
                  ? (
                    <Box
                      component="iframe"
                      src={
                        `${previewUrl}#toolbar=0&navpanes=0`
                      }
                      title="Vista previa planificación"
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
                  : null
          }
        </DialogContent>
        <DialogActions
          sx={{
            px:
              2.5,
            py:
              1.3,
            borderTop:
              "1px solid #DDDDDD"
          }}
        >
          <Box
            sx={{
              flex:
                1
            }}
          >
            {
              defaultPrinter &&
              (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Impresora:{" "}
                  <strong>
                    {defaultPrinter}
                  </strong>
                </Typography>
              )
            }
          </Box>
          <Button
            onClick={
              closePrintPreview
            }
            disabled={
              printing
            }
          >
            CANCELAR
          </Button>
          <Button
            variant="contained"
            startIcon={
              printing
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
            onClick={
              () =>
                void handleDirectPrint()
            }
            disabled={
              generatingPreview ||
              printing ||
              !previewBlob
            }
            sx={{
              backgroundColor:
                "#0B7A3B",
              fontWeight:
                800,
              px:
                2.5,
              "&:hover": {
                backgroundColor:
                  "#075E2D"
              }
            }}
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
/*
 * ==================================================
 * CELDA
 * ==================================================
 */
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
          "hidden"
      }}
    >
      {children}
    </Box>
  );
}
/*
 * ==================================================
 * CABECERA
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
      fontWeight={800}
      color="text.secondary"
      textAlign={
        center
          ? "center"
          : "left"
      }
      sx={{
        minWidth:
          0,
        fontSize:
          "0.68rem",
        lineHeight:
          1.1,
        whiteSpace:
          "nowrap",
        textTransform:
          "uppercase"
      }}
    >
      {children}
    </Typography>
  );
}
