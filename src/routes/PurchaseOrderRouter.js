const express = require("express");
const router = express.Router();
const PurchaseOrderController = require("../controllers/PurchaseOrderController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const {upload} = require("../middlewares/uploadImage");

// router.get("/purchase-orders", authMiddleware(['manager', 'warehouse']), PurchaseOrderController.getPurchaseOrders);
router.get("/purchase-orders", PurchaseOrderController.getPurchaseOrders);
// router.post("/purchase-orders", authMiddleware(['warehouse']), upload.array("files", 10), PurchaseOrderController.createPurchaseOrder);
router.post(
  "/purchase-orders",
  upload,
  PurchaseOrderController.createPurchaseOrder
);
// router.put("/purchase-orders/:id", authMiddleware(['warehouse']), PurchaseOrderController.createPurchaseOrder);
router.put("/purchase-orders/:id", PurchaseOrderController.updatePurchaseOrder);

module.exports = router;
