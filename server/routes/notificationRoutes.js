// server/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getUserNotifications); // Adjusted route
router.post('/', notificationController.createNotification);
router.post(
  '/:notificationId/mark-as-read',
  notificationController.markNotificationAsRead
);

module.exports = router;
