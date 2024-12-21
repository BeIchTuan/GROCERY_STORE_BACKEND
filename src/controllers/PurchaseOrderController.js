const purchaseOrderService = require("../services/PurchaseOrderService");

class PurchaseOrderController {
  async getPurchaseOrders(req, res) {
    try {
      const purchaseOrders = await purchaseOrderService.getPurchaseOrders();
      res.status(200).json(purchaseOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createPurchaseOrder(req, res) {
    try {
      const newPurchaseOrder = await purchaseOrderService.createPurchaseOrder(req.body);
      res.status(201).json(newPurchaseOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePurchaseOrder(req, res) {
    try {
      const id = req.params.id;
      const purchaseOrderData = {
        email: req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
      };
      const updatedPurchaseOrder = await purchaseOrderService.updatePurchaseOrder(id, purchaseOrderData);
      res.status(200).json(updatedPurchaseOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPurchaseOrderDetails(req, res) {
    try {
      const id  = req.params.id;
      const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(id);
      res.status(200).json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PurchaseOrderController();

