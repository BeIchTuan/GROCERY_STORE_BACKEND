const purchaseOrderService = require("../services/PurchaseOrderService");

class PurchaseOrderController {
  async createPurchaseOrder(req, res) {
    try {
      const purchaseOrderData = req.body;

      // Xử lý file tải lên nếu có
      if (req.file) {
        purchaseOrderData.receiptImage = `/uploads/${req.file.filename}`;
      }

      const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
        purchaseOrderData,
        req.user
      );

      res.status(201).json({
        status: "success",
        data: purchaseOrder,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getPurchaseOrders(req, res) {
    try {
      const purchaseOrders = await purchaseOrderService.getPurchaseOrders(
        req.query
      );

      res.status(200).json({
        status: "success",
        data: purchaseOrders,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getPurchaseOrderDetails(req, res) {
    try {
      const { id } = req.params;
      const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(id);

      res.status(200).json({
        status: "success",
        data: purchaseOrder,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async updatePurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const purchaseOrderData = req.body;

      // Xử lý file tải lên nếu có
      if (req.files && req.files.length > 0) {
        purchaseOrderData.attachments = req.files.map(
          (file) => `/uploads/${file.filename}`
        );
      }

      const updatedPurchaseOrder =
        await purchaseOrderService.updatePurchaseOrder(
          id,
          purchaseOrderData,
          req.user
        );

      res.status(200).json({
        status: "success",
        data: updatedPurchaseOrder,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async updatePurchaseOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const purchaseOrder =
        await purchaseOrderService.updatePurchaseOrderStatus(id, status);

      res.status(200).json({
        status: "success",
        data: purchaseOrder,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async importPurchaseOrder(req, res) {
    try {
      // Kiểm tra xem có file không
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "Vui lòng tải lên file Excel",
        });
      }

      const result = await purchaseOrderService.importFromExcel(
        req.file.path,
        req.user
      );

      res.status(200).json({
        status: "success",
        message: "Nhập dữ liệu thành công",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

module.exports = new PurchaseOrderController();
