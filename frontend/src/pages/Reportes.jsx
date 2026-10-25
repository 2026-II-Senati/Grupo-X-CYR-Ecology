import { useState, useEffect, useMemo, useRef } from "react";
import axiosClient from "../api/axiosClient";
import html2pdf from "html2pdf.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Reportes = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([
    "FACTURA",
    "BOLETA",
    "NOTA_VENTA",
  ]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const reportRef = useRef();

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

  const handleTipoChange = (tipo) => {
    if (tiposSeleccionados.includes(tipo)) {
      setTiposSeleccionados(tiposSeleccionados.filter((t) => t !== tipo));
    } else {
      setTiposSeleccionados([...tiposSeleccionados, tipo]);
    }
  };

  const ventasFiltradas = useMemo(() => {
    return sales.filter((s) => {
      const coincideTipo = tiposSeleccionados.includes(s.tipoComprobante);
      let coincideFecha = true;
      if (fechaInicio)
        coincideFecha = coincideFecha && s.fechaEmision >= fechaInicio;
      if (fechaFin) coincideFecha = coincideFecha && s.fechaEmision <= fechaFin;
      return coincideTipo && coincideFecha;
    });
  }, [sales, tiposSeleccionados, fechaInicio, fechaFin]);

  const datosGrafico = useMemo(() => {
    const conteo = { FACTURA: 0, BOLETA: 0, NOTA_VENTA: 0 };
    ventasFiltradas.forEach((s) => {
      if (conteo[s.tipoComprobante] !== undefined) {
        conteo[s.tipoComprobante] += parseFloat(s.montoTotal);
      }
    });

    const data = [];
    if (tiposSeleccionados.includes("FACTURA"))
      data.push({ name: "Facturas", monto: conteo.FACTURA });
    if (tiposSeleccionados.includes("BOLETA"))
      data.push({ name: "Boletas", monto: conteo.BOLETA });
    if (tiposSeleccionados.includes("NOTA_VENTA"))
      data.push({ name: "Notas Venta", monto: conteo.NOTA_VENTA });

    return data;
  }, [ventasFiltradas, tiposSeleccionados]);

  const totalIngresos = ventasFiltradas.reduce(
    (acc, s) => acc + parseFloat(s.montoTotal),
    0,
  );

  const generarReportePDF = () => {
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Reporte-Ventas-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // Evita cortes en la tabla
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div className="p-10">Cargando reportes...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-800">
          Reportes de Ventas
        </h1>
        <button
          onClick={generarReportePDF}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-800 flex items-center gap-2"
        >
          📄 Descargar Reporte PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-6 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Tipo Comprobante
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tiposSeleccionados.includes("FACTURA")}
                onChange={() => handleTipoChange("FACTURA")}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Facturas
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tiposSeleccionados.includes("BOLETA")}
                onChange={() => handleTipoChange("BOLETA")}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-medium text-gray-700">Boletas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tiposSeleccionados.includes("NOTA_VENTA")}
                onChange={() => handleTipoChange("NOTA_VENTA")}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Notas de Venta
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Desde
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={() => {
            setTiposSeleccionados(["FACTURA", "BOLETA", "NOTA_VENTA"]);
            setFechaInicio("");
            setFechaFin("");
          }}
          className="text-sm text-gray-500 hover:text-gray-800 font-bold px-3 py-2"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Área del reporte para PDF */}
      <div
        ref={reportRef}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6"
      >
        <div className="text-center border-b-2 border-green-700 pb-4">
          <h2 className="text-2xl font-black text-green-800">CYR ECOLOGY</h2>
          <p className="text-sm text-gray-500">Reporte de Ventas</p>
          <p className="text-xs text-gray-400">
            Generado el {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 font-bold">
              Total Transacciones
            </p>
            <p className="text-3xl font-black text-gray-800">
              {ventasFiltradas.length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm text-green-600 font-bold">Ingresos Totales</p>
            <p className="text-3xl font-black text-green-700">
              S/ {totalIngresos.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 font-bold">Filtro Aplicado</p>
            <p className="text-lg font-bold text-gray-700">
              {tiposSeleccionados.length === 3
                ? "Todos"
                : tiposSeleccionados
                    .map((t) => (t === "NOTA_VENTA" ? "Nota Venta" : t))
                    .join(", ")}
            </p>
          </div>
        </div>

        {/* Gráfico (con tamaño fijo para evitar cortes en el PDF) */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Ingresos por Tipo de Comprobante
          </h3>
          <div
            className="w-full bg-white flex justify-center"
            style={{ width: "100%", height: "320px" }}
          >
            <BarChart
              width={700}
              height={300}
              data={datosGrafico}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
              <Legend />
              <Bar
                dataKey="monto"
                name="Monto Total (S/)"
                fill="#15803d"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </div>
        </div>

        {/* Tabla de Ventas Filtradas */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Detalle de Ventas
          </h3>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 border border-gray-200">N° Comprobante</th>
                <th className="p-2 border border-gray-200">Fecha</th>
                <th className="p-2 border border-gray-200">Cliente</th>
                <th className="p-2 border border-gray-200">Tipo</th>
                <th className="p-2 border border-gray-200 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-2 border border-gray-200 font-mono">
                    {s.numeroComprobante}
                  </td>
                  <td className="p-2 border border-gray-200">
                    {s.fechaEmision.split("-").reverse().join("/")}
                  </td>
                  <td className="p-2 border border-gray-200">
                    {s.clienteNombre}
                  </td>
                  <td className="p-2 border border-gray-200">
                    {s.tipoComprobante}
                  </td>
                  <td className="p-2 border border-gray-200 text-right font-mono">
                    S/ {parseFloat(s.montoTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
