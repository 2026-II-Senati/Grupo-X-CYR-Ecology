const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: process.env.CA_CERT
          ? process.env.CA_CERT.replace(/\\n/g, "\n")
          : fs.readFileSync(path.join(__dirname, "..", "ca.pem")),
      },
    },
    logging: false, // Cambiar a console.log para ver el SQL
  },
);

module.exports = sequelize;
