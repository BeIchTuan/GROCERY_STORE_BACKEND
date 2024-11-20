const UserRouter = require("./UserRouter");
const CategoryRouter = require("./CategoryRouter");

const routes = (app) => {
  app.use("/", UserRouter);
  app.use("/", CategoryRouter);
};

module.exports = routes;
