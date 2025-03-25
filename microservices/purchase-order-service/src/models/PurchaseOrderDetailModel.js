const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseOrderDetailSchema = new Schema(
  {
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const PurchaseOrderDetail = mongoose.model(
  "PurchaseOrderDetail",
  purchaseOrderDetailSchema
);

module.exports = PurchaseOrderDetail;
