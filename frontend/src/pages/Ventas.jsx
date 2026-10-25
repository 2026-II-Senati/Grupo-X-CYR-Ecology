import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const Ventas = () => {
  const [quotation, setQuotation] = useState(null);
  const [tipoComprobante, setTipoComprobante] = useState("FACTURA");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [numeroComprobanteFinal, setNumeroComprobanteFinal] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const quotationId = queryParams.get("quotationId");

  useEffect(() => {
    if (quotationId) {
      const fetchQuotation = async () => {
        try {
          const res = await axiosClient.get("/quotations");
          const found = res.data.find((q) => q.id === quotationId);
          setQuotation(found);
        } catch (error) {
          console.error("Error al cargar cotización", error);
        }
      };
      fetchQuotation();
    }
  }, [quotationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axiosClient.post("/sales", {
        quotationId,
        tipoComprobante,
        clienteNombre: quotation.cliente.razonSocial,
        clienteDocumento: quotation.cliente.ruc,
      });

      // Guardamos el número oficial generado por el backend (ej. F001-00000001)
      setNumeroComprobanteFinal(res.data.sale.numeroComprobante);
      setMessage("¡Venta registrada exitosamente!");

      // Redirigir después de 3 segundos para que el usuario vea el número
      setTimeout(() => navigate("/historial"), 3000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error al registrar la venta",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!quotation) return <div className="p-10">Cargando datos...</div>;

  // Prefijo dinámico según el tipo de comprobante
  const prefijo =
    tipoComprobante === "FACTURA"
      ? "F001"
      : tipoComprobante === "BOLETA"
        ? "B001"
        : "NV01";

  return (
    <div className="p-6 h-full flex flex-col md:flex-row gap-6">
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <div className="w-full md:w-1/3 space-y-4">
        <h1 className="text-2xl font-black text-gray-800">Registrar Venta</h1>

        {message && (
          <div
            className={`p-3 rounded text-sm font-bold ${message.includes("exitosamente") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">
            Cotización a Facturar
          </h2>
          <p className="font-mono font-bold text-green-700 text-lg">
            {quotation.id}
          </p>
          <p className="text-sm text-gray-600">
            Cliente: {quotation.cliente.razonSocial}
          </p>
          <p className="text-lg font-black text-gray-800 mt-2">
            Total: S/ {parseFloat(quotation.total).toFixed(2)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tipo de Venta
            </label>
            <select
              value={tipoComprobante}
              onChange={(e) => setTipoComprobante(e.target.value)}
              disabled={numeroComprobanteFinal !== ""}
              className="w-full border p-2 rounded focus:border-green-500 outline-none"
            >
              <option value="FACTURA">Factura (RUC)</option>
              <option value="BOLETA">Boleta (DNI)</option>
              <option value="NOTA_VENTA">Nota de Venta</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || numeroComprobanteFinal !== ""}
            className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 disabled:bg-green-300"
          >
            {loading
              ? "Procesando..."
              : numeroComprobanteFinal
                ? "Venta Registrada"
                : "Confirmar y Registrar Venta"}
          </button>
        </form>
      </div>

      {/* SECCIÓN DERECHA: VISTA PREVIA DEL COMPROBANTE */}
      <div className="w-full md:w-2/3 bg-gray-200 rounded-xl overflow-hidden flex flex-col">
        <div className="bg-gray-800 text-white p-2 text-center text-sm font-bold">
          Vista Previa del Documento
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex justify-center">
          <div
            className="bg-white shadow-xl"
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
                  {tipoComprobante === "FACTURA"
                    ? "FACTURA ELECTRÓNICA"
                    : tipoComprobante === "BOLETA"
                      ? "BOLETA ELECTRÓNICA"
                      : "NOTA DE VENTA"}
                </div>
                <div className="border-2 border-green-700 p-2 bg-green-50">
                  {/* Aquí mostramos el número real si existe, sino el placeholder */}
                  <p className="font-mono text-xl font-black text-gray-800">
                    {numeroComprobanteFinal
                      ? numeroComprobanteFinal
                      : `${prefijo}-XXXX`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="border border-green-200 p-3 rounded bg-green-50/50 mb-6 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong className="text-gray-500">Cliente:</strong>{" "}
                  {quotation.cliente?.razonSocial}
                </p>
                <p>
                  <strong className="text-gray-500">RUC/DNI:</strong>{" "}
                  {quotation.cliente?.ruc}
                </p>
                <p>
                  <strong className="text-gray-500">Dirección:</strong>{" "}
                  {quotation.cliente?.direccion || "---"}
                </p>
                <p>
                  <strong className="text-gray-500">Atención:</strong>{" "}
                  {quotation.cliente?.atencion || "---"}
                </p>
              </div>
            </div>

            {/* Tabla de Ítems */}
            <table className="w-full text-sm mb-6 border-collapse">
              <thead>
                <tr className="bg-green-700 text-white text-left">
                  <th className="p-2 border border-green-700 text-center">
                    N°
                  </th>
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
                {quotation.items?.map((item, idx) => (
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
                    S/ {parseFloat(quotation.subtotal).toFixed(2)}
                  </span>
                </div>
                {parseFloat(quotation.descuento) > 0 && (
                  <div className="flex justify-between text-sm mb-1 text-red-600">
                    <span>Descuento ({quotation.descuento}%):</span>{" "}
                    <span className="font-mono">
                      -S/{" "}
                      {(
                        quotation.subtotal *
                        (quotation.descuento / 100)
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">IGV (18%):</span>{" "}
                  <span className="font-mono">
                    S/ {parseFloat(quotation.igv).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black text-green-800 border-t-2 border-green-700 pt-2 mt-2">
                  <span>TOTAL:</span>{" "}
                  <span className="font-mono">
                    S/ {parseFloat(quotation.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventas;
