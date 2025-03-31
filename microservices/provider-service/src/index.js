const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ProviderRouter = require("./routes/ProviderRouter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
const corsOptions = {
  origin: true, // Cho phép tất cả các origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["*"],
  exposedHeaders: ["*"],
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api", ProviderRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Provider Service is running" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Provider Service running on port ${PORT}`);
});
