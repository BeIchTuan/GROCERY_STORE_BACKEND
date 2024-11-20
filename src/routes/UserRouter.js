const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const { authMiddleware } = require('../middlewares/AuthMiddleware');

//Register and login
router.post('/auth/register', authMiddleware(['manager']), UserController.createUser)
router.post('/auth/login', UserController.loginUser)

//Get personal details infor and get all users infor
router.get('/user/infor', authMiddleware(['manager', 'sale', 'warehouse']), UserController.getAccountInfor)
router.get('/users', authMiddleware(['manager']), UserController.getAllUsers)

//Update and delete user
router.put('/user/:id', authMiddleware(['manager']), UserController.updateUser)
router.delete('/user/:id', authMiddleware(['manager']), UserController.deleteUser)

module.exports = router