const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discountSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    discountInPercent: { type: Number, default: 0 },
    minOrderValue: { type: Number },
    maxDiscountValue: { type: Number },
    usageLimit: { type: Number },
    used: { type: Number },
    expireDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
