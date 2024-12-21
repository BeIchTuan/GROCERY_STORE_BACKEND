const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const providerSchema = new Schema({
    name: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    address: { type: String },
});

const provider = mongoose.model("Provider", providerSchema);

module.exports = provider;
