const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceDetailSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    invoiceDetails: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'InvoiceDetail' 
    }]
});

const InvoiceDetail = mongoose.model("InvoiceDetail", invoiceDetailSchema);

module.exports = InvoiceDetail;
