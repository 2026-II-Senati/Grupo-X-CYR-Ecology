import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import PdfVenta from "../components/PdfVenta"; // <-- NUEVO IMPORT

const RegistroVentas = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axiosClient.get("/sales");
        setSales(res.data);
      } catch (error) {
        console.error("Error al cargar ventas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  if (loading) return <div className="p-10">Cargando ventas...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6">
        Registro de Ventas
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-700 text-white text-sm">
              <th className="p-3 border-b">N° Comprobante</th>
              <th className="p-3 border-b">Fecha</th>
              <th className="p-3 border-b">Cliente</th>
              <th className="p-3 border-b text-center">Tipo</th>
              <th className="p-3 border-b text-right">Total</th>
              <th className="p-3 border-b text-center">Acciones</th>{" "}
              {/* <-- NUEVA COLUMNA */}
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 text-sm">
                <td className="p-3 border-b font-mono font-bold text-green-700">
                  {s.numeroComprobante}
                </td>
                <td className="p-3 border-b">
                  {s.fechaEmision.split("-").reverse().join("/")}
                </td>
                <td className="p-3 border-b">{s.clienteNombre}</td>
                <td className="p-3 border-b text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      s.tipoComprobante === "FACTURA"
                        ? "bg-blue-100 text-blue-700"
                        : s.tipoComprobante === "BOLETA"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s.tipoComprobante}
                  </span>
                </td>
                <td className="p-3 border-b text-right font-mono font-bold">
                  S/ {parseFloat(s.montoTotal).toFixed(2)}
                </td>
                <td className="p-3 border-b text-center">
                  <PdfVenta venta={s} /> {/* <-- BOTÓN DE DESCARGA */}
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Aún no hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistroVentas;
