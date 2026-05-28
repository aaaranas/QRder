require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const qrRouter = require("./routes/qr");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "🍽️ Mini QR Ordering API is running!" }));

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/qr", qrRouter);

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API endpoints:`);
  console.log(`   GET  /api/products`);
  console.log(`   POST /api/orders`);
  console.log(`   GET  /api/orders`);
  console.log(`   GET  /api/qr\n`);
});
