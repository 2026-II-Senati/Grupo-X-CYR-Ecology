const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inventory = sequelize.define("Inventory", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  stock: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  stockMinimo: { type: DataTypes.DECIMAL(10, 2), defaultValue: 5 },
});

module.exports = Inventory;
