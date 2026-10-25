const express = require("express");
const router = express.Router();
const { consultarDocumento } = require("../controllers/consultaController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/:tipo/:numero", verifyToken, consultarDocumento);

module.exports = router;
