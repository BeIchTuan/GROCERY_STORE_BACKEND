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

  // Delete a purchaseOrderDetail by ID
  async deletePurchaseOrderDetail(id) {
    try {
      const purchaseOrderDetail = await PurchaseOrderDetail.findByIdAndDelete(id);
      if (!purchaseOrderDetail) {
        throw new Error("PurchaseOrderDetail not found");
      }
      return {
        status: "success",
        message: "PurchaseOrderDetail deleted successfully",
      };
    } catch (error) {
      throw new Error("Failed to delete purchaseOrderDetail: " + error.message);
    }
  }
}

module.exports = new PurchaseOrderDetailService();
