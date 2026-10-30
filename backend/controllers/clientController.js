const { Client } = require("../models");
const fs = require("fs");
const csv = require("csv-parser");

// Obtener todos los clientes (GET)
const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener clientes", error: error.message });
  }
};

// Crear un nuevo cliente (POST)
const createClient = async (req, res) => {
  try {
    const { ruc, razonSocial, direccion, telefono, atencion, email } = req.body;

    const existing = await Client.findOne({ where: { ruc } });
    if (existing) {
      return res.status(400).json({ message: "El RUC ya está registrado" });
    }

    const client = await Client.create({
      ruc,
      razonSocial,
      direccion,
      telefono,
      atencion,
      email,
    });
    res.status(201).json({ message: "Cliente creado exitosamente", client });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear cliente", error: error.message });
  }
};

// Actualizar un cliente existente (PUT)
const updateClient = async (req, res) => {
  try {
    const { ruc } = req.params;
    const { razonSocial, direccion, telefono, atencion, email } = req.body;

    const client = await Client.findOne({ where: { ruc } });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    client.razonSocial = razonSocial;
    client.direccion = direccion;
    client.telefono = telefono;
    client.atencion = atencion;
    client.email = email;
    await client.save();

    res.json({ message: "Cliente actualizado exitosamente", client });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar cliente", error: error.message });
  }
};

// Eliminar un cliente (DELETE)
const deleteClient = async (req, res) => {
  try {
    const { ruc } = req.params;

    const client = await Client.findOne({ where: { ruc } });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await client.destroy();
    res.json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({
      message:
        "No se puede eliminar el cliente porque tiene cotizaciones asociadas.",
      error: error.message,
    });
  }
};

// Importar clientes desde un archivo CSV (NUEVO)
const importClients = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          let inserted = 0;
          let errors = 0;

          for (const row of results) {
            try {
              if (!row.ruc || !row.razonSocial) {
                errors++;
                continue;
              }

              const existing = await Client.findOne({
                where: { ruc: row.ruc },
              });
              if (existing) {
                errors++;
                continue;
              }

              await Client.create({
                ruc: row.ruc,
                razonSocial: row.razonSocial,
                direccion: row.direccion || "",
                telefono: row.telefono || "",
                atencion: row.atencion || "",
                email: row.email || "",
              });
              inserted++;
            } catch (err) {
              errors++;
            }
          }

          // Eliminar archivo temporal
          fs.unlinkSync(filePath);

          res.json({
            message: "Importación completada",
            inserted,
            errors,
            total: results.length,
          });
        } catch (error) {
          res
            .status(500)
            .json({
              message: "Error al procesar el CSV",
              error: error.message,
            });
        }
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al importar clientes", error: error.message });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  importClients,
};
