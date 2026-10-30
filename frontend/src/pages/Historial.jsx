import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PdfGenerator from "../components/PdfGenerator";

const Historial = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activas"); // "activas", "todas", "facturadas"
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

  // Filtrado por búsqueda y por estado
  const filteredQuotations = quotations.filter((q) => {
    // 1. Filtro de búsqueda
    const searchLower = searchTerm.toLowerCase();
    const matchId = (q.id || "").toLowerCase().includes(searchLower);
    const matchRuc = (q.cliente?.ruc || "").includes(searchTerm);
    const matchRazonSocial = (q.cliente?.razonSocial || "")
      .toLowerCase()
      .includes(searchLower);
    const matchBusqueda = matchId || matchRuc || matchRazonSocial;

    // 2. Filtro de estado (simplificado a tu flujo real)
    let matchEstado = true;
    if (filtroEstado === "activas") {
      // Activas = Aceptadas que aún NO se han facturado
      matchEstado = q.estado === "accepted" && !q.venta;
    } else if (filtroEstado === "facturadas") {
      // Solo las que ya tienen una venta asociada
      matchEstado = !!q.venta;
    }

    return matchBusqueda && matchEstado;
  });

  if (loading) return <div className="p-10">Cargando historial...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6">
        Historial de Cotizaciones
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* BARRA DE BÚSQUEDA */}
        <input
          type="text"
          placeholder="🔍 Buscar por N° Cotización, RUC/DNI o Razón Social..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-2/3 border p-3 rounded-lg shadow-sm outline-none focus:border-green-500 bg-white"
        />

        {/* FILTRO POR ESTADO */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="w-full md:w-1/3 border p-3 rounded-lg shadow-sm outline-none focus:border-green-500 bg-white font-bold text-gray-700"
        >
          <option value="activas">🟢 Por Facturar</option>
          <option value="todas">📋 Todas las cotizaciones</option>
          <option value="facturadas">✅ Solo Facturadas</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-700 text-white text-sm">
              <th className="p-3 border-b">N° Cotización</th>
              <th className="p-3 border-b">Fecha y Hora</th>
              <th className="p-3 border-b">Cliente</th>
              <th className="p-3 border-b text-right">Total</th>
              <th className="p-3 border-b text-center">Estado</th>
              <th className="p-3 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 text-sm">
                <td className="p-3 border-b font-mono font-bold text-green-700">
                  {q.id}
                </td>
                <td className="p-3 border-b">
                  {q.fecha.split("-").reverse().join("/")}
                  {q.hora && (
                    <span className="text-gray-500 text-xs ml-2">{q.hora}</span>
                  )}
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
                      q.venta
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {q.venta ? "Facturada" : "Aceptada"}
                  </span>
                </td>

                {/* ACCIONES */}
                <td className="p-3 border-b">
                  <div className="flex items-center justify-center gap-2">
                    <PdfGenerator cotizacion={q} />

                    {!q.venta && (
                      <button
                        onClick={() => navigate(`/ventas?quotationId=${q.id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                      >
                        🧾 Facturar
                      </button>
                    )}

                    {q.venta && (
                      <span className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        ✔ Ya facturada
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredQuotations.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  {searchTerm
                    ? `No se encontraron resultados para "${searchTerm}"`
                    : "No hay cotizaciones que coincidan con el filtro."}
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
