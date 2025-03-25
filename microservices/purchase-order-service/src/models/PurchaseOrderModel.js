const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseOrderSchema = new Schema(
  {
    providerId: { type: String, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    note: { type: String },
    receiptImage: { type: String },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = PurchaseOrder;
