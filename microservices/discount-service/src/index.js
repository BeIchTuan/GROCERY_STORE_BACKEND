const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const DiscountRouter = require("./routes/DiscountRouter");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
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
    console.log("Error connecting to MongoDB", err.message);
  });

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Discount Service is running" });
});

// API routes
app.use("/api", DiscountRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Discount Service running on port ${PORT}`);
});
