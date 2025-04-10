const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const DiscountRouter = require("./routes/DiscountRouter");

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Discount Service is running" });
});

// API routes
app.use("/api", DiscountRouter);

// Connect to MongoDB
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
      // Start server
      app.listen(PORT, () => {
        console.log(`Discount Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.log("Error connecting to MongoDB", err.message);
      console.log("Retrying in 1 second...");
      setTimeout(connectWithRetry, 1000);
    });
};

connectWithRetry();
