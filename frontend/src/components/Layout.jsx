import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Menú Lateral */}
      <aside className="w-64 bg-green-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-green-800">
          <h1 className="text-2xl font-black tracking-wider text-white">
            CYR ECOLOGY
          </h1>
          <p className="text-green-300 text-xs mt-1">Sistema de Gestión</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* NUEVO ENLACE AL DASHBOARD */}
          <Link
            to="/dashboard"
            className="block px-4 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            🏠 Inicio
          </Link>

          <Link
            to="/cotizador"
            className="block px-4 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            📄 Cotizador
          </Link>
          <Link
            to="/clientes"
            className="block px-4 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            👥 Clientes
          </Link>
          <Link
            to="/inventario"
            className="block px-4 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            📦 Inventario
          </Link>
          <Link
            to="/historial"
            className="block px-4 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            🕒 Historial cotizaciones
          </Link>
          <Link
            to="/registro-ventas"
            className="block px-4 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            💰 Ventas Registradas
          </Link>
          <Link
            to="/reportes"
            className="block px-4 py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            📊 Reportes
          </Link>
        </nav>
        <div className="p-4 border-t border-green-800">
          <p className="text-sm font-bold">{user?.name}</p>
          <p className="text-xs text-green-300 mb-3 capitalize">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto">
        <Outlet /> {/* Aquí se renderizarán las páginas */}
      </main>
    </div>
  );
};

export default Layout;
