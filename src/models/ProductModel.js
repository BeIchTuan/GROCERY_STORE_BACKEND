const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  sellingPrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories', required: true },
  images: [{ type: String }]
}, 
{
  timestamps: true
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;