const express = require('express')
const router = express.Router()
const CustomerController = require('../controllers/CustomerController')
const { authMiddleware } = require('../middlewares/AuthMiddleware');

router.get("/customers", authMiddleware(['manager', 'sale_agent']), CustomerController.getCustomers);
router.post("/customers", authMiddleware(['manager', 'sale_agent']), CustomerController.createCustomer);
router.put("/customers/:id", authMiddleware(['manager', 'sale_agent']), CustomerController.updateCustomer);
router.get("/customers/:id", authMiddleware(['manager', 'sale_agent']), CustomerController.getCustomerDetails);

module.exports = router
