const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  type: {
    type: String,
    enum: [
      "revenue",
      "profit",
      "sales",
      "stock",
      "expiring",
      "imports",
      "top-selling",
    ],
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
