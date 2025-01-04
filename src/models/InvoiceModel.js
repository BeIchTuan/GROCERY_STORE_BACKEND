const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
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
    }],
    discount: {type: mongoose.Schema.Types.ObjectId, 
        ref: 'Discount',
    }
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
