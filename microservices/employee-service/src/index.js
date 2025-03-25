const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const employeeRouter = require("./routes/EmployeeRouter");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", employeeRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "employee-service",
    timestamp: new Date(),
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Employee service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
