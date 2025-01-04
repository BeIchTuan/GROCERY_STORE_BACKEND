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

const routes = (app) => {
  app.use("/", UserRouter);
  app.use("/", CategoryRouter);
  app.use("/", ProductRouter);
  app.use("/", InvoiceRouter);
  app.use("/", CustomerRouter);
  app.use("/", EmployeeRouter);
  app.use("/", ProviderRouter);
  app.use("/", PurchaseOrderRouter);
  app.use("/", ReportRouter);
  app.use("/", DiscountRouter)
};

module.exports = routes;
