import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🍽️ QR Bistro
      </Link>
      <div className="navbar-links">
        {!isAdmin && (
          <>
            <Link to="/qr">📱 QR Code</Link>
            <button
              className="cart-btn btn"
              style={{ padding: ".4rem .9rem", fontSize: ".85rem" }}
              onClick={() => setIsOpen(true)}
            >
              🛒 Cart
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>
          </>
        )}
        {isAdmin ? (
          <Link to="/">← Customer View</Link>
        ) : (
          <Link to="/admin">Admin</Link>
        )}
      </div>
    </nav>
  );
}
