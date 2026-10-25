import { useNavigate } from "react-router-dom";

const Mantenimiento = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-center">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-10 max-w-md shadow-lg">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-black text-yellow-700 mb-2">
          Módulo en Mantenimiento
        </h1>
        <p className="text-gray-600 mb-6">
          Estamos trabajando para traerte el control de inventario y stock.
          Estará disponible muy pronto.
        </p>
        <button
          onClick={() => navigate("/cotizador")}
          className="bg-green-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-800 transition-colors"
        >
          Volver al Cotizador
        </button>
      </div>
    </div>
  );
};

export default Mantenimiento;
