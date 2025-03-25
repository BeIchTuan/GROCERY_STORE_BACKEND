const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const purchaseOrderRouter = require("./routes/PurchaseOrderRouter");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", purchaseOrderRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "purchase-order-service",
    timestamp: new Date(),
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Purchase Order service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
