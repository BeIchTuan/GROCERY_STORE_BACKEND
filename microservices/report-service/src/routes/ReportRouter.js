const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/ReportController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// Tất cả các route đều yêu cầu xác thực và quyền admin
router.use(verifyToken);
router.use(verifyAdmin);

// Báo cáo doanh thu
router.get("/revenue", ReportController.getRevenue);

// Báo cáo lợi nhuận
router.get("/profit", ReportController.getProfit);

// Báo cáo bán hàng
router.get("/sales", ReportController.getSales);

// Báo cáo tồn kho theo danh mục
router.get("/stock-by-category", ReportController.getStockByCategory);

// Báo cáo sản phẩm sắp hết hạn
router.get("/expiring-products", ReportController.getExpiringProducts);

// Báo cáo nhập hàng theo nhà cung cấp
router.get("/imports-by-provider", ReportController.getImportsByProvider);

// Báo cáo sản phẩm bán chạy
router.get("/top-selling-products", ReportController.getTopSellingProducts);

module.exports = router;
