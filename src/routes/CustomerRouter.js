const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/CustomerController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");

router.get(
  "/customers",
  authMiddleware(["manager", "sale"]),
  CustomerController.getCustomers
);
router.post(
  "/customers",
  authMiddleware(["manager", "sale"]),
  CustomerController.createCustomer
);
router.put(
  "/customers/:id",
  authMiddleware(["manager", "sale"]),
  CustomerController.updateCustomer
);
router.get(
  "/customers/:id",
  authMiddleware(["manager", "sale"]),
  CustomerController.getCustomerDetails
);

module.exports = router;
