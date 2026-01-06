// utils/firebaseService.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or provide service account key in the code
if (!admin.apps.length) {
  try {
    // Option 1: Use service account key from environment variable (recommended for Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      // Ensure private key newlines are preserved
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_KEY');
    } 
    // Option 2: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS');
    }
    // Option 3: Use service account key file path from environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      // Ensure private key newlines are preserved
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_PATH');
    }
    // Option 4: Auto-detect firebase-service-account-key.json in root directory
    else {
      const defaultKeyPath = path.join(__dirname, '..', 'firebase-service-account-key.json');
      if (fs.existsSync(defaultKeyPath)) {
        const serviceAccount = require(defaultKeyPath);
        // Ensure private key newlines are preserved
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized using firebase-service-account-key.json');
      } else {
        console.warn('Firebase Admin SDK not initialized. Please set FIREBASE_SERVICE_ACCOUNT_KEY, GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_PATH environment variable, or place firebase-service-account-key.json in the project root.');
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

/**
 * Send a background notification (data payload only)
 * @param {string} deviceToken - The FCM device token
 * @param {Object} data - The data payload to send
 * @returns {Promise<Object>} - The response from FCM
 */
const sendBackgroundNotification = async (deviceToken, data) => {
  try {
    const message = {
      token: deviceToken,
      data: {
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      },
      // Set priority for background notifications
      android: {
        priority: 'high'
      },
      apns: {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            'content-available': 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    return {
      success: true,
      messageId: response,
      type: 'background'
    };
  } catch (error) {
    console.error('Error sending background notification:', error);
    throw error;
  }
};

/**
 * Send a visible notification with title (notification payload)
 * @param {string} deviceToken - The FCM device token
 * @param {string} title - The notification title
 * @param {string} body - The notification body (optional)
 * @param {Object} data - Additional data payload (optional)
 * @returns {Promise<Object>} - The response from FCM
 */
const sendVisibleNotification = async (deviceToken, title, body = '', data = {}) => {
  try {
    const message = {
      token: deviceToken,
      notification: {
        title: title,
        body: body
      },
      data: {
        // Convert all data values to strings (FCM requirement)
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {})
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            alert: {
              title: title,
              body: body
            },
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    return {
      success: true,
      messageId: response,
      type: 'visible'
    };
  } catch (error) {
    console.error('Error sending visible notification:', error);
    throw error;
  }
};

/**
 * Send notification based on type
 * @param {string} deviceToken - The FCM device token
 * @param {string} type - 'background' or 'visible'
 * @param {Object} payload - The notification payload
 * @returns {Promise<Object>} - The response from FCM
 */
const sendNotification = async (deviceToken, type, payload) => {
  if (type === 'background') {
    return await sendBackgroundNotification(deviceToken, payload.data || payload);
  } else if (type === 'visible') {
    return await sendVisibleNotification(
      deviceToken,
      payload.title || payload.notification?.title,
      payload.body || payload.notification?.body || '',
      payload.data || {}
    );
  } else {
    throw new Error('Invalid notification type. Use "background" or "visible"');
  }
};

module.exports = {
  sendBackgroundNotification,
  sendVisibleNotification,
  sendNotification
};

