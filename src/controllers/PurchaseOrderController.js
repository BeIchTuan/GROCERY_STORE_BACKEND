const purchaseOrderService = require("../services/PurchaseOrderService");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/uploadImage");
const { parsePurchaseDetails } = require("../middlewares/AuthMiddleware");

class PurchaseOrderController {
  async getPurchaseOrders(req, res) {
    try {
      const { provider, startDate, endDate } = req.query;
      const purchaseOrders = await purchaseOrderService.getPurchaseOrders(
        provider,
        startDate,
        endDate
      );
      res.status(200).json(purchaseOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createPurchaseOrder(req, res) {
    try {
      const result = await purchaseOrderService.createPurchaseOrder(
        req.body,
        req.files
      );

      if (result.success) {
        res.status(201).json({
          message: "Purchase order created successfully",
          purchaseOrder: result.purchaseOrder,
        });
      } else {
        res.status(400).json({ message: "Failed to create purchase order" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePurchaseOrder(req, res) {
    try {
      const id = req.params.id;
      console.log("data: ", req.files)
      const updatedPurchaseOrder =
        await purchaseOrderService.updatePurchaseOrder(id, req.body, req.files);

      res.status(200).json(updatedPurchaseOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // async updatePurchaseOrder(req, res) {
  //   try {
  //     const { id } = req.query;
  //     const data = req.body;

  //     // Xử lý form-data từ Multer
  //     const purchaseDetail = JSON.parse(data.purchaseDetail);
  //     if (req.files) {
  //       purchaseDetail.forEach((detail, index) => {
  //         detail.files = req.files.filter((file) => file.fieldname === `purchaseDetail[${index}][files]`);
  //       });
  //     }
  //     data.purchaseDetail = purchaseDetail;

  //     // Gọi service để cập nhật
  //     const updatedPurchaseOrder = await purchaseOrderService.updatePurchaseOrder(id, data);

  //     res.status(200).json({
  //       message: "Purchase order updated successfully",
  //       data: updatedPurchaseOrder,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: error.message });
  //   }
  // }
}

module.exports = new PurchaseOrderController();
