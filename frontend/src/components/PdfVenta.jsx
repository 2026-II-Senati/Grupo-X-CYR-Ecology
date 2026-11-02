import { useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import DocumentoPDF from "./DocumentoPDF";

const PdfVenta = ({ venta, autoDownload = false }) => {
  const pdfRef = useRef();

  const generatePDF = () => {
    const element = pdfRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${venta.numeroComprobante}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // <-- EVITA CORTES
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(() => generatePDF(), 800);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, venta]);

  const cotizacion = venta.cotizacion || {};

  return (
    <>
      {!autoDownload && (
        <button
          onClick={generatePDF}
          className="bg-green-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-800"
        >
          📄 PDF
        </button>
      )}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
          width: "210mm",
          height: "297mm",
          overflow: "hidden",
        }}
      >
        <div
          ref={pdfRef}
          style={{
            width: "210mm",
            height: "297mm", // <-- ALTURA FIJA
            padding: "10mm 15mm", // <-- PADDING REDUCIDO
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <DocumentoPDF
            tipoDocumento={
              venta.tipoComprobante === "FACTURA"
                ? "FACTURA ELECTRÓNICA"
                : venta.tipoComprobante === "BOLETA"
                  ? "BOLETA ELECTRÓNICA"
                  : "NOTA DE VENTA"
            }
            numeroDocumento={venta.numeroComprobante}
            fecha={venta.fechaEmision?.split("-").reverse().join("/")}
            cliente={cotizacion.cliente || {}}
            items={cotizacion.items || []}
            subtotal={cotizacion.subtotal}
            descuento={
              cotizacion.descuento > 0
                ? cotizacion.subtotal * (cotizacion.descuento / 100)
                : 0
            }
            igv={cotizacion.igv}
            total={venta.montoTotal}
            logoUrl="/logo.jpeg"
            firmaUrl="/firma.jpeg"
          />
        </div>
      </div>
    </>
  );
};

export default PdfVenta;
