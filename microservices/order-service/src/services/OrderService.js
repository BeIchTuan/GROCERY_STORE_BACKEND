const Order = require("../models/OrderModel");
const OrderDetail = require("../models/OrderDetailModel");
const Invoice = require("../models/InvoiceModel");
const axios = require("axios");
const { rabbitMQClient, constants } = require("../../../shared");
const { EXCHANGES, ROUTING_KEYS, QUEUES } = constants;

// ... existing code ...
