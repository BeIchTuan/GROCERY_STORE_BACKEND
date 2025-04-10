const express = require("express");
const mongoose = require("mongoose");
const purchaseOrderRouter = require("./routes/PurchaseOrderRouter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(express.json());

// Routes
app.use("/api", purchaseOrderRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Purchase Order Service is running" });
});

// Connect to MongoDB with retry logic
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Purchase Order Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.log("Retrying connection in 1 second...");
      setTimeout(connectWithRetry, 1000);
    });
};

connectWithRetry();
