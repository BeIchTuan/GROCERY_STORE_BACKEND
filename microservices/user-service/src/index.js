const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const UserRouter = require("./routes/UserRouter");

// Load environment variables
dotenv.config();

// Logging middleware
app.use(morgan("combined"));

// Cookie parser
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["*"],
  exposedHeaders: ["*"],
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));

// Body parser
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "User Service is running" });
});

// API routes
app.use("/api", UserRouter);

// Connect to MongoDB and start server
const port = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("User Service: Connected to MongoDB");
    app.listen(port, () => {
      console.log(`User Service running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("User Service: MongoDB connection error:", err);
  });
