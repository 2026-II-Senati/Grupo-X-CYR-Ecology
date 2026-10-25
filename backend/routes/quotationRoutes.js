const express = require("express");
const router = express.Router();
const {
  createQuotation,
  getQuotations,
  getNextNumber,
  updateQuotationStatus,
} = require("../controllers/quotationController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/", verifyToken, createQuotation);
router.get("/", verifyToken, getQuotations);
router.get("/next-number", verifyToken, getNextNumber);
router.put("/:id/status", verifyToken, updateQuotationStatus);

module.exports = router;
