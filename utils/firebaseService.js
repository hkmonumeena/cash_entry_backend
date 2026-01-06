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
      try {
        const projectId = process.env.FIREBASE_PROJECT_ID.trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL.trim();
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        console.log(`   Initializing with split variables - Project: ${projectId}, Email: ${clientEmail}`);
        console.log(`   Private key length: ${privateKey.length}, contains \\n: ${privateKey.includes('\\n')}, contains actual newlines: ${privateKey.includes('\n')}`);
        
        // Handle different newline formats that Vercel might use
        // First, try to replace escaped newlines
        if (privateKey.includes('\\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
          console.log(`   After replacing \\n: has newlines: ${privateKey.includes('\n')}, newline count: ${(privateKey.match(/\n/g) || []).length}`);
        }
        
        // If it still doesn't have newlines but has the key content, try to add them
        if (!privateKey.includes('\n') && (privateKey.includes('MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSk') || privateKey.includes('MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSj'))) {
          // Try to reconstruct with newlines at known positions
          console.warn('⚠️  Private key appears to be missing newlines, attempting to normalize...');
          privateKey = privateKey.replace(/(-----BEGIN PRIVATE KEY-----)(.+?)(-----END PRIVATE KEY-----)/s, 
            (match, begin, content, end) => {
              // Add newlines every 64 characters (standard PEM format)
              const normalizedContent = content.replace(/(.{64})/g, '$1\n').trim();
              return `${begin}\n${normalizedContent}\n${end}\n`;
            });
          console.log(`   After normalization: has newlines: ${privateKey.includes('\n')}, newline count: ${(privateKey.match(/\n/g) || []).length}`);
        }
        
        privateKey = privateKey.trim();
        
        // Validate private key format
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
          throw new Error('FIREBASE_PRIVATE_KEY must start with "-----BEGIN PRIVATE KEY-----". Current start: ' + privateKey.substring(0, 50));
        }
        if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
          throw new Error('FIREBASE_PRIVATE_KEY must end with "-----END PRIVATE KEY-----". Current end: ' + privateKey.substring(privateKey.length - 50));
        }
        if (!privateKey.includes('\n')) {
          throw new Error('FIREBASE_PRIVATE_KEY must contain newline characters. The key appears to be on a single line.');
        }
        
        // Log key info for debugging (without exposing the actual key)
        console.log(`   Final private key: length=${privateKey.length}, newlines=${(privateKey.match(/\n/g) || []).length}, starts correctly=${privateKey.startsWith('-----BEGIN')}, ends correctly=${privateKey.endsWith('-----END PRIVATE KEY-----')}`);
        
        const serviceAccount = {
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey
        };

        console.log('   Attempting to initialize Firebase Admin SDK...');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized using split environment variables');
        console.log(`   Project ID: ${serviceAccount.projectId}`);
        console.log(`   Client Email: ${serviceAccount.clientEmail}`);
        return;
      } catch (initError) {
        console.error('❌ Failed to initialize with split environment variables:', initError.message);
        console.error('   Error details:', {
          name: initError.name,
          code: initError.code,
          message: initError.message
        });
        // Re-throw to be caught by outer catch
        throw initError;
      }
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
    console.error('   Error code:', error.code || 'N/A');
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    console.error('\n   Environment variables check:');
    console.error(`   - FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'Set (' + process.env.FIREBASE_PROJECT_ID + ')' : 'Not set'}`);
    console.error(`   - FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? 'Set (' + process.env.FIREBASE_CLIENT_EMAIL + ')' : 'Not set'}`);
    console.error(`   - FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? 'Set (' + process.env.FIREBASE_PRIVATE_KEY.length + ' chars, has \\n: ' + process.env.FIREBASE_PRIVATE_KEY.includes('\\n') + ')' : 'Not set'}`);
    console.error(`   - FIREBASE_SERVICE_ACCOUNT_KEY: ${process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Set (fallback)' : 'Not set'}`);
    console.error('\n   Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in Vercel environment variables');
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

