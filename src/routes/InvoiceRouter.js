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

// Route xuất PDF
router.get('/invoices/:id/export', 
    authMiddleware(['manager', 'sale']), 
    InvoiceController.exportInvoicePDF
);

router.post('/invoices/momo', 
    //authMiddleware(['manager', 'sale']), 
    InvoiceController.payWithMomo
);

module.exports = router;
