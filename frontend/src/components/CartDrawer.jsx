import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import axios from "axios";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, removeItem, clearCart, totalAmount } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [tableNum, setTableNum] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [payMethod, setPayMethod] = useState("cash");
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState("cart"); // "cart" | "confirm" | "done"

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customer_name: customerName,
        table_number: tableNum,
        notes,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, payload);
      setOrderId(data.data.order_id);
      setStep("confirm");
      toast.success("Order placed! Proceed to payment.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/pay`, { method: payMethod });
      toast.success("🎉 Payment successful!");
      setStep("done");
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setPaying(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (step === "done") {
      setStep("cart");
      setCustomerName("");
      setTableNum("");
      setNotes("");
      setOrderId(null);
    }
  };

  return (
    <>
      <div className="cart-overlay" onClick={handleClose} />
      <aside className="cart-drawer">
        <div className="cart-header">
          <h2>🛒 Your Order</h2>
          <button className="cart-close" onClick={handleClose}>✕</button>
        </div>

        {/* STEP: DONE */}
        {step === "done" && (
          <div className="cart-items" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "4rem" }}>🎉</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem" }}>Order Confirmed!</h3>
            <p style={{ color: "var(--text-muted)" }}>Your order has been placed and payment received. Please wait for your food!</p>
            <button className="btn btn-gold" onClick={handleClose}>Done</button>
          </div>
        )}

        {/* STEP: PAYMENT CONFIRM */}
        {step === "confirm" && (
          <div className="cart-items" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem" }}>💳</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", marginTop: ".5rem" }}>Choose Payment</h3>
              <p style={{ color: "var(--text-muted)", fontSize: ".88rem", marginTop: ".3rem" }}>
                Total: <strong style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>₱{totalAmount.toFixed(2)}</strong>
              </p>
            </div>
            <div className="payment-methods">
              {[
                { id: "cash", icon: "💵", label: "Cash" },
                { id: "gcash", icon: "📱", label: "GCash" },
                { id: "card", icon: "💳", label: "Card" },
              ].map((m) => (
                <button
                  key={m.id}
                  className={`pay-method-btn ${payMethod === m.id ? "selected" : ""}`}
                  onClick={() => setPayMethod(m.id)}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: ".78rem", color: "var(--text-muted)", textAlign: "center" }}>
              ⚠️ This is a simulated payment. No real charges will be made.
            </p>
            <button className="btn btn-gold" onClick={handlePay} disabled={paying} style={{ width: "100%", justifyContent: "center" }}>
              {paying ? "Processing..." : `Pay ₱${totalAmount.toFixed(2)}`}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setStep("cart")} style={{ width: "100%", justifyContent: "center" }}>
              ← Back to Cart
            </button>
          </div>
        )}

        {/* STEP: CART */}
        {step === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="cart-empty">
                <span>🍽️</span>
                <p>Your cart is empty</p>
                <p style={{ fontSize: ".85rem" }}>Add items from the menu</p>
              </div>
            ) : (
              <div className="cart-items">
                {items.map((item) => (
                  <div className="cart-item" key={item.product_id}>
                    <img src={item.image_url} alt={item.name} onError={(e) => (e.target.src = "https://placehold.co/56x56/e8ddd0/7a6b5a?text=food")} />
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₱{(item.price * item.quantity).toFixed(2)}</div>
                      <div className="qty-ctrl" style={{ marginTop: ".4rem" }}>
                        <button onClick={() => updateQty(item.product_id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, +1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.product_id)} title="Remove">🗑</button>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>₱{totalAmount.toFixed(2)}</strong>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", marginBottom: ".85rem" }}>
                <input
                  placeholder="Your name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ padding: ".55rem .8rem", border: "1.5px solid var(--border)", borderRadius: "9px", fontSize: ".9rem", fontFamily: "inherit", outline: "none" }}
                />
                <input
                  placeholder="Table number (optional)"
                  value={tableNum}
                  onChange={(e) => setTableNum(e.target.value)}
                  style={{ padding: ".55rem .8rem", border: "1.5px solid var(--border)", borderRadius: "9px", fontSize: ".9rem", fontFamily: "inherit", outline: "none" }}
                />
                <textarea
                  placeholder="Special requests (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  style={{ padding: ".55rem .8rem", border: "1.5px solid var(--border)", borderRadius: "9px", fontSize: ".85rem", fontFamily: "inherit", outline: "none", resize: "none" }}
                />
              </div>

              <button
                className="btn btn-gold"
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0}
                style={{ width: "100%", justifyContent: "center", padding: ".75rem" }}
              >
                {loading ? "Placing Order…" : "Place Order →"}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
