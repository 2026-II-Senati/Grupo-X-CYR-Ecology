import { useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import DocumentoPDF from "./DocumentoPDF";

const PdfGenerator = ({ cotizacion, autoDownload = false }) => {
  const pdfRef = useRef();

  const generatePDF = () => {
    const element = pdfRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Cotizacion-${cotizacion.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(() => {
        generatePDF();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, cotizacion]);

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
        <div ref={pdfRef}>
          <DocumentoPDF
            tipoDocumento="COTIZACIÓN"
            numeroDocumento={cotizacion.id}
            fecha={cotizacion.fecha?.split("-").reverse().join("/")}
            hora={cotizacion.hora} // <-- PASAMOS LA HORA
            cliente={cotizacion.cliente || {}}
            items={cotizacion.items || []}
            subtotal={cotizacion.subtotal}
            descuento={
              cotizacion.descuento > 0
                ? cotizacion.subtotal * (cotizacion.descuento / 100)
                : 0
            }
            igv={cotizacion.igv}
            total={cotizacion.total}
            logoUrl={null}
            firmaUrl={null}
          />
        </div>
      </div>
    </>
  );
};

export default PdfGenerator;
