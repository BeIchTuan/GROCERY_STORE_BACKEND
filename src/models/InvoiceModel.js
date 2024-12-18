const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    invoiceDetails: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'InvoiceDetail' 
    }]
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
