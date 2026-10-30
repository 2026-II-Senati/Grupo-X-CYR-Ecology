import React from "react";

const DocumentoPDF = ({
  tipoDocumento = "COTIZACIÓN",
  numeroDocumento = "CYRE-00000000",
  fecha = "",
  hora = "", // <-- NUEVO PARÁMETRO
  cliente = {},
  items = [],
  subtotal = 0,
  descuento = 0,
  igv = 0,
  total = 0,
  logoUrl = null,
  firmaUrl = null,
}) => {
  return (
    <div
      className="bg-white text-gray-800"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "15mm",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* CABECERA */}
      <div className="flex justify-between items-start border-b-2 border-green-700 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-32 h-20 flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-400 text-xs text-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span>[Logo]</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-green-800">CYR ECOLOGY</h1>
            <p className="text-xs">RUC: 20455892938</p>
            <p className="text-xs">Arequipa, Perú</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-green-700 text-white px-6 py-1 font-bold text-sm">
            {tipoDocumento}
          </div>
          <div className="border-2 border-green-700 p-2">
            <p className="font-mono text-lg font-bold">{numeroDocumento}</p>
          </div>
          <p className="text-xs mt-2">Fecha: {fecha}</p>
          <p className="text-xs">Hora: {hora || "—"}</p>{" "}
          {/* <-- MOSTRAR HORA */}
        </div>
      </div>

      {/* CLIENTE */}
      <div className="border border-gray-300 rounded-lg p-3 mb-4 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <p className="col-span-3">
            <strong>Señor(es):</strong> {cliente.razonSocial || "—"}
          </p>
          <p>
            <strong>RUC/DNI:</strong> {cliente.ruc || "—"}
          </p>
          <p className="col-span-2">
            <strong>Teléfono:</strong> {cliente.telefono || "—"}
          </p>
          <p className="col-span-3">
            <strong>Dirección:</strong> {cliente.direccion || "—"}
          </p>
        </div>
      </div>

      {/* TABLA ÍTEMS */}
      <table className="w-full text-sm mb-4 border-collapse">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="p-2 border text-center w-10">Item</th>
            <th className="p-2 border text-center w-16">Cant.</th>
            <th className="p-2 border text-left">Descripción</th>
            <th className="p-2 border text-right w-24">P. Unit</th>
            <th className="p-2 border text-right w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2 border-r text-center">{idx + 1}</td>
              <td className="p-2 border-r text-center">
                {item.cantidad || item.cant}
              </td>
              <td className="p-2 border-r">{item.descripcion || item.desc}</td>
              <td className="p-2 border-r text-right">
                S/{" "}
                {parseFloat(item.precioUnitario || item.price || 0).toFixed(2)}
              </td>
              <td className="p-2 text-right">
                S/{" "}
                {parseFloat(item.total || item.cant * item.price || 0).toFixed(
                  2,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CONDICIONES Y TOTALES */}
      <div className="flex gap-4 mb-4">
        <div className="w-1/2 border rounded-lg p-3 text-xs">
          <h3 className="font-bold text-green-800 mb-2">
            CONDICIONES COMERCIALES:
          </h3>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Duración de la oferta: 15 días.</li>
            <li>Condiciones de pago: 50% adelanto, 50% contra entrega.</li>
            <li>Plazo de entrega: Coordinar con el área comercial.</li>
            <li>Precios incluyen IGV salvo indicación contraria.</li>
          </ol>
        </div>
        <div className="w-1/2">
          <div className="border border-green-700 rounded-lg p-3 bg-green-50 text-sm">
            <div className="flex justify-between mb-1">
              <span>Subtotal:</span>{" "}
              <span>S/ {parseFloat(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Op. Gravada:</span>{" "}
              <span>
                S/ {(parseFloat(subtotal) - parseFloat(descuento)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span>IGV (18%):</span>{" "}
              <span>S/ {parseFloat(igv).toFixed(2)}</span>
            </div>
            <div className="border-t-2 border-green-700 mt-2 pt-2 flex justify-between font-bold text-lg text-green-800">
              <span>TOTAL:</span> <span>S/ {parseFloat(total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CUENTAS BANCARIAS */}
      <div className="border rounded-lg p-3 text-xs mb-6">
        <h3 className="font-bold text-green-800 mb-2">CUENTAS BANCARIAS:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>BCP (JOEL ELISEO)</strong>
            </p>
            <p>215-39127788-0-13</p>
            <p>CCI: 002-215-139127788013-26</p>
            <p className="mt-2">
              <strong>CAJA AREQUIPA (CYR ECOLOGY)</strong>
            </p>
            <p>00350272402100001001</p>
          </div>
          <div>
            <p>
              <strong>BN (CYR ECOLOGY)</strong>
            </p>
            <p>Cta Cte: 00-101-346757</p>
            <p>Detracciones: 00-101-376621</p>
            <p className="mt-2">
              <strong>INTERBANK (CYR ECOLOGY)</strong>
            </p>
            <p>Cta Cte: 3003008402600</p>
            <p>CCI: 00330000300840260011</p>
          </div>
        </div>
      </div>

      {/* FIRMA */}
      <div className="w-64">
        <div className="h-24 flex items-end justify-center mb-2">
          {firmaUrl ? (
            <img src={firmaUrl} alt="Firma" className="max-h-full" />
          ) : (
            <span className="text-gray-400 text-sm">[Firma]</span>
          )}
        </div>
        <div className="border-t border-gray-400 pt-1 text-center">
          <p className="font-bold text-green-800">CYR ECOLOGY</p>
          <p className="text-xs text-gray-500">Área Comercial</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentoPDF;
