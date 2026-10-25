const consultarDocumento = async (req, res) => {
  const { tipo, numero } = req.params; // tipo: 'dni' o 'ruc'

  if (!numero || numero.length < 8) {
    return res.status(400).json({ message: "Documento inválido" });
  }

  try {
    // La API de decolecta usa endpoints distintos para DNI y RUC
    const url =
      tipo === "dni"
        ? `https://api.decolecta.com/v1/reniec/dni?numero=${numero}`
        : `https://api.decolecta.com/v1/sunat/ruc?numero=${numero}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res
        .status(404)
        .json({ message: "No se encontraron datos para ese documento" });
    }

    const data = await response.json();

    // LOG PARA VER QUÉ DEVUELVE LA API
    console.log("=== RESPUESTA DE LA API ===");
    console.log(JSON.stringify(data, null, 2));
    console.log("===========================");

    // Estandarizar la respuesta para el frontend
    if (tipo === "dni") {
      res.json({
        // Para DNI, armamos el nombre completo
        nombreCompleto:
          data.full_name ||
          `${data.first_name || ""} ${data.first_last_name || ""} ${data.second_last_name || ""}`.trim(),
        direccion: data.direccion || "",
      });
    } else {
      // Para RUC
      res.json({
        ruc: data.ruc || numero,
        // La API de Decolecta suele devolver "razon_social"
        razonSocial:
          data.razon_social ||
          data.razonSocial ||
          data.nombre_o_razon_social ||
          "",
        direccion: data.direccion || "",
      });
    }
  } catch (error) {
    console.error("Error consultando API externa:", error);
    res.status(500).json({ message: "Error al consultar el documento" });
  }
};

module.exports = { consultarDocumento };
