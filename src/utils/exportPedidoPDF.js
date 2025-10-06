import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getFormatFromDataUrl } from "./imgToDataUrl";
import { traducirAEspanol } from "./traslator";

// export async function exportPedidoPDF({
//     pedido = [], // [{id, nombre, cantidad, fotoBase64}]
//     titulo = "Hoja de Pedido",
//     proveedor = "",
// }) {
//     const doc = new jsPDF({ unit: "pt", format: "a4" });
//     const pageW = doc.internal.pageSize.getWidth();
//     const pageH = doc.internal.pageSize.getHeight();
//     const marginX = 24;

//     const tituloTraducido = await traducirAEspanol(titulo);
//     const pedidoTraducido = await Promise.all(
//         pedido.map(async (p) => ({
//             ...p,
//             nombre: p.nombre ? await traducirAEspanol(p.nombre) : "-"
//         }))
//     );
//     // 🔹 Encabezado
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(16);
//     doc.text(tituloTraducido, marginX, 40);

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(10);
//     const subtitulo = [
//         `Generated: ${new Date().toLocaleString("es-ES")}`,
//         proveedor ? `Supplier: ${proveedor}` : null,
//     ]
//         .filter(Boolean)
//         .join("  ·  ");
//     doc.text(subtitulo, marginX, 58);

//     // 🔹 Tabla
//     autoTable(doc, {
//         head: [["Photo", "Product", "Quantity"]],
//         body: pedidoTraducido
//             .filter((p) => (p.cantidad ?? 0) > 0)
//             .map((p) => [
//                 p.fotoBase64 ? " " : "--", // placeholder
//                 p.nombre || "-",
//                 String(p.cantidad ?? 0),
//             ]),
//         startY: 80,
//         margin: { left: marginX, right: marginX },
//         styles: {
//             fontSize: 11,
//             halign: "center", // por defecto centrado
//             valign: "middle",
//             lineColor: [0, 0, 0],
//             lineWidth: 0.5,
//             minCellHeight: 60, // altura mínima uniforme de filas
//         },
//         headStyles: {
//             fillColor: [245, 246, 247], // gris clarito
//             textColor: [0, 0, 0],
//             fontStyle: "bold",
//             halign: "center",
//             valign: "middle",
//         },
//         columnStyles: {
//             0: { cellWidth: 70, halign: "center" }, // Foto
//             1: { cellWidth: "auto", halign: "center" }, // Producto
//             2: { cellWidth: 60, halign: "center" }, // Cantidad
//         },
//         didDrawCell: (data) => {
//             if (data.section === "body" && data.column.index === 0) {
//                 const row = pedido[data.row.index];
//                 if (row?.fotoBase64) {
//                     try {
//                         const fmt = getFormatFromDataUrl(row.fotoBase64);

//                         // Tamaño máximo disponible en la celda
//                         const maxW = data.cell.width - 10;
//                         const maxH = data.cell.height - 10;

//                         // 🟢 No usamos new Image() (que es async).
//                         // Usamos un tamaño "simulado" cuadrado para mantener proporciones
//                         // Suponemos que es cuadrada y la ajustamos dentro del box.
//                         let drawW = maxW;
//                         let drawH = maxH;

//                         // Centramos dentro de la celda
//                         const x = data.cell.x + (data.cell.width - drawW) / 2;
//                         const y = data.cell.y + (data.cell.height - drawH) / 2;

//                         doc.addImage(row.fotoBase64, fmt, x, y, drawW, drawH);
//                     } catch (e) {
//                         console.warn("Error pintando imagen:", e);
//                     }
//                 }
//             }
//         },
//         didDrawPage: () => {
//             // Footer con numeración
//             const page = doc.internal.getNumberOfPages();
//             doc.setFontSize(9);
//             doc.setTextColor(130);
//             doc.text(`Page ${page}`, pageW - marginX, pageH - 12, { align: "right" });
//         },
//     });

//     // 🔹 Guardar PDF
//     doc.save(`order-${new Date().toISOString().slice(0, 10)}.pdf`);
// }


export async function exportPedidoPDF({
  pedido = [], // [{id, nombre, cantidad, fotoBase64}]
  titulo = "Hoja de Pedido",
  proveedor = "",
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 24;

  const tituloTraducido = await traducirAEspanol(titulo);
  const pedidoTraducido = await Promise.all(
    pedido.map(async (p) => ({
      ...p,
      nombre: p.nombre ? await traducirAEspanol(p.nombre) : "-"
    }))
  );

  // 🔹 Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(tituloTraducido, marginX, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const subtitulo = [
    `Generated: ${new Date().toLocaleString("es-ES")}`,
    proveedor ? `Supplier: ${proveedor}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
  doc.text(subtitulo, marginX, 58);

  // 🔹 Tabla
  autoTable(doc, {
    head: [["Photo", "Product", "Quantity"]],
    body: pedidoTraducido
      .filter((p) => (p.cantidad ?? 0) > 0)
      .map((p) => [
        p.fotoBase64 ? " " : "--", // placeholder
        p.nombre || "-",
        String(p.cantidad ?? 0),
      ]),
    margin: { top: 80, left: marginX, right: marginX }, // 🔹 top margin consistente
    styles: {
      font: "helvetica",   // fuerza helvetica en toda la tabla
      fontSize: 11,
      halign: "center",
      valign: "middle",
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      minCellHeight: 60,
    },
    headStyles: {
      fillColor: [245, 246, 247],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 70, halign: "center" }, // Foto
      1: { cellWidth: "auto", halign: "center" }, // Producto
      2: { cellWidth: 60, halign: "center" }, // Cantidad
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const row = pedido[data.row.index];
        if (row?.fotoBase64) {
          try {
            const fmt = getFormatFromDataUrl(row.fotoBase64);

            // Tamaño máximo disponible en la celda
            const maxW = data.cell.width - 10;
            const maxH = data.cell.height - 10;

            let drawW = maxW;
            let drawH = maxH;

            const x = data.cell.x + (data.cell.width - drawW) / 2;
            const y = data.cell.y + (data.cell.height - drawH) / 2;

            doc.addImage(row.fotoBase64, fmt, x, y, drawW, drawH);
          } catch (e) {
            console.warn("Error pintando imagen:", e);
          }
        }
      }
    },
    didDrawPage: () => {
      // Footer con numeración
      const page = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "normal"); // reafirma fuente
      doc.setFontSize(9);
      doc.setTextColor(130);
      doc.text(`Page ${page}`, pageW - marginX, pageH - 12, { align: "right" });
    },
  });

  // 🔹 Guardar PDF
  doc.save(`order-${new Date().toISOString().slice(0, 10)}.pdf`);
}
