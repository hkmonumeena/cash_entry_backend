// utils/firebaseService.js

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

/**
 * Normalize private key - handles different newline formats
 * @param {string} privateKey - The private key string
 * @returns {string} - Normalized private key with proper newlines
 */
const normalizePrivateKey = (privateKey) => {
  if (!privateKey) return privateKey;
  // Handle escaped newlines (from JSON string)
  let normalized = privateKey.replace(/\\n/g, '\n');
  // Handle literal \n strings
  normalized = normalized.replace(/\\\\n/g, '\n');
  // Ensure proper format
  if (!normalized.includes('\n') && normalized.includes('\\n')) {
    normalized = normalized.replace(/\\n/g, '\n');
  }
  return normalized;
};

/**
 * Initialize Firebase Admin SDK
 * Priority: FIREBASE_SERVICE_ACCOUNT_KEY > GOOGLE_APPLICATION_CREDENTIALS > FIREBASE_SERVICE_ACCOUNT_PATH > file
 */
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return; // Already initialized
  }

  try {
    let serviceAccount = null;
    let initMethod = '';

    // Option 1: Use service account key from environment variable (recommended for Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        // Normalize private key newlines
        if (serviceAccount.private_key) {
          serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
        }
        initMethod = 'FIREBASE_SERVICE_ACCOUNT_KEY';
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON format');
      }
    } 
    // Option 2: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('✅ Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS');
      return;
    }
    // Option 3: Use service account key file path from environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(keyPath)) {
        serviceAccount = require(keyPath);
        if (serviceAccount.private_key) {
          serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
        }
        initMethod = 'FIREBASE_SERVICE_ACCOUNT_PATH';
      } else {
        throw new Error(`Firebase service account file not found: ${keyPath}`);
      }
    }
    // Option 4: Auto-detect firebase-service-account-key.json in root directory
    else {
      const defaultKeyPath = path.join(__dirname, '..', 'firebase-service-account-key.json');
      if (fs.existsSync(defaultKeyPath)) {
        serviceAccount = require(defaultKeyPath);
        if (serviceAccount.private_key) {
          serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
        }
        initMethod = 'firebase-service-account-key.json';
      } else {
        throw new Error('Firebase credentials not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable or place firebase-service-account-key.json in project root.');
      }
    }

    // Initialize with service account
    if (serviceAccount) {
      // Validate required fields
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('Invalid service account: missing required fields (project_id, private_key, or client_email)');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log(`✅ Firebase Admin SDK initialized using ${initMethod}`);
      console.log(`   Project ID: ${serviceAccount.project_id}`);
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set in Vercel environment variables');
    console.error('   Or place firebase-service-account-key.json in the project root');
    
    // Don't throw error, just log it - let the app continue
    // The error will be caught when trying to send notifications
    console.error('   Firebase will not be available until credentials are properly configured');
  }
};

// Initialize Firebase on module load
initializeFirebase();

/**
 * Check if Firebase is initialized
 * @returns {boolean}
 */
const isFirebaseInitialized = () => {
  return admin.apps.length > 0;
};

/**
 * Send a background notification (data payload only)
 * @param {string} deviceToken - The FCM device token
 * @param {Object} data - The data payload to send
 * @returns {Promise<Object>} - The response from FCM
 */
const sendBackgroundNotification = async (deviceToken, data) => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase Admin SDK is not initialized. Please check your Firebase credentials configuration.');
  }

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
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase Admin SDK is not initialized. Please check your Firebase credentials configuration.');
  }

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
  sendNotification,
  isFirebaseInitialized
};

