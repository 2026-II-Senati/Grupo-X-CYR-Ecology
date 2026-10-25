import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    ruc: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    atencion: "",
  });
  const [tipoDocumento, setTipoDocumento] = useState("RUC");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Estado para editar y para la búsqueda
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const location = useLocation();

  // Cargar clientes al iniciar
  useEffect(() => {
    fetchClients();
  }, []);

  // Leer el RUC de la URL si viene desde el Cotizador
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const rucFromUrl = queryParams.get("ruc");
    if (rucFromUrl) {
      setForm((prev) => ({ ...prev, ruc: rucFromUrl }));
      if (rucFromUrl.length === 8) setTipoDocumento("DNI");
    }
  }, [location]);

  const fetchClients = async () => {
    try {
      const res = await axiosClient.get("/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  // Consultar SUNAT / RENIEC
  const consultarDocumento = async () => {
    if (!form.ruc || form.ruc.length < 8) {
      setMessage("Ingresa un documento válido para consultar.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axiosClient.get(
        `/consulta/${tipoDocumento.toLowerCase()}/${form.ruc}`,
      );
      const data = res.data;

      if (tipoDocumento === "RUC") {
        setForm({
          ...form,
          razonSocial: data.razonSocial || data.nombre_o_razon_social || "",
          direccion: data.direccion || "",
        });
      } else {
        setForm({
          ...form,
          razonSocial: data.nombreCompleto || "",
          direccion: data.direccion || "",
        });
      }
      setMessage("Datos cargados desde SUNAT/RENIEC exitosamente.");
    } catch (error) {
      setMessage(
        "No se pudo consultar la API. Puedes ingresar los datos manualmente.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Guardar (Crear o Actualizar) Cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (editando) {
        await axiosClient.put(`/clients/${form.ruc}`, form);
        setMessage("Cliente actualizado exitosamente");
        setEditando(false);
      } else {
        await axiosClient.post("/clients", form);
        setMessage("Cliente guardado exitosamente");
      }

      setForm({
        ruc: "",
        razonSocial: "",
        direccion: "",
        telefono: "",
        atencion: "",
      });
      setTipoDocumento("RUC");
      fetchClients();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error al procesar el cliente",
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos en el formulario para editar
  const handleEditar = (cliente) => {
    setForm({
      ruc: cliente.ruc,
      razonSocial: cliente.razonSocial,
      direccion: cliente.direccion || "",
      telefono: cliente.telefono || "",
      atencion: cliente.atencion || "",
    });
    setEditando(true);
    setMessage("");
    if (cliente.ruc.length === 8) setTipoDocumento("DNI");
    else setTipoDocumento("RUC");
  };

  // Eliminar cliente
  const handleEliminar = async (ruc) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.",
    );
    if (!confirmar) return;

    try {
      await axiosClient.delete(`/clients/${ruc}`);
      setMessage("Cliente eliminado exitosamente");
      fetchClients();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Error al eliminar el cliente. Puede tener cotizaciones asociadas.",
      );
    }
  };

  // Cancelar la edición
  const handleCancelarEdicion = () => {
    setForm({
      ruc: "",
      razonSocial: "",
      direccion: "",
      telefono: "",
      atencion: "",
    });
    setEditando(false);
    setTipoDocumento("RUC");
    setMessage("");
  };

  // Filtrado de clientes en tiempo real
  const clientesFiltrados = clients.filter(
    (c) =>
      c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ruc.includes(busqueda),
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6">
        Gestión de Clientes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editando ? "Editar Cliente" : "Registrar Nuevo Cliente"}
          </h2>

          {message && (
            <div
              className={`p-3 rounded mb-4 text-sm font-bold ${message.includes("exitosamente") || message.includes("cargados") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {message}
            </div>
          )}

          {!editando && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setTipoDocumento("RUC");
                  setForm({ ...form, ruc: "" });
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${tipoDocumento === "RUC" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
              >
                RUC (11 dígitos)
              </button>
              <button
                onClick={() => {
                  setTipoDocumento("DNI");
                  setForm({ ...form, ruc: "" });
                }}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${tipoDocumento === "DNI" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
              >
                DNI (8 dígitos)
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {tipoDocumento === "RUC" ? "RUC" : "DNI"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={tipoDocumento === "RUC" ? 11 : 8}
                  value={form.ruc}
                  onChange={(e) => {
                    const maxLen = tipoDocumento === "RUC" ? 11 : 8;
                    setForm({
                      ...form,
                      ruc: e.target.value.replace(/\D/g, "").slice(0, maxLen),
                    });
                  }}
                  disabled={editando}
                  className={`w-full border p-2 rounded focus:border-green-500 outline-none ${editando ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder={
                    tipoDocumento === "RUC" ? "20455892938" : "12345678"
                  }
                />
                {!editando && (
                  <button
                    type="button"
                    onClick={consultarDocumento}
                    disabled={loading}
                    className="bg-blue-600 text-white px-3 py-2 rounded font-bold hover:bg-blue-700 disabled:bg-blue-300 whitespace-nowrap"
                  >
                    {loading ? "..." : "Consultar"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {tipoDocumento === "RUC"
                  ? "Razón Social"
                  : "Nombres y Apellidos"}
              </label>
              <input
                type="text"
                required
                value={form.razonSocial}
                onChange={(e) =>
                  setForm({ ...form, razonSocial: e.target.value })
                }
                className="w-full border p-2 rounded focus:border-green-500 outline-none"
                placeholder={
                  tipoDocumento === "RUC" ? "CYR ECOLOGY S.A.C." : "Juan Pérez"
                }
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={form.direccion}
                onChange={(e) =>
                  setForm({ ...form, direccion: e.target.value })
                }
                className="w-full border p-2 rounded focus:border-green-500 outline-none"
                placeholder="Av. Principal 123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      telefono: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full border p-2 rounded focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Atención a
                </label>
                <input
                  type="text"
                  value={form.atencion}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      atencion: e.target.value.replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                        "",
                      ),
                    })
                  }
                  className="w-full border p-2 rounded focus:border-green-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-700 text-white font-bold py-2 rounded-lg hover:bg-green-800 disabled:bg-green-300"
              >
                {loading
                  ? "Procesando..."
                  : editando
                    ? "Actualizar Cliente"
                    : "Guardar Cliente"}
              </button>

              {editando && (
                <button
                  type="button"
                  onClick={handleCancelarEdicion}
                  className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Clientes Registrados ({clientesFiltrados.length})
            </h2>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Buscar por RUC/DNI o Razón Social..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border p-2 rounded-lg focus:border-green-500 outline-none bg-gray-50"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {clientesFiltrados.map((c) => (
              <div
                key={c.ruc}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-gray-800 truncate">
                    {c.razonSocial}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    Doc: {c.ruc}
                  </p>
                  {c.direccion && (
                    <p className="text-xs text-gray-400 truncate">
                      {c.direccion}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEditar(c)}
                    className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleEliminar(c.ruc)}
                    className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {clientesFiltrados.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-10">
                {busqueda
                  ? "No se encontraron clientes con esa búsqueda."
                  : "No hay clientes registrados."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
