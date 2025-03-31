/**
 * Các hằng số liên quan đến RabbitMQ exchanges
 */
const EXCHANGES = {
  INVENTORY: "inventory.exchange",
  ORDERS: "orders.exchange",
  INVOICES: "invoices.exchange",
  PRODUCTS: "products.exchange",
  USERS: "users.exchange",
  NOTIFICATIONS: "notifications.exchange",
  REPORTS: "reports.exchange",
  DISCOUNT: "discount.exchange",
  PURCHASE_ORDER: "purchase-order.exchange",
};

/**
 * Các hằng số liên quan đến RabbitMQ queues
 */
const QUEUES = {
  // Inventory queues
  INVENTORY_UPDATES: "inventory.updates",

  // Product queues
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",

  // Order queues
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_COMPLETED: "order.completed",

  // Invoice queues
  INVOICE_CREATED: "invoice.created",
  INVOICE_UPDATED: "invoice.updated",
  INVOICE_PAID: "invoice.paid",

  // Report queues
  REPORT_GENERATION: "report.generation",

  // User queues
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",

  // Notification queues
  EMAIL_NOTIFICATION: "notification.email",
  SMS_NOTIFICATION: "notification.sms",

  // Discount queues
  DISCOUNT_CREATED: "discount.created",
  DISCOUNT_UPDATED: "discount.updated",
  DISCOUNT_DELETED: "discount.deleted",
  DISCOUNT_APPLIED: "discount.applied",

  // Purchase Order queues
  PURCHASE_ORDER_CREATED: "purchase-order.created",
  PURCHASE_ORDER_UPDATED: "purchase-order.updated",
  PURCHASE_ORDER_COMPLETED: "purchase-order.completed",
  PURCHASE_ORDER_ITEM_RECEIVED: "purchase-order.item.received",
};

/**
 * Các hằng số liên quan đến routing keys
 */
const ROUTING_KEYS = {
  // Inventory routing keys
  INVENTORY_STOCK_UPDATED: "inventory.stock.updated",
  INVENTORY_STOCK_LOW: "inventory.stock.low",

  // Product routing keys
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",

  // Order routing keys
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_COMPLETED: "order.completed",

  // Invoice routing keys
  INVOICE_CREATED: "invoice.created",
  INVOICE_UPDATED: "invoice.updated",
  INVOICE_PAID: "invoice.paid",

  // Report routing keys
  REPORT_SALES: "report.sales",
  REPORT_INVENTORY: "report.inventory",
  REPORT_REVENUE: "report.revenue",

  // User routing keys
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",

  // Notification routing keys
  NOTIFICATION_EMAIL: "notification.email",
  NOTIFICATION_SMS: "notification.sms",

  // Discount routing keys
  DISCOUNT_CREATED: "discount.created",
  DISCOUNT_UPDATED: "discount.updated",
  DISCOUNT_DELETED: "discount.deleted",
  DISCOUNT_APPLIED: "discount.applied",

  // Purchase Order routing keys
  PURCHASE_ORDER_CREATED: "purchase-order.created",
  PURCHASE_ORDER_UPDATED: "purchase-order.updated",
  PURCHASE_ORDER_COMPLETED: "purchase-order.completed",
  PURCHASE_ORDER_ITEM_RECEIVED: "purchase-order.item.received",
};

/**
 * Các hằng số liên quan đến tên service
 */
const SERVICES = {
  USER: "user-service",
  PRODUCT: "product-service",
  ORDER: "order-service",
  PAYMENT: "payment-service",
  DISCOUNT: "discount-service",
  REPORT: "report-service",
  PROVIDER: "provider-service",
  CUSTOMER: "customer-service",
  EMPLOYEE: "employee-service",
  PURCHASE_ORDER: "purchase-order-service",
};

module.exports = {
  EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
  SERVICES,
};
