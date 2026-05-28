import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1a1a2e",
            color: "#f5e6d0",
            border: "1px solid #c9a96e",
            borderRadius: "12px",
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
