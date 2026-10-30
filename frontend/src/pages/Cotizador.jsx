import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PdfGenerator from "../components/PdfGenerator";
import DocumentoPDF from "../components/DocumentoPDF";

const UNITS = [
  "UND",
  "SRV",
  "KG",
  "GLN",
  "LT",
  "M2",
  "M3",
  "ML",
  "HRS",
  "DÍA",
  "MES",
  "CJA",
  "BLS",
  "JGO",
  "PQTE",
];

const Cotizador = () => {
  // Función para obtener la fecha local en formato YYYY-MM-DD (evita el desfase de UTC)
  const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [quoteNumber, setQuoteNumber] = useState("");
  const [date, setDate] = useState(getLocalDate()); // <-- FECHA LOCAL CORREGIDA
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  ); // <-- NUEVO ESTADO DE HORA
  const [currency, setCurrency] = useState("S/");
  const [discount, setDiscount] = useState(0);
  const [includeIgv, setIncludeIgv] = useState(true);

  const [client, setClient] = useState({
    ruc: "",
    razonSocial: "",
    telefono: "",
    direccion: "",
    atencion: "",
  });
  const [items, setItems] = useState([
    { id: Date.now(), cant: 1, unit: "UND", desc: "", price: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [listaClientes, setListaClientes] = useState([]);
  const [cotizacionParaPdf, setCotizacionParaPdf] = useState(null);

  const navigate = useNavigate();

  // Pedir el correlativo automático
  useEffect(() => {
    const fetchNextNumber = async () => {
      try {
        const res = await axiosClient.get("/quotations/next-number");
        setQuoteNumber(res.data.nextNumber);
      } catch (error) {
        setQuoteNumber("00000001");
      }
    };
    fetchNextNumber();
  }, []);

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axiosClient.get("/clients");
        setListaClientes(res.data);
      } catch (error) {
        console.error("Error al cargar clientes", error);
      }
    };
    fetchClientes();
  }, []);

  // Cálculos automáticos
  const subtotal = useMemo(
    () =>
      items.reduce((acc, item) => {
        const cant = parseFloat(item.cant) || 0;
        const price = parseFloat(item.price) || 0;
        return acc + cant * price;
      }, 0),
    [items],
  );
  const discountAmount = useMemo(
    () => subtotal * ((parseFloat(discount) || 0) / 100),
    [subtotal, discount],
  );
  const subtotalAfterDisc = subtotal - discountAmount;
  const igvAmount = includeIgv ? subtotalAfterDisc * 0.18 : 0;
  const total = subtotalAfterDisc + igvAmount;

  // Manejo de ítems
  const addItem = () =>
    setItems([
      ...items,
      { id: Date.now(), cant: 1, unit: "UND", desc: "", price: 0 },
    ]);
  const updateItem = (id, field, value) =>
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  const removeItem = (id) => setItems(items.filter((item) => item.id !== id));

  // Autocompletado (Solo desde la base de datos local)
  const buscarDocumento = (numero) => {
    if (!numero || numero.length < 8) return;

    const clienteLocal = listaClientes.find((c) => c.ruc === numero);
    if (clienteLocal) {
      setClient({
        ruc: clienteLocal.ruc,
        razonSocial: clienteLocal.razonSocial,
        direccion: clienteLocal.direccion || "",
        telefono: clienteLocal.telefono || "",
        atencion: clienteLocal.atencion || "",
      });
    } else {
      const confirmar = window.confirm(
        `El documento ${numero} no está registrado. ¿Deseas registrarlo ahora?`,
      );
      if (confirmar) {
        navigate(`/clientes?ruc=${numero}`);
      } else {
        setClient({
          ruc: "",
          razonSocial: "",
          telefono: "",
          direccion: "",
          atencion: "",
        });
      }
    }
  };

  // Guardar en la Nube y Descargar PDF
  const saveQuotation = async () => {
    if (!client.razonSocial || !client.ruc) {
      alert("Por favor, ingresa el Documento y la Razón Social del cliente.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: `CYRE-${quoteNumber}`,
        fecha: date,
        hora: time, // <-- NUEVO CAMPO
        moneda: currency,
        descuento: discount,
        incluyeIgv: includeIgv,
        subtotal: subtotal,
        igv: igvAmount,
        total: total,
        observaciones: "Cotización generada desde el sistema web",
        validez: 5,
        clientRuc: client.ruc,
        estado: "accepted",
        items: items.map((i) => ({
          cantidad: i.cant,
          unidad: i.unit,
          descripcion: i.desc,
          precioUnitario: i.price,
          total: i.cant * i.price,
        })),
      };

      await axiosClient.post("/quotations", payload);

      setCotizacionParaPdf({
        id: `CYRE-${quoteNumber}`,
        fecha: date,
        hora: time, // <-- NUEVO CAMPO
        subtotal: subtotal,
        descuento: discount,
        igv: igvAmount,
        total: total,
        cliente: client,
        items: payload.items,
      });

      const res = await axiosClient.get("/quotations/next-number");
      setQuoteNumber(res.data.nextNumber);
      setClient({
        ruc: "",
        razonSocial: "",
        telefono: "",
        direccion: "",
        atencion: "",
      });
      setItems([{ id: Date.now(), cant: 1, unit: "UND", desc: "", price: 0 }]);
      setDiscount(0);

      setTimeout(() => setCotizacionParaPdf(null), 2000);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error al guardar la cotización.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col md:flex-row gap-6">
      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <div className="w-full md:w-1/2 space-y-4 overflow-y-auto pb-10">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Datos Generales
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {" "}
            {/* Cambiado a 3 columnas para la hora */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                N° Cotización
              </label>
              <input
                type="text"
                value={quoteNumber}
                readOnly
                className="w-full border p-2 rounded mt-1 bg-gray-100 font-mono font-bold text-green-700"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
            <div>
              {" "}
              {/* NUEVO CAMPO HORA */}
              <label className="text-xs font-bold text-gray-500 uppercase">
                Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Datos del Cliente
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="RUC / DNI"
                value={client.ruc}
                onChange={(e) => {
                  const soloNumeros = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 11);
                  setClient({ ...client, ruc: soloNumeros });
                }}
                className="border p-2 rounded"
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Razón Social / Nombres"
                  value={client.razonSocial}
                  onChange={(e) => {
                    setClient({ ...client, razonSocial: e.target.value });
                    const match = listaClientes.find(
                      (c) => c.razonSocial === e.target.value,
                    );
                    if (match) buscarDocumento(match.ruc);
                  }}
                  list="clientes-list"
                  className="border p-2 rounded w-full"
                />
                <datalist id="clientes-list">
                  {listaClientes.map((c) => (
                    <option key={c.ruc} value={c.razonSocial} />
                  ))}
                </datalist>
              </div>
            </div>
            <input
              type="text"
              placeholder="Dirección"
              value={client.direccion}
              onChange={(e) =>
                setClient({ ...client, direccion: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Teléfono"
                value={client.telefono}
                onChange={(e) =>
                  setClient({
                    ...client,
                    telefono: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Atención a"
                value={client.atencion}
                onChange={(e) =>
                  setClient({
                    ...client,
                    atencion: e.target.value.replace(
                      /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                      "",
                    ),
                  })
                }
                className="border p-2 rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Ítems</h2>
            <button
              onClick={addItem}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700"
            >
              + Agregar
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-2 items-end border-b pb-3 border-gray-100"
              >
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) =>
                      updateItem(item.id, "desc", e.target.value)
                    }
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div className="w-16">
                  <label className="text-[10px] font-bold text-gray-500">
                    Cant.
                  </label>
                  <input
                    type="text"
                    value={item.cant}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "cant",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div className="w-20">
                  <label className="text-[10px] font-bold text-gray-500">
                    Unid.
                  </label>
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(item.id, "unit", e.target.value)
                    }
                    className="w-full border p-2 rounded text-sm"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-bold text-gray-500">
                    P. Unit.
                  </label>
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "price",
                        e.target.value.replace(/[^0-9.]/g, ""),
                      )
                    }
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold">IGV (18%):</label>
              <input
                type="checkbox"
                checked={includeIgv}
                onChange={(e) => setIncludeIgv(e.target.checked)}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold">Descuento (%):</label>
              <input
                type="text"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                className="w-20 border p-2 rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={saveQuotation}
            disabled={saving}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? "Guardando..." : "💾 Guardar en la Nube y Descargar PDF"}
          </button>
        </div>
      </div>

      {/* SECCIÓN DERECHA: VISTA PREVIA CON EL NUEVO COMPONENTE */}
      <div className="w-full md:w-1/2 bg-gray-200 rounded-xl overflow-hidden flex flex-col">
        <div className="bg-gray-800 text-white p-2 text-center text-sm font-bold">
          Vista Previa (A4)
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <DocumentoPDF
            tipoDocumento="COTIZACIÓN"
            numeroDocumento={`CYRE-${quoteNumber}`}
            fecha={date.split("-").reverse().join("/")}
            hora={time} // <-- PASAMOS LA HORA AL PDF
            cliente={client}
            items={items.map((i) => ({
              ...i,
              descripcion: i.desc,
              precioUnitario: i.price,
            }))}
            subtotal={subtotal}
            descuento={discountAmount}
            igv={igvAmount}
            total={total}
            logoUrl={null}
            firmaUrl={null}
          />
        </div>
      </div>

      {/* Generador de PDF invisible para la descarga automática */}
      {cotizacionParaPdf && (
        <PdfGenerator cotizacion={cotizacionParaPdf} autoDownload={true} />
      )}
    </div>
  );
};

export default Cotizador;
