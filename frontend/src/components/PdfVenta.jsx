import { useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";

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
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(() => generatePDF(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, venta]);

  const cotizacion = venta.cotizacion || {};
  const items = cotizacion.items || [];
  const cliente = cotizacion.cliente || {};

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

      {/* Contenedor invisible para el PDF */}
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
          className="bg-white"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "10mm",
            boxSizing: "border-box",
          }}
        >
          {/* Cabecera */}
          <div className="flex justify-between border-b-4 border-green-700 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-green-800">
                CYR ECOLOGY
              </h1>
              <p className="text-xs text-gray-600 mt-1">RUC: 20455892938</p>
              <p className="text-xs text-gray-600">Arequipa, Perú</p>
            </div>
            <div className="text-right">
              <div className="bg-green-700 text-white px-4 py-1 rounded-t font-bold text-sm">
                {venta.tipoComprobante === "FACTURA"
                  ? "FACTURA ELECTRÓNICA"
                  : venta.tipoComprobante === "BOLETA"
                    ? "BOLETA ELECTRÓNICA"
                    : "NOTA DE VENTA"}
              </div>
              <div className="border-2 border-green-700 p-2 bg-green-50">
                <p className="font-mono text-xl font-black text-gray-800">
                  {venta.numeroComprobante}
                </p>
                <p className="text-xs text-gray-600">
                  {venta.fechaEmision.split("-").reverse().join("/")}
                </p>
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="border border-green-200 p-3 rounded bg-green-50/50 mb-6 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <p>
                <strong className="text-gray-500">Cliente:</strong>{" "}
                {cliente.razonSocial || "---"}
              </p>
              <p>
                <strong className="text-gray-500">RUC/DNI:</strong>{" "}
                {cliente.ruc || "---"}
              </p>
              <p>
                <strong className="text-gray-500">Dirección:</strong>{" "}
                {cliente.direccion || "---"}
              </p>
              <p>
                <strong className="text-gray-500">Atención:</strong>{" "}
                {cliente.atencion || "---"}
              </p>
            </div>
          </div>

          {/* Tabla */}
          <table className="w-full text-sm mb-6 border-collapse">
            <thead>
              <tr className="bg-green-700 text-white text-left">
                <th className="p-2 border border-green-700 text-center">N°</th>
                <th className="p-2 border border-green-700 text-center">
                  Cant.
                </th>
                <th className="p-2 border border-green-700 text-center">
                  Unid.
                </th>
                <th className="p-2 border border-green-700">Descripción</th>
                <th className="p-2 border border-green-700 text-right">
                  P. Unit.
                </th>
                <th className="p-2 border border-green-700 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="p-2 border border-gray-200 text-center">
                    {idx + 1}
                  </td>
                  <td className="p-2 border border-gray-200 text-center">
                    {item.cantidad}
                  </td>
                  <td className="p-2 border border-gray-200 text-center">
                    {item.unidad}
                  </td>
                  <td className="p-2 border border-gray-200">
                    {item.descripcion}
                  </td>
                  <td className="p-2 border border-gray-200 text-right font-mono">
                    {(parseFloat(item.precioUnitario) || 0).toFixed(2)}
                  </td>
                  <td className="p-2 border border-gray-200 text-right font-mono">
                    {(parseFloat(item.total) || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="flex justify-end mb-10">
            <div className="w-1/2 border border-green-700 rounded p-3 bg-white">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Subtotal:</span>{" "}
                <span className="font-mono">
                  S/ {parseFloat(cotizacion.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">IGV (18%):</span>{" "}
                <span className="font-mono">
                  S/ {parseFloat(cotizacion.igv || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-black text-green-800 border-t-2 border-green-700 pt-2 mt-2">
                <span>TOTAL:</span>{" "}
                <span className="font-mono">
                  S/ {parseFloat(venta.montoTotal).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PdfVenta;
