const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Catalog = sequelize.define("Catalog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING, allowNull: false },
  precio: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  unidad: { type: DataTypes.STRING(10), defaultValue: "UND" },
});

module.exports = Catalog;
