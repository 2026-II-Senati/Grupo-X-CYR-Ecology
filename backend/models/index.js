const sequelize = require("../config/database");
const User = require("./User");
const Client = require("./Client");
const Catalog = require("./Catalog");
const Inventory = require("./Inventory");
const Quotation = require("./Quotation");
const QuotationItem = require("./QuotationItem");
const Sale = require("./Sale");

// Relaciones
Client.hasMany(Quotation, { foreignKey: "clientId", as: "cotizaciones" });
Quotation.belongsTo(Client, { foreignKey: "clientId", as: "cliente" });

Quotation.hasMany(QuotationItem, {
  foreignKey: "quotationId",
  as: "items",
  onDelete: "CASCADE",
});
QuotationItem.belongsTo(Quotation, { foreignKey: "quotationId" });

Catalog.hasOne(Inventory, {
  foreignKey: "catalogId",
  as: "inventario",
  onDelete: "CASCADE",
});
Inventory.belongsTo(Catalog, { foreignKey: "catalogId", as: "producto" });

Quotation.hasOne(Sale, { foreignKey: "quotationId", as: "venta" });
Sale.belongsTo(Quotation, { foreignKey: "quotationId", as: "cotizacion" });

module.exports = {
  sequelize,
  User,
  Client,
  Catalog,
  Inventory,
  Quotation,
  QuotationItem,
  Sale,
};
