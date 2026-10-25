import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Cotizador from "./pages/Cotizador";
import Clientes from "./pages/Clientes";
import Historial from "./pages/Historial";
import Ventas from "./pages/Ventas";
import RegistroVentas from "./pages/RegistroVentas";
import Mantenimiento from "./pages/Mantenimiento";
import Reportes from "./pages/Reportes";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cotizador" element={<Cotizador />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="historial" element={<Historial />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="registro-ventas" element={<RegistroVentas />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="inventario" element={<Mantenimiento />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
