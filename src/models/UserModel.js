const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String,  },
    password: { type: String, },
    name: { type: String, },
    avatar: { type: String },
    birthday: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String },
    address: { type: String },
    role: {
      type: String,
      enum: ["manager", "sale", "warehouse", "provider", "customer"],
      required: true,
    },
    access_token: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
