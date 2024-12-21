const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseOrderSchema = new Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', default: null },
    orderDate: { type: Date, default: Date.now },
    totalPrice: { type: Number },
    purchaseDetail: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrderDetail' }]
});

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = PurchaseOrder;