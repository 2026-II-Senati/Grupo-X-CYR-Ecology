const { Quotation, QuotationItem, Client, Sale } = require("../models");
const sequelize = require("../config/database");

// Crear una cotización con sus ítems
const createQuotation = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      id,
      fecha,
      moneda,
      descuento,
      incluyeIgv,
      subtotal,
      igv,
      total,
      observaciones,
      validez,
      clientRuc,
      items,
      estado,
    } = req.body;

    const client = await Client.findOne({ where: { ruc: clientRuc } });
    if (!client) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Cliente no encontrado. Créelo primero." });
    }

    const quotation = await Quotation.create(
      {
        id,
        fecha,
        moneda,
        descuento,
        incluyeIgv,
        subtotal,
        igv,
        total,
        observaciones,
        validez,
        estado: estado || "pending",
        clientId: client.id,
      },
      { transaction: t },
    );

    if (items && items.length > 0) {
      const itemsData = items.map((item) => ({
        ...item,
        quotationId: quotation.id,
      }));
      await QuotationItem.bulkCreate(itemsData, { transaction: t });
    }

    await t.commit();
    res.status(201).json({
      message: "Cotización guardada exitosamente",
      quotationId: quotation.id,
    });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ message: "Error al guardar cotización", error: error.message });
  }
};

// Obtener historial de cotizaciones
const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      include: [
        { model: Client, as: "cliente" },
        { model: QuotationItem, as: "items" },
        { model: Sale, as: "venta" },
      ],
      order: [["fecha", "DESC"]],
    });
    res.json(quotations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener historial", error: error.message });
  }
};

// Obtener el siguiente número correlativo
const getNextNumber = async (req, res) => {
  try {
    const lastQuotation = await Quotation.findOne({
      order: [["createdAt", "DESC"]],
    });

    let nextNumber = "00000001";

    if (lastQuotation && lastQuotation.id) {
      const currentNum = parseInt(lastQuotation.id.replace("CYRE-", ""));
      if (!isNaN(currentNum)) {
        nextNumber = String(currentNum + 1).padStart(8, "0");
      }
    }

    res.json({ nextNumber });
  } catch (error) {
    console.error("Error en getNextNumber:", error);
    res
      .status(500)
      .json({ message: "Error al obtener correlativo", error: error.message });
  }
};

// Actualizar el estado de una cotización
const updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const quotation = await Quotation.findByPk(id);
    if (!quotation) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    quotation.estado = estado;
    await quotation.save();

    res.json({ message: "Estado actualizado correctamente", quotation });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar estado", error: error.message });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  getNextNumber,
  updateQuotationStatus,
};
