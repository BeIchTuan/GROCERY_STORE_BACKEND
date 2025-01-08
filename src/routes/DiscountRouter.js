const express = require('express');
const router = express.Router();
const discountController = require('../controllers/DiscountController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/discounts', discountController.createDiscount);
router.get('/discounts/all', discountController.getAllDiscounts);
router.get('/discounts/search', discountController.searchDiscounts);
router.get('/discounts/:id', discountController.getDiscountById);
router.put('/discounts/:discountId',  discountController.updateDiscount);
router.delete('/discounts/:discountId', discountController.deleteDiscount);


module.exports = router;
