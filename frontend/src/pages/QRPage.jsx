import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const BASE_URL = window.location.origin;

export default function QRPage() {
  const [tableNumber, setTableNumber] = useState("");
  const [generated, setGenerated] = useState(false);
  const qrRef = useRef(null);

  const orderUrl = tableNumber
    ? `${BASE_URL}/?table=${encodeURIComponent(tableNumber)}`
    : `${BASE_URL}/`;

  const handleGenerate = () => setGenerated(true);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-table${tableNumber || "-menu"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWin = window.open("", "_blank");
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || !printWin) return;
    printWin.document.write(`
      <html>
        <head><title>QR Code - Table ${tableNumber || "Menu"}</title>
        <style>
          body { display:flex; align-items:center; justify-content:center; min-height:100vh; flex-direction:column; font-family: sans-serif; gap: 1rem; }
          h2 { font-size: 1.5rem; color: #1a1a2e; }
          p  { color: #7a6b5a; font-size: .9rem; }
        </style></head>
        <body>
          <h2>🍽️ QR Bistro${tableNumber ? ` — Table ${tableNumber}` : ""}</h2>
          ${svg.outerHTML}
          <p>Scan to view our menu and order online</p>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  const handleReset = () => {
    setGenerated(false);
    setTableNumber("");
  };

  return (
    <div className="qr-page">
      <div className="qr-card">
        <h2>📱 QR Code Generator</h2>
        <p>Generate a scannable QR code customers can use to access your menu instantly.</p>

        {!generated ? (
          <>
            <div className="qr-table-input">
              <input
                type="text"
                placeholder="Table number (e.g. 5)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                maxLength={10}
              />
              <button className="btn btn-primary" onClick={handleGenerate}>
                Generate
              </button>
            </div>
            <p style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>
              Leave blank to generate a general menu QR code.
            </p>
          </>
        ) : (
          <>
            <div className="qr-display" ref={qrRef}>
              <QRCodeSVG
                value={orderUrl}
                size={220}
                level="H"
                fgColor="#1a1a2e"
                bgColor="#ffffff"
                includeMargin={false}
                imageSettings={{
                  src: "",
                  excavate: false,
                }}
              />
            </div>

            {tableNumber && (
              <div style={{
                marginBottom: "1rem",
                background: "var(--bg-dark)",
                color: "var(--gold)",
                borderRadius: "10px",
                padding: ".6rem 1rem",
                fontWeight: "700",
                fontSize: "1.1rem",
                letterSpacing: ".05em"
              }}>
                🪑 Table {tableNumber}
              </div>
            )}

            <div className="qr-url" style={{ marginBottom: "1.25rem" }}>
              🔗 {orderUrl}
            </div>

            <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={handleDownload}>
                ⬇️ Download SVG
              </button>
              <button className="btn btn-gold" onClick={handlePrint}>
                🖨️ Print
              </button>
              <button className="btn btn-outline" onClick={handleReset}>
                🔄 New QR
              </button>
            </div>

            <p style={{ fontSize: ".8rem", color: "var(--text-muted)", marginTop: "1.25rem" }}>
              Tip: Print and laminate this QR code, then place it on the table so customers can scan it with their phone camera.
            </p>
          </>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        maxWidth: "480px",
        width: "100%",
        marginTop: "1.5rem",
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        border: "1px solid var(--border)"
      }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: ".85rem" }}>
          How it works
        </h3>
        {[
          { icon: "1️⃣", text: "Enter a table number (optional) and click Generate." },
          { icon: "2️⃣", text: "Download or print the QR code." },
          { icon: "3️⃣", text: "Place it on the restaurant table." },
          { icon: "4️⃣", text: "Customers scan it with their phone camera to open the menu and place orders directly." },
        ].map((step) => (
          <div key={step.icon} style={{ display: "flex", gap: ".75rem", alignItems: "flex-start", marginBottom: ".65rem" }}>
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{step.icon}</span>
            <p style={{ fontSize: ".88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
