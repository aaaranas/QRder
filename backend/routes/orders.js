const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const { rows: orders } = await db.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    for (const order of orders) {
      const { rows: items } = await db.query(
        `SELECT oi.*, p.name AS product_name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = items;
    }
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const order = rows[0];
    const { rows: items } = await db.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );
    order.items = items;
    res.json({ success: true, data: order });
  } catch (err) {
    console.error("GET /orders/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
});

// POST /api/orders
router.post("/", async (req, res) => {
  const { customer_name, table_number, items, notes } = req.body;

  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "customer_name and items are required",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    let total_amount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const { rows } = await client.query(
        "SELECT * FROM products WHERE id = $1 AND is_available = true",
        [item.product_id]
      );
      if (rows.length === 0) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({
          success: false,
          message: `Product ID ${item.product_id} is unavailable or not found`,
        });
      }
      const product = rows[0];
      const subtotal = product.price * item.quantity;
      total_amount += subtotal;
      enrichedItems.push({ ...item, price: product.price, subtotal });
    }

    const orderId = uuidv4();
    await client.query(
      `INSERT INTO orders (id, customer_name, table_number, total_amount, notes, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'unpaid')`,
      [orderId, customer_name, table_number || null, total_amount, notes || null]
    );

    for (const item of enrichedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.quantity, item.price, item.subtotal]
      );
    }

    await client.query("COMMIT");
    client.release();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order_id: orderId, total_amount },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    client.release();
    console.error("POST /orders error:", err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res) => {
  const { status, payment_status } = req.body;
  const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
  const validPaymentStatuses = ["unpaid", "paid", "failed"];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }
  if (payment_status && !validPaymentStatuses.includes(payment_status)) {
    return res.status(400).json({ success: false, message: "Invalid payment_status value" });
  }

  try {
    const updates = [];
    const values = [];
    let i = 1;
    if (status)         { updates.push(`status = $${i++}`);         values.push(status); }
    if (payment_status) { updates.push(`payment_status = $${i++}`); values.push(payment_status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id);
    await db.query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${i}`,
      values
    );
    res.json({ success: true, message: "Order updated successfully" });
  } catch (err) {
    console.error("PATCH /orders/:id/status error:", err);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
});

// POST /api/orders/:id/pay
router.post("/:id/pay", async (req, res) => {
  const { method } = req.body;

  try {
    const { rows } = await db.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const success = Math.random() > 0.1; // 90% success

    if (success) {
      await db.query(
        "UPDATE orders SET payment_status = 'paid', payment_method = $1, updated_at = NOW() WHERE id = $2",
        [method || "cash", req.params.id]
      );
      res.json({ success: true, message: "Payment successful! 🎉", payment_status: "paid" });
    } else {
      await db.query(
        "UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = $1",
        [req.params.id]
      );
      res.status(402).json({
        success: false,
        message: "Payment failed. Please try again.",
        payment_status: "failed",
      });
    }
  } catch (err) {
    console.error("POST /orders/:id/pay error:", err);
    res.status(500).json({ success: false, message: "Payment simulation error" });
  }
});

module.exports = router;
