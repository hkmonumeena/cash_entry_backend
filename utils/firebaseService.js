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
 * Priority: Split env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) > 
 *           FIREBASE_SERVICE_ACCOUNT_KEY > GOOGLE_APPLICATION_CREDENTIALS > FIREBASE_SERVICE_ACCOUNT_PATH > file
 */
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return; // Already initialized
  }

  try {
    // Option 1: Use split environment variables (RECOMMENDED for Vercel)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const projectId = process.env.FIREBASE_PROJECT_ID.trim();
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL.trim();
      let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
      
      // Normalize private key - replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Validate private key format
      if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('FIREBASE_PRIVATE_KEY must start with "-----BEGIN PRIVATE KEY-----"');
      }
      if (!privateKey.includes('\n')) {
        throw new Error('FIREBASE_PRIVATE_KEY appears to be missing newline characters. Make sure to include the full key with BEGIN/END lines.');
      }
      
      const serviceAccount = {
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized using split environment variables');
      console.log(`   Project ID: ${serviceAccount.projectId}`);
      console.log(`   Client Email: ${serviceAccount.clientEmail}`);
      return;
    }

    // Option 2: Use service account key from environment variable (fallback)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const envValue = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        const serviceAccount = JSON.parse(envValue);
        
        // Normalize private key newlines
        if (serviceAccount.private_key) {
          serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
        }
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_KEY');
        console.log(`   Project ID: ${serviceAccount.project_id}`);
        return;
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message);
        throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}`);
      }
    } 
    
    // Option 3: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('✅ Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS');
      return;
    }
    
    // Option 4: Use service account key file path from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(keyPath)) {
        const serviceAccount = require(keyPath);
        if (serviceAccount.private_key) {
          serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_PATH');
        console.log(`   Project ID: ${serviceAccount.project_id}`);
        return;
      } else {
        throw new Error(`Firebase service account file not found: ${keyPath}`);
      }
    }
    
    // Option 5: Auto-detect firebase-service-account-key.json in root directory
    const defaultKeyPath = path.join(__dirname, '..', 'firebase-service-account-key.json');
    if (fs.existsSync(defaultKeyPath)) {
      const serviceAccount = require(defaultKeyPath);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized using firebase-service-account-key.json');
      console.log(`   Project ID: ${serviceAccount.project_id}`);
      return;
    }

    // No credentials found
    throw new Error('Firebase credentials not found. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables in Vercel.');
    
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    console.error('   Make sure Firebase environment variables are set in Vercel:');
    console.error('   - FIREBASE_PROJECT_ID');
    console.error('   - FIREBASE_CLIENT_EMAIL');
    console.error('   - FIREBASE_PRIVATE_KEY');
    console.error('   Or use FIREBASE_SERVICE_ACCOUNT_KEY (JSON format)');
    console.error('   Or place firebase-service-account-key.json in the project root');
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

