const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");

// GET /api/qr?url=... — generate QR code as base64 PNG
router.get("/", async (req, res) => {
  const { url, table } = req.query;

  const targetUrl = url || `${process.env.FRONTEND_URL || "http://localhost:5173"}${table ? `?table=${table}` : ""}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
      width: 400,
    });

    res.json({ success: true, qr: qrDataUrl, url: targetUrl });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ success: false, message: "Failed to generate QR code" });
  }
});

// GET /api/qr/image?table=1 — return QR as raw PNG image
router.get("/image", async (req, res) => {
  const { table } = req.query;
  const targetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}${table ? `?table=${table}` : ""}`;

  try {
    res.setHeader("Content-Type", "image/png");
    await QRCode.toFileStream(res, targetUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
    });
  } catch (err) {
    console.error("QR image error:", err);
    res.status(500).json({ success: false, message: "Failed to generate QR image" });
  }
});

module.exports = router;
