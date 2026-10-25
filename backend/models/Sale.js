const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define("Sale", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numeroComprobante: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  tipoComprobante: {
    type: DataTypes.ENUM("FACTURA", "BOLETA", "NOTA_VENTA"),
    allowNull: false,
  },
  fechaEmision: { type: DataTypes.DATEONLY, allowNull: false },
  montoTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  clienteNombre: { type: DataTypes.STRING },
  clienteDocumento: { type: DataTypes.STRING(20) },
  quotationId: { type: DataTypes.STRING(20), allowNull: false },
});

module.exports = Sale;
