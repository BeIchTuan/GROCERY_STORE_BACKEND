const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const InvoiceRouter = require("./routes/InvoiceRouter");

// Load environment variables
dotenv.config();

// Logging middleware
app.use(morgan("combined"));

// Body parser
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Order Service is running" });
});

// API routes
app.use("/api", InvoiceRouter);

// Connect to MongoDB and start server
const port = process.env.PORT || 3000;
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Order Service: Connected to MongoDB");
      app.listen(port, () => {
        console.log(`Order Service running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("Order Service: MongoDB connection error:", err);
      console.log("Retrying MongoDB connection in 1 second...");
      setTimeout(connectWithRetry, 1000);
    });
};

connectWithRetry();
