const PurchaseOrderDetail = require("../models/PurchaseOrderDetailModel");

class PurchaseOrderDetailService {
  // Create a new purchaseOrderDetail
  async createPurchaseOrderDetail(data) {
    try {
      const purchaseOrderDetail = await PurchaseOrderDetail.create(data);
      return {
        status: "success",
        message: "PurchaseOrderDetail created successfully",
        data: purchaseOrderDetail,
      };
    } catch (error) {
      throw new Error("Failed to create purchaseOrderDetail: " + error.message);
    }
  }

  async updatePurchaseOrderDetail(id, data) {
    try {
      const purchaseOrderDetail = await PurchaseOrderDetail.findById(id);
      if (!purchaseOrderDetail) {
        throw new Error("PurchaseOrderDetail not found");
      }

      // Update fields
      Object.assign(purchaseOrderDetail, data);
      const updatedPurchaseOrderDetail = await purchaseOrderDetail.save();

      return {
        status: "success",
        message: "PurchaseOrderDetail updated successfully",
        data: updatedPurchaseOrderDetail,
      };
    } catch (error) {
      throw new Error("Failed to update product: " + error.message);
    }
  }

  async getPurchaseOrderDetailById(id) {
    try {
      const purchaseOrderDetail = await PurchaseOrderDetail.findById(id)
        .populate('product');

      return purchaseOrderDetail;
    } catch (error) {
      throw new Error("Failed to get purchaseOrderDetail: " + error.message);
    }
  }
}

module.exports = new PurchaseOrderDetailService();
