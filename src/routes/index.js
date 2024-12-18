const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");
const ProductRouter = require("./ProductRouter");

const routes = (app) => {
  app.use("/", UserRouter);
  app.use("/", CategoryRouter);
  app.use("/", ProductRouter);
};

module.exports = routes;
