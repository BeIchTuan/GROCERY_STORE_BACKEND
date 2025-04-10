const express = require("express");
const mongoose = require("mongoose");
const ReportRouter = require("./routes/ReportRouter");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/reports", ReportRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Connect to MongoDB
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      const PORT = process.env.PORT || 3006;
      app.listen(PORT, () => {
        console.log(`Report Service is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      console.log("Retrying connection in 1 second...");
      setTimeout(connectWithRetry, 1000);
    });
};

connectWithRetry();
