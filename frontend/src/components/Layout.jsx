import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Cerrar el menú al hacer clic en un enlace (útil en celular)
  const handleLinkClick = () => {
    setMenuAbierto(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* =========================================
          BARRA SUPERIOR MÓVIL (Solo visible en celular)
          ========================================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-green-900 text-white p-4 flex justify-between items-center z-50 shadow-md">
        <h1 className="text-lg font-black tracking-wider">CYR ECOLOGY</h1>
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="text-2xl focus:outline-none"
        >
          {menuAbierto ? "✕" : "☰"}
        </button>
      </div>

      {/* =========================================
          FONDO OSCURO (Al abrir el menú en celular)
          ========================================= */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}

      {/* =========================================
          MENÚ LATERAL (Oculto en celular, visible en PC)
          ========================================= */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-green-900 text-white flex flex-col shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${menuAbierto ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="p-6 border-b border-green-800 hidden md:block">
          <h1 className="text-2xl font-black tracking-wider text-white">
            CYR ECOLOGY
          </h1>
          <p className="text-green-300 text-xs mt-1">Sistema de Gestión</p>
        </div>

        {/* Botón para cerrar el menú (solo en celular) */}
        <div className="p-4 md:hidden flex justify-end">
          <button onClick={() => setMenuAbierto(false)} className="text-2xl">
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/dashboard"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-800"
            }`}
          >
            🏠 Inicio
          </Link>
          <Link
            to="/cotizador"
            onClick={handleLinkClick}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/cotizador"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-800"
            }`}
          >
            📄 Cotizador
          </Link>
          <Link
            to="/clientes"
            onClick={handleLinkClick}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/clientes"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-800"
            }`}
          >
            👥 Clientes
          </Link>
          <Link
            to="/inventario"
            onClick={handleLinkClick}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/inventario"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-800"
            }`}
          >
            📦 Inventario
          </Link>
          <Link
            to="/historial"
            onClick={handleLinkClick}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/historial"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-800"
            }`}
          >
            🕒 Historial cotizaciones
          </Link>
          <Link
            to="/registro-ventas"
            onClick={handleLinkClick}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/registro-ventas"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-800"
            }`}
          >
            💰 Ventas Registradas
          </Link>
          <Link
            to="/reportes"
            onClick={handleLinkClick}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/reportes"
                ? "bg-green-700 font-bold"
                : "hover:bg-green-800"
            }`}
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

      {/* =========================================
          CONTENIDO PRINCIPAL
          ========================================= */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <Outlet /> {/* Aquí se renderizarán las páginas */}
      </main>
    </div>
  );
};

export default Layout;
