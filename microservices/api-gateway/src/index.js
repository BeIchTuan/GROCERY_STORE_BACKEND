const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Service URLs
const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:3001";
const productServiceUrl =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
const paymentServiceUrl =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:3003";
const orderServiceUrl =
  process.env.ORDER_SERVICE_URL || "http://localhost:3004";
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
    "^/api/users": "/api/users",
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
  "/api/users",
  createProxyMiddleware({ target: userServiceUrl, changeOrigin: true })
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
