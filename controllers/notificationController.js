// controllers/notificationController.js

const { sendNotification, sendBackgroundNotification, sendVisibleNotification, isFirebaseInitialized } = require('../utils/firebaseService');
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
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      return sendResponse(res, 500, 'Firebase is not initialized. Please check your Firebase credentials configuration in Vercel environment variables.', {
        hint: 'Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable in Vercel Settings'
      });
    }

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
    
    // Handle Firebase initialization errors
    if (error.message && error.message.includes('Invalid JWT Signature')) {
      const hasSplitVars = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
      const hasJsonVar = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      return sendResponse(res, 500, 'Firebase authentication failed. The private key may be incorrectly formatted or the key may have been revoked.', { 
        error: error.message,
        hint: hasSplitVars 
          ? 'Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Vercel Settings → Environment Variables. Make sure FIREBASE_PRIVATE_KEY includes the full key with BEGIN/END lines.'
          : hasJsonVar
          ? 'Check FIREBASE_SERVICE_ACCOUNT_KEY in Vercel Settings → Environment Variables. Consider using split variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) instead.'
          : 'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Vercel Settings → Environment Variables.',
        checkKeyStatus: 'Verify the key is not revoked at https://console.firebase.google.com/project/quicklink-caller/iam-admin/serviceaccounts'
      });
    }
    
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

/**
 * Check Firebase initialization status (diagnostic endpoint)
 */
exports.checkFirebaseStatus = async (req, res) => {
  try {
    const isInitialized = isFirebaseInitialized();
    const hasSplitVars = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
    const hasJsonVar = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const hasGoogCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const hasPath = !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    return sendResponse(res, 200, 'Firebase status check', {
      initialized: isInitialized,
      environmentVariables: {
        // Recommended method
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set',
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set',
        // Fallback methods
        FIREBASE_SERVICE_ACCOUNT_KEY: hasJsonVar ? 'Set' : 'Not set',
        GOOGLE_APPLICATION_CREDENTIALS: hasGoogCreds ? 'Set' : 'Not set',
        FIREBASE_SERVICE_ACCOUNT_PATH: hasPath ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH : 'Not set'
      },
      recommendedMethod: hasSplitVars ? 'split-variables' : hasJsonVar ? 'json-variable' : 'none',
      message: isInitialized 
        ? 'Firebase is properly initialized and ready to send notifications'
        : hasSplitVars
          ? 'Firebase environment variables are set but initialization failed. Check logs for details.'
          : 'Firebase is not initialized. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Vercel environment variables.'
    });
  } catch (error) {
    return sendResponse(res, 500, 'Error checking Firebase status', { error: error.message });
  }
};

