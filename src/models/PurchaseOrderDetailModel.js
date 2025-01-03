const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseOrderDetailSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', },
    expireDate: { type: Date },
    importPrice: { type: Number, },
    quantity: { type: Number,},
});

const purchaseOrderDetail = mongoose.model("PurchaseOrderDetail", purchaseOrderDetailSchema);

module.exports = purchaseOrderDetail;
