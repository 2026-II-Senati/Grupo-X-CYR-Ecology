const { Client } = require("../models");

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
    const { ruc, razonSocial, direccion, telefono, atencion } = req.body;

    // Validar que el RUC no exista ya en la base de datos
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
    const { razonSocial, direccion, telefono, atencion } = req.body;

    const client = await Client.findOne({ where: { ruc } });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    client.razonSocial = razonSocial;
    client.direccion = direccion;
    client.telefono = telefono;
    client.atencion = atencion;
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
    // Si el cliente tiene cotizaciones asociadas, Sequelize lanzará un error de Foreign Key
    res.status(500).json({
      message:
        "No se puede eliminar el cliente porque tiene cotizaciones asociadas.",
      error: error.message,
    });
  }
};

module.exports = { getClients, createClient, updateClient, deleteClient };
