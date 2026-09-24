// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// --- DB SETUP (SQLite) ---
const db = new sqlite3.Database("./leads.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT,
      details TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      created_at TEXT NOT NULL,
      notes TEXT
    )
  `);
});

// --- SIMPLE AUTH (hardcoded admin) ---
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "changeme";
const ADMIN_TOKEN = "ashley_travis_admin_token";

function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (token === `Bearer ${ADMIN_TOKEN}`) return next();
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

// --- LOGIN ---
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// --- CONTACT FORM (save lead + send email) ---
app.post("/contact", async (req, res) => {
  const { name, email, phone, location, details } = req.body;

  if (!name || !email || !phone || !details) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO leads (name, email, phone, location, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, phone, location || "", details, createdAt],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
    }
  );

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "YOUR_EMAIL@gmail.com",
        pass: "YOUR_APP_PASSWORD"
      }
    });

    const mailOptions = {
      from: `"Website Lead" <YOUR_EMAIL@gmail.com>`,
      to: "YOUR_EMAIL@gmail.com",
      subject: "New Tile Project Request",
      text: `
New Quote Request from Ashley & Travis Tile Co Website

Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location || "Not provided"}

Project Details:
${details}

Submitted: ${new Date().toLocaleString()}
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Form submitted successfully." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Server error. Could not send email." });
  }
});

// --- ADMIN API: GET ALL LEADS ---
app.get("/leads", authMiddleware, (req, res) => {
  db.all(
    `SELECT id, name, email, phone, location, details, status, created_at, notes
     FROM leads ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("DB fetch error:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
      res.json({ success: true, leads: rows });
    }
  );
});

// --- ADMIN API: GET SINGLE LEAD ---
app.get("/leads/:id", authMiddleware, (req, res) => {
  db.get(
    `SELECT id, name, email, phone, location, details, status, created_at, notes
     FROM leads WHERE id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error("DB fetch error:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
      if (!row) return res.status(404).json({ success: false, message: "Lead not found." });
      res.json({ success: true, lead: row });
    }
  );
});

// --- ADMIN API: UPDATE STATUS + NOTES ---
app.patch("/leads/:id", authMiddleware, (req, res) => {
  const { status, notes } = req.body;

  db.run(
    `UPDATE leads SET status = COALESCE(?, status), notes = COALESCE(?, notes)
     WHERE id = ?`,
    [status || null, notes || null, req.params.id],
    function (err) {
      if (err) {
        console.error("DB update error:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: "Lead not found." });
      }
      res.json({ success: true, message: "Lead updated." });
    }
  );
});

// --- SERVE DASHBOARD STATIC FILE ---
app.use("/admin", express.static(path.join(__dirname, "admin")));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
