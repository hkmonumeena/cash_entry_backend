// controllers/notificationController.js

const { sendNotification, sendBackgroundNotification, sendVisibleNotification } = require('../utils/firebaseService');
const sendResponse = require('../utils/responseUtil');

/**
 * Send push notification
 * Supports both background (data only) and visible (with title) notifications
 * 
 * Request body:
 * - deviceToken: string (required) - FCM device token
 * - type: string (required) - 'background' or 'visible'
 * - data: object (required for background, optional for visible) - Data payload
 * - title: string (required for visible) - Notification title
 * - body: string (optional for visible) - Notification body
 */
exports.sendPushNotification = async (req, res) => {
  try {
    const { deviceToken, type, data, title, body, notification } = req.body;

    // Validate required fields
    if (!deviceToken) {
      return sendResponse(res, 400, 'Device token is required');
    }

    if (!type || !['background', 'visible'].includes(type)) {
      return sendResponse(res, 400, 'Type is required and must be either "background" or "visible"');
    }

    // Validate based on type
    if (type === 'background') {
      if (!data || typeof data !== 'object') {
        return sendResponse(res, 400, 'Data payload is required for background notifications');
      }

      const result = await sendBackgroundNotification(deviceToken, data);
      return sendResponse(res, 200, 'Background notification sent successfully', result);
    } 
    else if (type === 'visible') {
      // Support both 'title' and 'notification.title' formats
      const notificationTitle = title || notification?.title;
      
      if (!notificationTitle) {
        return sendResponse(res, 400, 'Title is required for visible notifications');
      }

      const notificationBody = body || notification?.body || '';
      const notificationData = data || {};

      const result = await sendVisibleNotification(
        deviceToken,
        notificationTitle,
        notificationBody,
        notificationData
      );
      return sendResponse(res, 200, 'Visible notification sent successfully', result);
    }
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      return sendResponse(res, 400, 'Invalid or unregistered device token', { error: error.message });
    }
    
    if (error.code === 'messaging/invalid-argument') {
      return sendResponse(res, 400, 'Invalid notification payload', { error: error.message });
    }

    return sendResponse(res, 500, 'Failed to send notification', { error: error.message });
  }
};

/**
 * Send notification to multiple devices
 * 
 * Request body:
 * - deviceTokens: array (required) - Array of FCM device tokens
 * - type: string (required) - 'background' or 'visible'
 * - data: object (required for background, optional for visible) - Data payload
 * - title: string (required for visible) - Notification title
 * - body: string (optional for visible) - Notification body
 */
exports.sendBulkPushNotification = async (req, res) => {
  try {
    const { deviceTokens, type, data, title, body, notification } = req.body;

    // Validate required fields
    if (!deviceTokens || !Array.isArray(deviceTokens) || deviceTokens.length === 0) {
      return sendResponse(res, 400, 'Device tokens array is required and must not be empty');
    }

    if (!type || !['background', 'visible'].includes(type)) {
      return sendResponse(res, 400, 'Type is required and must be either "background" or "visible"');
    }

    // Prepare payload
    let payload;
    if (type === 'background') {
      if (!data || typeof data !== 'object') {
        return sendResponse(res, 400, 'Data payload is required for background notifications');
      }
      payload = { data };
    } else {
      const notificationTitle = title || notification?.title;
      if (!notificationTitle) {
        return sendResponse(res, 400, 'Title is required for visible notifications');
      }
      payload = {
        title: notificationTitle,
        body: body || notification?.body || '',
        data: data || {}
      };
    }

    // Send notifications to all devices
    const results = await Promise.allSettled(
      deviceTokens.map(token => sendNotification(token, type, payload))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return sendResponse(res, 200, 'Bulk notification sent', {
      total: deviceTokens.length,
      successful,
      failed,
      results: results.map((r, index) => ({
        deviceToken: deviceTokens[index],
        status: r.status,
        value: r.status === 'fulfilled' ? r.value : null,
        reason: r.status === 'rejected' ? r.reason.message : null
      }))
    });
  } catch (error) {
    console.error('Error in sendBulkPushNotification:', error);
    return sendResponse(res, 500, 'Failed to send bulk notifications', { error: error.message });
  }
};

