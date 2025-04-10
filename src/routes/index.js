const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");
const ProductRouter = require("./ProductRouter");
const InvoiceRouter = require("./InvoiceRouter");
const CustomerRouter = require("./CustomerRouter");
const EmployeeRouter = require("./EmployeeRouter");
const ProviderRouter = require("./ProviderRouter");
const PurchaseOrderRouter = require("./PurchaseOrderRouter");
const ReportRouter = require("./ReportRouter");
const DiscountRouter = require("./DiscountRouter");
const PaymentRouter = require("./PaymentRouter");

const routes = (app) => {
  app.use("/api", UserRouter);
  app.use("/api", CategoryRouter);
  app.use("/api", ProductRouter);
  app.use("/api", InvoiceRouter);
  app.use("/api", CustomerRouter);
  app.use("/api", EmployeeRouter);
  app.use("/api", ProviderRouter);
  app.use("/api", PurchaseOrderRouter);
  app.use("/api", ReportRouter);
  app.use("/api", DiscountRouter)
  app.use("/api", PaymentRouter)
};

module.exports = routes;
