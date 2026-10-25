const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quotation = sequelize.define("Quotation", {
  id: { type: DataTypes.STRING(20), primaryKey: true }, // Ej: CYRE-000111
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  moneda: { type: DataTypes.STRING(3), defaultValue: "S/" },
  descuento: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  incluyeIgv: { type: DataTypes.BOOLEAN, defaultValue: true },
  subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  igv: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  observaciones: { type: DataTypes.TEXT },
  estado: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending",
  },
  validez: { type: DataTypes.INTEGER, defaultValue: 5 },
});

module.exports = Quotation;
