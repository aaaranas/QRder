import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import MenuPage from "./pages/MenuPage";
import AdminPage from "./pages/AdminPage";
import QRPage from "./pages/QRPage";

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <CartDrawer />
      <main>
        <Routes>
          <Route path="/"       element={<MenuPage />} />
          <Route path="/admin"  element={<AdminPage />} />
          <Route path="/qr"     element={<QRPage />} />
          <Route path="*"       element={
            <div className="loading-wrap" style={{ paddingTop: "6rem" }}>
              <span style={{ fontSize: "3rem" }}>🍽️</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }}>404 — Page not found</h2>
              <a href="/" className="btn btn-gold" style={{ marginTop: ".5rem" }}>Back to Menu</a>
            </div>
          } />
        </Routes>
      </main>
    </CartProvider>
  );
}
