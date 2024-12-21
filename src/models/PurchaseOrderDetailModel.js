const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseOrderDetailSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    expireDate: { type: Date },
    importPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1},
});

const purchaseOrderDetail = mongoose.model("PurchaseOrderDetail", purchaseOrderDetailSchema);

module.exports = purchaseOrderDetail;
