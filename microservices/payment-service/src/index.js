const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const PaymentRouter = require("./routes/PaymentRouter");

// Load environment variables
dotenv.config();

// Logging middleware
app.use(morgan("combined"));

// CORS configuration
const allowedOrigins = ["http://localhost:5177"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  })
);

// Body parser
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Payment Service is running" });
});

// API routes
app.use("/api", PaymentRouter);

// Connect to MongoDB and start server
const port = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Payment Service: Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Payment Service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Payment Service: MongoDB connection error:", err);
  });
