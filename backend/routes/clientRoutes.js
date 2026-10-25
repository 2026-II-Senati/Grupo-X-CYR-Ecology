const express = require("express");
const router = express.Router();
const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/", verifyToken, getClients);
router.post("/", verifyToken, createClient);
router.put("/:ruc", verifyToken, updateClient);
router.delete("/:ruc", verifyToken, deleteClient);

module.exports = router;
