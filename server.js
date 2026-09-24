// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// -----------------------------
// POST /contact — form handler
// -----------------------------
app.post("/contact", async (req, res) => {
  const { name, email, phone, location, details } = req.body;

  // Basic validation
  if (!name || !email || !phone || !details) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields."
    });
  }

  try {
    // Configure email transport (Gmail example)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "YOUR_EMAIL@gmail.com",
        pass: "YOUR_APP_PASSWORD"
      }
    });

    // Email content
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

    res.json({
      success: true,
      message: "Form submitted successfully."
    });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not send email."
    });
  }
});

// -----------------------------
// Start server
// -----------------------------
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
