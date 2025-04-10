const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5177",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type"],
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Service URLs - Fixed port mappings to match Kubernetes configuration
const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:3001";
const productServiceUrl =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
const paymentServiceUrl =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:3004"; // Fixed port to match configmap
const orderServiceUrl =
  process.env.ORDER_SERVICE_URL || "http://localhost:3003"; // Fixed port to match configmap
const discountServiceUrl =
  process.env.DISCOUNT_SERVICE_URL || "http://localhost:3005";
const reportServiceUrl =
  process.env.REPORT_SERVICE_URL || "http://localhost:3006";
const providerServiceUrl =
  process.env.PROVIDER_SERVICE_URL || "http://localhost:3007";
const customerServiceUrl =
  process.env.CUSTOMER_SERVICE_URL || "http://localhost:3008";
const employeeServiceUrl =
  process.env.EMPLOYEE_SERVICE_URL || "http://localhost:3009";
const purchaseOrderServiceUrl =
  process.env.PURCHASE_ORDER_SERVICE_URL || "http://localhost:3010";

// Proxy options
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: {
    "^/api/auth": "/api/auth",
    "^/api/user": "/api/user",
    "^/api/products": "/api/products",
    "^/api/categories": "/api/categories",
    "^/api/payments": "/api/payments",
    "^/api/invoices": "/api/invoices",
    "^/api/discounts": "/api/discounts",
    "^/api/reports": "/api/reports",
    "^/api/providers": "/api/providers",
    "^/api/customers": "/api/customers",
    "^/api/employees": "/api/employees",
    "^/api/purchase-orders": "/api/purchase-orders",
  },
};

// Routes
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Service unavailable', details: err.message });
    }
  })
);
app.use(
  "/api/user",
  createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Service unavailable', details: err.message });
    }
  })
);
app.use(
  "/api/products",
  createProxyMiddleware({ target: productServiceUrl, changeOrigin: true })
);
app.use(
  "/api/categories",
  createProxyMiddleware({ target: productServiceUrl, changeOrigin: true })
);
app.use(
  "/api/payments",
  createProxyMiddleware({ target: paymentServiceUrl, changeOrigin: true })
);
app.use(
  "/api/invoices",
  createProxyMiddleware({ target: orderServiceUrl, changeOrigin: true })
);
app.use(
  "/api/discounts",
  createProxyMiddleware({ target: discountServiceUrl, changeOrigin: true })
);
app.use(
  "/api/reports",
  createProxyMiddleware({ target: reportServiceUrl, changeOrigin: true })
);
app.use(
  "/api/providers",
  createProxyMiddleware({ target: providerServiceUrl, changeOrigin: true })
);
app.use(
  "/api/customers",
  createProxyMiddleware({ target: customerServiceUrl, changeOrigin: true })
);
app.use(
  "/api/employees",
  createProxyMiddleware({ target: employeeServiceUrl, changeOrigin: true })
);
app.use(
  "/api/purchase-orders",
  createProxyMiddleware({ target: purchaseOrderServiceUrl, changeOrigin: true })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API Gateway is running" });
});

// Debug endpoint to check service connections
app.get("/debug/services", (req, res) => {
  res.status(200).json({
    services: {
      userService: userServiceUrl,
      productService: productServiceUrl,
      paymentService: paymentServiceUrl,
      orderService: orderServiceUrl,
      discountService: discountServiceUrl,
      reportService: reportServiceUrl,
      providerService: providerServiceUrl,
      customerService: customerServiceUrl,
      employeeService: employeeServiceUrl,
      purchaseOrderService: purchaseOrderServiceUrl
    },
    env: process.env.NODE_ENV
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
