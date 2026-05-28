const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM products WHERE is_available = true ORDER BY category, name"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM products WHERE id = $1", [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
});

module.exports = router;
