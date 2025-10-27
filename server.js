const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve static images
app.use("/images", express.static(path.join(__dirname, "images")));
console.log("Serving images from:", path.join(__dirname, "images"));

const PORT = process.env.PORT || 5000;

// ✅ Ensure the database folder exists
const dbFolder = path.join(__dirname, "database");
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
  console.log("📁 Created database folder:", dbFolder);
}

// ✅ Connect to SQLite database
const dbPath = path.join(dbFolder, "cafemenu.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ DB Connection Error:", err.message);
  } else {
    console.log("✅ SQLite DB connected at:", dbPath);
  }
});

// ✅ Create table if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS MenuItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    img TEXT
  )`);
});

// ✅ Your menu items
const menu = [
  { name: "Cappuccino", price: 150, img: "/images/cappuccino.jpg" },
  { name: "Latte", price: 200, img: "/images/latte.jpg" },
  { name: "Espresso", price: 100, img: "/images/espresso.jpg" },
  { name: "Mocha", price: 190, img: "/images/mocha.jpg" },
  { name: "Iced Latte", price: 170, img: "/images/icedlatte.jpg" },
  { name: "Cold Coffee", price: 160, img: "/images/coldcoffee.jpg" },
  { name: "Green Tea", price: 90, img: "/images/green-tea.jpg" },
  { name: "Lemon Tea", price: 100, img: "/images/lemon-tea.jpg" },
  { name: "Hot Chocolate", price: 140, img: "/images/hot-chocolate.jpg" },
  { name: "Smoothie", price: 180, img: "/images/smoothie.jpg" },
  { name: "Orange Juice", price: 120, img: "/images/orange-juice.jpg" },
  { name: "Chicken Burger", price: 220, img: "/images/chicken-burger.jpg" },
  { name: "Veg Sandwich", price: 120, img: "/images/veg-sandwich.jpg" },
  { name: "French Fries", price: 100, img: "/images/french-fries.jpg" },
  { name: "Pasta Alfredo", price: 190, img: "/images/pasta-alfredo.jpg" },
  { name: "Veg Wrap", price: 130, img: "/images/veg-wrap.jpg" },
  { name: "Chocolate Muffin", price: 100, img: "/images/chocolate-muffin.jpg" },
  { name: "Brownie", price: 110, img: "/images/brownie.jpg" },
  { name: "Donut", price: 90, img: "/images/donut.jpg" },
  { name: "Cupcake", price: 95, img: "/images/cupcake.jpg" },
  { name: "Cheesecake", price: 160, img: "/images/cheesecake.jpg" },
  { name: "Ice Cream Sundae", price: 150, img: "/images/ice-cream-sundae.jpg" },
  { name: "Pancakes", price: 140, img: "/images/pancakes.jpg" },
  { name: "Waffles", price: 150, img: "/images/waffles.jpg" },
  { name: "Omelette", price: 130, img: "/images/omelette.jpg" },
  { name: "Toast & Butter", price: 80, img: "/images/toast-butter.jpg" },
];

// ✅ Insert menu items once
db.get("SELECT COUNT(*) as count FROM MenuItems", (err, row) => {
  if (err) return console.error(err.message);
  if (row.count === 0) {
    console.log("🆕 Inserting fresh menu items...");
    const stmt = db.prepare("INSERT INTO MenuItems (name, price, img) VALUES (?, ?, ?)");
    menu.forEach((item) =>
      stmt.run(item.name, item.price, item.img, (err) => {
        if (err) console.error(err.message);
        else console.log(`Inserted: ${item.name}`);
      })
    );
    stmt.finalize(() => console.log("✅ Menu items inserted successfully."));
  } else {
    console.log("📦 Menu already exists in DB.");
  }
});

// ✅ Get all menu items
app.get("/api/menu", (req, res) => {
  db.all("SELECT * FROM MenuItems", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Order endpoint
app.post("/api/order", (req, res) => {
  const items = req.body.items;
  if (!items || items.length === 0)
    return res.status(400).json({ error: "No items to order." });

  const orderId = Math.floor(Math.random() * 10000);
  res.json({ orderId, items });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
