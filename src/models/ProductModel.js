const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: [
    { type: Schema.Types.ObjectId, ref: "Categories", required: true },
  ],
  inStock: { type: Number, required: true },
  salePercent: { type: Number, dafault: 0},
  priceAfterSale: { type: Number},
  image: [{ type: String, required: true }],
  sold: { type: Number, default: 0 },
});

// Add a virtual for `thumbnail` that returns the first image in the `image` array
productSchema.virtual("thumbnail").get(function () {
  return Array.isArray(this.image) && this.image.length > 0
    ? this.image[0]
    : null;
});

// Set priceAfterSale to the same as price if it is not set explicitly
productSchema.pre("save", function (next) {
  if (this.priceAfterSale === undefined) {
    this.priceAfterSale = this.price;
  }
  next();
});

// Ensure virtuals are included in JSON responses
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
