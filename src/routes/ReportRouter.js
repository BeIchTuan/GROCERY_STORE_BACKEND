const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const reportController = require("../controllers/ReportController");

router.get(
  "/reports/revenue",
  //authMiddleware(["manager"]),
  reportController.getRevenue
);
router.get(
  "/reports/profit",
  //authMiddleware(["manager"]),
  reportController.getProfit
);
router.get(
  "/reports/sales",
  //authMiddleware(["manager"]),
  reportController.getSales
);

module.exports = router;
