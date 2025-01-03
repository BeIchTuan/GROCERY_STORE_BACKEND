const purchaseOrderService = require("../services/PurchaseOrderService");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/uploadImage");

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

  // async createPurchaseOrder(req, res) {
  //   try {
  //     const newPurchaseOrder = await purchaseOrderService.createPurchaseOrder(req.body);
  //     res.status(201).json(newPurchaseOrder);
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // }

  async createPurchaseOrder(req, res) {
    try {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, "products");
        imageUrls.push(result.secure_url);
      }
      const newPurchaseOrder = await purchaseOrderService.createPurchaseOrder({
        ...req.body,
        images: imageUrls,
      });
      res.status(201).json(newPurchaseOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePurchaseOrder(req, res) {
    try {
      const id = req.params.id;
      const updatedPurchaseOrder =
        await purchaseOrderService.updatePurchaseOrder(id, req.body);
      res.status(200).json(updatedPurchaseOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PurchaseOrderController();
