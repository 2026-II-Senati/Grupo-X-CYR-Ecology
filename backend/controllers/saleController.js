const { Sale, Quotation, QuotationItem, Client } = require("../models");

const createSale = async (req, res) => {
  try {
    const { quotationId, tipoComprobante, clienteNombre, clienteDocumento } =
      req.body;

    const quotation = await Quotation.findByPk(quotationId);
    if (!quotation)
      return res.status(404).json({ message: "Cotización no encontrada" });

    const existingSale = await Sale.findOne({ where: { quotationId } });
    if (existingSale)
      return res
        .status(400)
        .json({ message: "Esta cotización ya fue facturada." });

    // 1. Definir el prefijo según el tipo
    const prefix =
      tipoComprobante === "FACTURA"
        ? "F001"
        : tipoComprobante === "BOLETA"
          ? "B001"
          : "NV01";

    // 2. Buscar la última venta SOLO de este tipo de comprobante
    const lastSale = await Sale.findOne({
      where: { tipoComprobante },
      order: [["id", "DESC"]],
    });

    // 3. Calcular el siguiente número para esa serie específica
    let nextId = 1;
    if (lastSale && lastSale.numeroComprobante) {
      // Extraemos la parte numérica (ej. de "F001-00000005" sacamos "00000005")
      const parts = lastSale.numeroComprobante.split("-");
      if (parts.length === 2) {
        const lastNumber = parseInt(parts[1]);
        if (!isNaN(lastNumber)) {
          nextId = lastNumber + 1;
        }
      }
    }

    const numeroComprobante = `${prefix}-${String(nextId).padStart(8, "0")}`;

    const sale = await Sale.create({
      numeroComprobante,
      tipoComprobante,
      fechaEmision: new Date().toISOString().split("T")[0],
      montoTotal: quotation.total,
      clienteNombre,
      clienteDocumento,
      quotationId,
    });

    res.status(201).json({ message: "Venta registrada exitosamente", sale });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res
      .status(500)
      .json({ message: "Error al registrar venta", error: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        {
          model: Quotation,
          as: "cotizacion",
          include: [
            { model: QuotationItem, as: "items" },
            { model: Client, as: "cliente" },
          ],
        },
      ],
      order: [["fechaEmision", "DESC"]],
    });
    res.json(sales);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res
      .status(500)
      .json({ message: "Error al obtener ventas", error: error.message });
  }
};

module.exports = { createSale, getSales };
