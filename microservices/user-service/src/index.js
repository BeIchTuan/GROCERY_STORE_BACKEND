const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const UserRouter = require("./routes/UserRouter");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(morgan("dev"));

// Routes
app.use("/api", UserRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "user-service",
    timestamp: new Date(),
  });
});

// Connect to MongoDB
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`User service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.log("Retrying in 1 second...");
      setTimeout(connectWithRetry, 1000);
    });
};

connectWithRetry();
