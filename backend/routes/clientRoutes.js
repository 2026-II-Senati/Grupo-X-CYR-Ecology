const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  importClients,
} = require("../controllers/clientController");
const verifyToken = require("../middlewares/authMiddleware");

// Configurar multer para guardar archivos temporalmente en la carpeta "uploads"
const upload = multer({ dest: "uploads/" });

router.get("/", verifyToken, getClients);
router.post("/", verifyToken, createClient);
router.post("/import", verifyToken, upload.single("file"), importClients); // <-- RUTA DE IMPORTACIÓN
router.put("/:ruc", verifyToken, updateClient);
router.delete("/:ruc", verifyToken, deleteClient);

module.exports = router;
