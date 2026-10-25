import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const Dashboard = () => {
  const [stats, setStats] = useState({
    clientes: 0,
    cotizaciones: 0,
    ventasTotales: 0,
    montoVentas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resClients, resQuotations, resSales] = await Promise.all([
          axiosClient.get("/clients"),
          axiosClient.get("/quotations"),
          axiosClient.get("/sales"),
        ]);

        const ventas = resSales.data;
        const montoTotal = ventas.reduce(
          (acc, v) => acc + parseFloat(v.montoTotal),
          0,
        );

        setStats({
          clientes: resClients.data.length,
          cotizaciones: resQuotations.data.length,
          ventasTotales: ventas.length,
          montoVentas: montoTotal,
        });
      } catch (error) {
        console.error("Error al cargar estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10">Cargando dashboard...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800">
          Bienvenido a CYR Ecology
        </h1>
        <p className="text-gray-500 mt-1">
          Resumen general de tu actividad comercial
        </p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Clientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-xl text-2xl">
            👥
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">
              Clientes Registrados
            </p>
            <p className="text-3xl font-black text-gray-800">
              {stats.clientes}
            </p>
          </div>
        </div>

        {/* Cotizaciones */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-yellow-100 text-yellow-600 p-4 rounded-xl text-2xl">
            📄
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">
              Cotizaciones Emitidas
            </p>
            <p className="text-3xl font-black text-gray-800">
              {stats.cotizaciones}
            </p>
          </div>
        </div>

        {/* Ventas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-xl text-2xl">
            💰
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">
              Comprobantes Emitidos
            </p>
            <p className="text-3xl font-black text-gray-800">
              {stats.ventasTotales}
            </p>
          </div>
        </div>

        {/* Monto Total */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-xl text-2xl">
            📈
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-black text-gray-800">
              S/ {stats.montoVentas.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
