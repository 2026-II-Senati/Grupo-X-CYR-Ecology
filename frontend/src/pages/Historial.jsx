import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PdfGenerator from "../components/PdfGenerator";

const Historial = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await axiosClient.get("/quotations");
      setQuotations(res.data);
    } catch (error) {
      console.error("Error al cargar historial", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axiosClient.put(`/quotations/${id}/status`, { estado: newStatus });
      fetchQuotations();
    } catch (error) {
      alert("Error al cambiar el estado de la cotización.");
    }
  };

  if (loading) return <div className="p-10">Cargando historial...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6">
        Historial de Cotizaciones
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-700 text-white text-sm">
              <th className="p-3 border-b">N° Cotización</th>
              <th className="p-3 border-b">Fecha</th>
              <th className="p-3 border-b">Cliente</th>
              <th className="p-3 border-b text-right">Total</th>
              <th className="p-3 border-b text-center">Estado</th>
              <th className="p-3 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 text-sm">
                <td className="p-3 border-b font-mono font-bold text-green-700">
                  {q.id}
                </td>
                <td className="p-3 border-b">
                  {q.fecha.split("-").reverse().join("/")}
                </td>
                <td className="p-3 border-b">
                  {q.cliente?.razonSocial || "N/A"}
                </td>
                <td className="p-3 border-b text-right font-mono font-bold">
                  S/ {parseFloat(q.total).toFixed(2)}
                </td>

                {/* ESTADO */}
                <td className="p-3 border-b text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      q.estado === "accepted"
                        ? "bg-green-100 text-green-700"
                        : q.estado === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {q.estado === "accepted"
                      ? "Aceptada"
                      : q.estado === "rejected"
                        ? "Rechazada"
                        : "Pendiente"}
                  </span>
                </td>

                {/* ACCIONES */}
                <td className="p-3 border-b">
                  <div className="flex items-center justify-center gap-2">
                    {/* 1. Botón PDF (Siempre visible) */}
                    <PdfGenerator cotizacion={q} />

                    {/* 2. Si está Pendiente: Mostrar Aceptar y Rechazar */}
                    {q.estado === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(q.id, "accepted")}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => updateStatus(q.id, "rejected")}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-200"
                        >
                          Rechazar
                        </button>
                      </>
                    )}

                    {/* 3. Si está Aceptada Y NO tiene venta: Mostrar Facturar */}
                    {q.estado === "accepted" && !q.venta && (
                      <button
                        onClick={() => navigate(`/ventas?quotationId=${q.id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                      >
                        🧾 Facturar
                      </button>
                    )}

                    {/* 4. Si ya tiene venta (fue facturada), mostrar un texto o nada */}
                    {q.estado === "accepted" && q.venta && (
                      <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">
                        Facturada
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No hay cotizaciones registradas aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Historial;
