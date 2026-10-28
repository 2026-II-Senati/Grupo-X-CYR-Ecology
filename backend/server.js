const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

// Importar Rutas
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const saleRoutes = require("./routes/saleRoutes");
const consultaRoutes = require("./routes/consultaRoutes");

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
app.use(
  cors({
    origin: [
      "https://cyr-ecology-fullstack-personal.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// ==========================================
// RUTAS DE LA API
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/consulta", consultaRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend CYR Ecology API v1.0" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log("✅ Conexión a Aiven y tablas sincronizadas.");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
  }
});
