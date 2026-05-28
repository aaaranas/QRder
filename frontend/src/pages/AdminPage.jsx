import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ORDER_STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "failed"];

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    axios
      .get("/api/orders")
      .then(({ data }) => setOrders(data.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrder = async (id, field, value) => {
    setUpdating(id + field);
    try {
      await axios.patch(`/api/orders/${id}/status`, { [field]: value });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
      );
      toast.success("Order updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Stats
  const total = orders.length;
  const revenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((s, o) => s + Number(o.total_amount), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const preparing = orders.filter((o) => o.status === "preparing").length;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>🍽️ Admin Dashboard</h1>
        <button className="btn btn-outline btn-sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }} onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </header>

      <div className="admin-body">
        {/* Stats */}
        <div className="admin-stats">
          {[
            { label: "Total Orders", value: total },
            { label: "Pending", value: pending },
            { label: "Preparing", value: preparing },
            { label: "Revenue (₱)", value: `₱${revenue.toFixed(2)}` },
          ].map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="label">{s.label}</div>
              <div className="value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {["all", ...ORDER_STATUSES].map((f) => (
            <button
              key={f}
              className={`cat-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="loading-wrap" style={{ padding: "3rem" }}>
            <div className="spinner" />
            <p>Loading orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="loading-wrap" style={{ padding: "3rem" }}>
            <span style={{ fontSize: "2.5rem" }}>📋</span>
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontSize: ".75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {order.id.slice(0, 8)}…
                    </td>
                    <td>
                      <strong>{order.customer_name}</strong>
                      {order.notes && (
                        <div style={{ fontSize: ".78rem", color: "var(--text-muted)", marginTop: ".1rem" }}>
                          📝 {order.notes}
                        </div>
                      )}
                    </td>
                    <td>{order.table_number || "—"}</td>
                    <td>
                      {order.items?.map((item) => (
                        <div key={item.id} className="order-items-mini">
                          {item.quantity}× {item.product_name}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: "700", fontFamily: "'Playfair Display', serif" }}>
                      ₱{Number(order.total_amount).toFixed(2)}
                    </td>
                    <td>
                      <select
                        className="select-status"
                        value={order.status}
                        disabled={updating === order.id + "status"}
                        onChange={(e) => updateOrder(order.id, "status", e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select-status"
                        value={order.payment_status}
                        disabled={updating === order.id + "payment_status"}
                        onChange={(e) => updateOrder(order.id, "payment_status", e.target.value)}
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`badge badge-${order.payment_status}`}>
                        {order.payment_method || "—"}
                      </span>
                    </td>
                    <td style={{ fontSize: ".78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
