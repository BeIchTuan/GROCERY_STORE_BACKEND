const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");
const ProductRouter = require("./ProductRouter");
const InvoiceRouter = require("./InvoiceRouter");
const CustomerRouter = require("./CustomerRouter");

const routes = (app) => {
  app.use("/", UserRouter);
  app.use("/", CategoryRouter);
  app.use("/", ProductRouter);
  app.use("/", InvoiceRouter);
  app.use("/", CustomerRouter);
};

module.exports = routes;
