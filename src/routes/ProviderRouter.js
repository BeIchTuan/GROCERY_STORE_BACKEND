const express = require('express')
const router = express.Router()
const ProviderController = require('../controllers/ProviderController')
const { authMiddleware } = require('../middlewares/AuthMiddleware');

router.get("/providers", ProviderController.getProviders);
// router.post("/providers", authMiddleware(['manager']), ProviderController.createProvider);
router.post("/providers", ProviderController.createProvider);
// router.put("/providers/:id", authMiddleware(['manager']), ProviderController.updateProvider);
router.put("/providers/:id", ProviderController.updateProvider);
// router.delete("/providers/:id", authMiddleware(['manager']), ProviderController.deleteProvider);
router.delete("/providers/:id", ProviderController.deleteProvider);
router.get("/providers/:id", ProviderController.getProviderDetails);


module.exports = router
