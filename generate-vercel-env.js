#!/usr/bin/env node
/**
 * Helper script to generate FIREBASE_SERVICE_ACCOUNT_KEY for Vercel
 * Usage: node generate-vercel-env.js
 */

const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'firebase-service-account-key.json');

if (!fs.existsSync(keyPath)) {
  console.error('❌ Error: firebase-service-account-key.json not found in project root');
  console.error('   Please make sure the file exists before running this script');
  process.exit(1);
}

try {
  const keyContent = fs.readFileSync(keyPath, 'utf8');
  const serviceAccount = JSON.parse(keyContent);
  
  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('❌ Error: Invalid service account file. Missing required fields.');
    process.exit(1);
  }

  // Generate single-line JSON
  const singleLineJson = JSON.stringify(serviceAccount);
  
  console.log('\n✅ Firebase Service Account Key (for Vercel):\n');
  console.log('='.repeat(80));
  console.log(singleLineJson);
  console.log('='.repeat(80));
  console.log('\n📋 Instructions:');
  console.log('1. Copy the JSON above (everything between the === lines)');
  console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('3. Add new variable:');
  console.log('   - Name: FIREBASE_SERVICE_ACCOUNT_KEY');
  console.log('   - Value: (paste the JSON above)');
  console.log('   - Environments: Production, Preview, Development');
  console.log('4. Save and redeploy\n');
  
} catch (error) {
  console.error('❌ Error reading/parsing firebase-service-account-key.json:', error.message);
  process.exit(1);
}

