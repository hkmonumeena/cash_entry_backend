// routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Route for sending a single push notification
router.post('/send-notification', notificationController.sendPushNotification);

// Route for sending bulk push notifications
router.post('/send-bulk-notification', notificationController.sendBulkPushNotification);

// Diagnostic route to check Firebase status
router.get('/firebase-status', notificationController.checkFirebaseStatus);

module.exports = router;

