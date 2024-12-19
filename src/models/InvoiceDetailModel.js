const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceDetailSchema = new Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true
    },
    quantity: { 
        type: Number, 
        required: true,
        min: 1 
    }
});

const InvoiceDetail = mongoose.model("InvoiceDetail", invoiceDetailSchema);

module.exports = InvoiceDetail;
