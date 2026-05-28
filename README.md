# 🍽️ Mini QR Ordering System

A full-stack restaurant QR ordering system built with **React + Vite** (frontend) and **Node.js + Express** (backend), using **MySQL** as the database.

---

## 📁 Project Structure

```
mini-qr-ordering/
├── backend/
│   ├── routes/
│   │   ├── products.js      # GET /api/products
│   │   ├── orders.js        # POST/GET /api/orders, PATCH status, POST pay
│   │   └── qr.js            # GET /api/qr
│   ├── db.js                # MySQL connection pool
│   ├── server.js            # Express app entry point
│   ├── .env.example         # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── CartDrawer.jsx
│   │   ├── context/
│   │   │   └── CartContext.jsx   # Global cart state
│   │   ├── pages/
│   │   │   ├── MenuPage.jsx      # Customer menu + ordering
│   │   │   ├── AdminPage.jsx     # Admin dashboard
│   │   │   └── QRPage.jsx        # QR code generator
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database.sql             # Full schema + seed data
└── README.md
```

---

## ✅ Features

| Feature                    | Details                                        |
|----------------------------|------------------------------------------------|
| 🗂️ Menu Display            | Products grouped by category with images       |
| 🛒 Cart                    | Add, update quantity, remove items             |
| 💰 Total Computation       | Live cart total with per-item subtotals        |
| 📱 QR Code Generator       | Per-table QR codes, downloadable & printable   |
| 📋 Place Order             | POST order with customer name, table, notes    |
| 💳 Payment Simulation      | Mock Cash / GCash / Card flow (90% success)    |
| 👨‍💼 Admin Dashboard       | View all orders, update order & payment status |
| 📊 Stats Panel             | Total orders, revenue, pending count           |
| 📡 REST API                | GET products, POST order, GET orders, PATCH    |
| 📱 Mobile Responsive       | Works on all screen sizes                      |

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, React Router v6     |
| Backend     | Node.js, Express 4                  |
| Database    | MySQL 8                             |
| QR Library  | qrcode.react (frontend)             |
| HTTP Client | Axios                               |
| Toasts      | react-hot-toast                     |

---

## ⚙️ Prerequisites

Make sure these are installed on your machine:

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8.0+
- [Git](https://git-scm.com/)
- [VSCode](https://code.visualstudio.com/) (recommended)

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/mini-qr-ordering.git
cd mini-qr-ordering
```

### Step 2 — Set Up the Database

Open MySQL Workbench **or** your terminal:

```bash
mysql -u root -p
```

Then run the SQL file:

```sql
SOURCE /path/to/mini-qr-ordering/database.sql;
```

Or from the terminal:

```bash
mysql -u root -p < database.sql
```

This will:
- Create the `qr_ordering_db` database
- Create `products`, `orders`, and `order_items` tables
- Insert 16 sample menu items and 1 demo order

### Step 3 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Open `.env` in VSCode and fill in your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=qr_ordering_db
FRONTEND_URL=http://localhost:5173
```

### Step 4 — Install Backend Dependencies

```bash
# Still inside /backend
npm install
```

### Step 5 — Start the Backend Server

```bash
npm run dev
```

You should see:
```
✅ MySQL connected successfully
🚀 Server running on http://localhost:5000
```

### Step 6 — Install Frontend Dependencies

Open a **new terminal** window/tab:

```bash
cd frontend
npm install
```

### Step 7 — Start the Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Step 8 — Open in Browser

| Page             | URL                                    |
|------------------|----------------------------------------|
| 🍽️ Menu / Order  | http://localhost:5173/                 |
| 📱 QR Generator  | http://localhost:5173/qr               |
| 👨‍💼 Admin       | http://localhost:5173/admin            |
| 📡 API Health    | http://localhost:5000/                 |

---

## 📡 API Reference

### Products

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | `/api/products`       | Get all available menu items |
| GET    | `/api/products/:id`   | Get single product     |

### Orders

| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | `/api/orders`               | Get all orders (admin)         |
| GET    | `/api/orders/:id`           | Get single order with items    |
| POST   | `/api/orders`               | Place a new order              |
| PATCH  | `/api/orders/:id/status`    | Update order / payment status  |
| POST   | `/api/orders/:id/pay`       | Simulate payment               |

### QR Code

| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| GET    | `/api/qr`        | Get QR as base64 PNG data URL      |
| GET    | `/api/qr/image`  | Get QR as raw PNG image stream     |

#### POST `/api/orders` — Request Body

```json
{
  "customer_name": "Juan Dela Cruz",
  "table_number": "5",
  "notes": "No onions please",
  "items": [
    { "product_id": 4, "quantity": 2 },
    { "product_id": 9, "quantity": 1 }
  ]
}
```

#### PATCH `/api/orders/:id/status` — Request Body

```json
{
  "status": "preparing",
  "payment_status": "paid"
}
```

---

## 🗃️ Database Schema

```sql
products     — id, name, description, price, category, image_url, is_available
orders       — id (UUID), customer_name, table_number, total_amount, notes,
               status, payment_status, payment_method, created_at, updated_at
order_items  — id, order_id, product_id, quantity, unit_price, subtotal
```

---

## 💡 VSCode Tips

Install these extensions for a better dev experience:

- **ESLint** — code linting
- **Prettier** — code formatting
- **MySQL** (by cweijan) — browse your database inside VSCode
- **REST Client** — test API endpoints without Postman
- **GitLens** — enhanced Git features

Open both folders in the same VSCode workspace:

```bash
code .   # run from the root mini-qr-ordering/ folder
```

Use the integrated terminal (`Ctrl+\`` ) split into two panes — one for backend, one for frontend.

---

## 🔀 Git & GitHub Workflow

### Initial Push

```bash
# From the root mini-qr-ordering/ folder
git init
git add .
git commit -m "feat: initial project setup"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mini-qr-ordering.git
git branch -M main
git push -u origin main
```

### Daily Workflow

```bash
git add .
git commit -m "feat: add payment simulation"
git push
```

### Suggested Branch Strategy

```bash
git checkout -b feature/admin-dashboard
# ...make changes...
git add .
git commit -m "feat: admin order management"
git checkout main
git merge feature/admin-dashboard
git push
```

---

## 🧪 Testing the Payment Simulation

The mock payment has a **90% success rate** and **10% failure rate** (random).

1. Add items to cart on the menu page
2. Enter your name and (optionally) table number
3. Click **Place Order**
4. Choose a payment method (Cash / GCash / Card)
5. Click **Pay** — observe success or failure toast
6. Check the Admin dashboard to confirm the order appears

To force a payment status update manually, use the Admin dashboard dropdowns.

---

## 🤔 Common Issues

| Problem | Fix |
|---|---|
| `MySQL connection failed` | Check `.env` credentials; ensure MySQL is running |
| `CORS error` in browser | Ensure `FRONTEND_URL` in `.env` matches your Vite port |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, retry |
| Port 5000 in use | Change `PORT` in `.env` to `5001` etc. |
| QR code blank | Make sure `qrcode.react` is installed (`npm install`) |

---

## 📝 License

MIT — Free to use and modify for personal and commercial projects.
