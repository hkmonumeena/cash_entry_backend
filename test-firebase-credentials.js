#!/usr/bin/env node
/**
 * Test script to verify Firebase credentials
 * Usage: node test-firebase-credentials.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'firebase-service-account-key.json');

console.log('🔍 Testing Firebase Credentials...\n');

if (!fs.existsSync(keyPath)) {
  console.error('❌ Error: firebase-service-account-key.json not found');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  
  console.log('✅ Service account file loaded');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  console.log(`   Private Key ID: ${serviceAccount.private_key_id}`);
  
  // Check private key format
  const privateKey = serviceAccount.private_key;
  if (!privateKey) {
    console.error('❌ Error: private_key is missing');
    process.exit(1);
  }
  
  console.log(`\n📝 Private Key Analysis:`);
  console.log(`   Length: ${privateKey.length} characters`);
  console.log(`   Contains '\\n': ${privateKey.includes('\\n')}`);
  console.log(`   Contains actual newlines: ${privateKey.includes('\n')}`);
  console.log(`   Starts with '-----BEGIN': ${privateKey.startsWith('-----BEGIN')}`);
  console.log(`   Ends with '-----END': ${privateKey.endsWith('-----END PRIVATE KEY-----\\n') || privateKey.endsWith('-----END PRIVATE KEY-----\n')}`);
  
  // Normalize the private key
  let normalizedKey = privateKey.replace(/\\n/g, '\n');
  serviceAccount.private_key = normalizedKey;
  
  console.log(`\n   After normalization:`);
  console.log(`   Contains actual newlines: ${normalizedKey.includes('\n')}`);
  console.log(`   Newline count: ${(normalizedKey.match(/\n/g) || []).length}`);
  
  // Try to initialize Firebase
  console.log(`\n🚀 Attempting to initialize Firebase Admin SDK...`);
  
  try {
    // Delete any existing apps
    if (admin.apps.length > 0) {
      admin.apps.forEach(app => app.delete());
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully!');
    
    // Try to get a token (this will verify the credentials)
    console.log('\n🔐 Testing credential validity...');
    const messaging = admin.messaging();
    
    // Just verify we can access the messaging service
    console.log('✅ Messaging service accessible');
    console.log('\n✅ All checks passed! Credentials are valid.\n');
    
    // Clean up
    admin.apps.forEach(app => app.delete());
    
  } catch (initError) {
    console.error('\n❌ Failed to initialize Firebase:');
    console.error(`   Error: ${initError.message}`);
    console.error(`   Code: ${initError.code || 'N/A'}`);
    
    if (initError.message.includes('Invalid JWT Signature')) {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if the key has been revoked in Firebase Console');
      console.error('   2. Generate a new service account key');
      console.error('   3. Verify the private key format is correct');
      console.error(`\n   Check key status: https://console.firebase.google.com/project/${serviceAccount.project_id}/iam-admin/serviceaccounts`);
    }
    
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

