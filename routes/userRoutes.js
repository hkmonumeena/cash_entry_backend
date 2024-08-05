// routes/userRoutes.js

const express = require('express');
const router = express.Router();
//const { userController } = require('../controllers/userController');
const userController = require('../controllers/userController');

// Route for creating an item
router.post('/createUser', userController.createUser);

// Define the route for updating a user
router.post('/users/update/:authId', userController.updateUser);

// Define the route for deleting a user and their transactions
router.post('/users/:authId', userController.deleteUserAndTransactions);

module.exports = router;
