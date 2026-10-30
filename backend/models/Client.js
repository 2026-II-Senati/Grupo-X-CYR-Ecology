const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Client = sequelize.define("Client", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ruc: { type: DataTypes.STRING(11), allowNull: false, unique: true },
  razonSocial: { type: DataTypes.STRING, allowNull: false },
  direccion: { type: DataTypes.STRING },
  telefono: { type: DataTypes.STRING },
  atencion: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING }, // <-- ESTA LÍNEA ES VITAL
});

module.exports = Client;
