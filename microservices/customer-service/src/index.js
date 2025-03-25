const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const customerRouter = require("./routes/CustomerRouter");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", customerRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "customer-service",
    timestamp: new Date(),
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Customer service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
