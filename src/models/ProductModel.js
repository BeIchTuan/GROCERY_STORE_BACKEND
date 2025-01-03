const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String},
  sellingPrice: { type: Number},
  stockQuantity: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories'},
  images: [{ type: String }],
  importDate: { type: Date, default: Date.now },
  expireDate: { type: Date },
}, 
{
  timestamps: true
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;