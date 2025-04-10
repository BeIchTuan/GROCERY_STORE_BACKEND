const express = require("express");
const mongoose = require("mongoose");
const EmployeeRouter = require("./routes/EmployeeRouter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(express.json());

// Routes
app.use("/api", EmployeeRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Employee Service is running" });
});

// Connect to MongoDB
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Employee Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.log("Retrying connection in 1 second...");
      setTimeout(connectWithRetry, 1000);
    });
};

connectWithRetry();
