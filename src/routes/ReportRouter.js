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
router.get(
  "/reports/stock-by-category",
  //authMiddleware(["manager"]),
  reportController.getStockByCategory
);
router.get(
  "/reports/expiring-products",
  //authMiddleware(["manager"]),
  reportController.getExpiringProducts
);
router.get(
  "/reports/imports-by-provider",
  //authMiddleware(["manager"]),
  reportController.getImportsByProvider
);
router.get(
  "/reports/top-selling-products",
  //authMiddleware(["manager"]),
  reportController.getTopSellingProducts
);

module.exports = router;
