import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Starters", "Main Course", "Rice & Sides", "Drinks", "Desserts"];

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { addItem, updateQty, items, setIsOpen } = useCart();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  useEffect(() => {
    axios
      .get("/api/products")
      .then(({ data }) => setProducts(data.data))
      .catch(() => toast.error("Failed to load menu"))
      .finally(() => setLoading(false));
  }, []);

  const getCartItem = (productId) => items.find((i) => i.product_id === productId);

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        <p>Loading menu…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="menu-hero">
        <h1>Today's Menu</h1>
        <p>Fresh flavors, crafted with care</p>
        {tableNumber && (
          <div className="table-tag">🪑 Table {tableNumber}</div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="category-tabs container">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="menu-grid container">
        {filtered.map((product) => {
          const cartItem = getCartItem(product.id);
          return (
            <div className="menu-card" key={product.id}>
              <img
                className="menu-card-img"
                src={product.image_url}
                alt={product.name}
                onError={(e) =>
                  (e.target.src = "https://placehold.co/400x170/e8ddd0/7a6b5a?text=Food")
                }
              />
              <div className="menu-card-body">
                <div className="menu-card-name">{product.name}</div>
                <div className="menu-card-desc">{product.description}</div>
                <div className="menu-card-footer">
                  <span className="menu-card-price">₱{Number(product.price).toFixed(2)}</span>

                  {cartItem ? (
                    <div className="in-cart-ctrl">
                      <div className="qty-ctrl">
                        <button onClick={() => updateQty(product.id, -1)}>−</button>
                        <span>{cartItem.quantity}</span>
                        <button onClick={() => updateQty(product.id, +1)}>+</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="add-btn"
                      onClick={() => {
                        addItem(product);
                        toast.success(`${product.name} added!`, { icon: "🛒" });
                      }}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart CTA (mobile) */}
      <div style={{ height: "80px" }} />
    </div>
  );
}
