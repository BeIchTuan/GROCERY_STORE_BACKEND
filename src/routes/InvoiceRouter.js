const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/InvoiceController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Lấy danh sách hóa đơn
router.get('/invoices', 
    authMiddleware(['manager', 'sale']), 
    InvoiceController.getInvoices
);

// Tạo hóa đơn mới
router.post('/invoices', 
    authMiddleware(['manager', 'sale']), 
    InvoiceController.createInvoice
);

module.exports = router;
