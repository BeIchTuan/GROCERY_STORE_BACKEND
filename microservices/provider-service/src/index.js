const express = require("express");
const mongoose = require("mongoose");
const ProviderRouter = require("./routes/ProviderRouter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(express.json());

// Routes
app.use("/api", ProviderRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Provider Service is running" });
});

// Connect to MongoDB with retry logic
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Provider Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.log("Retrying connection in 1 second...");
      setTimeout(connectWithRetry, 1000);
    });
};

connectWithRetry();
