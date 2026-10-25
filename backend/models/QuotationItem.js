const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const QuotationItem = sequelize.define("QuotationItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  unidad: { type: DataTypes.STRING(10), defaultValue: "UND" },
  descripcion: { type: DataTypes.STRING, allowNull: false },
  precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

module.exports = QuotationItem;
