#!/usr/bin/env node
/**
 * Helper script to generate split Firebase environment variables for Vercel
 * Usage: node generate-vercel-env-split.js
 */

const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'firebase-service-account-key.json');

console.log('🔧 Generating Vercel Environment Variables (Split Method)\n');

if (!fs.existsSync(keyPath)) {
  console.error('❌ Error: firebase-service-account-key.json not found in project root');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  
  console.log('✅ Service account file loaded\n');
  console.log('📋 Add these THREE environment variables in Vercel:\n');
  console.log('='.repeat(80));
  console.log('\n1️⃣  FIREBASE_PROJECT_ID');
  console.log('   Value:');
  console.log(`   ${serviceAccount.project_id}`);
  console.log('\n' + '-'.repeat(80));
  console.log('\n2️⃣  FIREBASE_CLIENT_EMAIL');
  console.log('   Value:');
  console.log(`   ${serviceAccount.client_email}`);
  console.log('\n' + '-'.repeat(80));
  console.log('\n3️⃣  FIREBASE_PRIVATE_KEY');
  console.log('   Value:');
  console.log(`   ${serviceAccount.private_key}`);
  console.log('\n' + '='.repeat(80));
  console.log('\n📝 Instructions:');
  console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('2. Add each variable separately:');
  console.log('   - Name: FIREBASE_PROJECT_ID');
  console.log('     Value: ' + serviceAccount.project_id);
  console.log('   - Name: FIREBASE_CLIENT_EMAIL');
  console.log('     Value: ' + serviceAccount.client_email);
  console.log('   - Name: FIREBASE_PRIVATE_KEY');
  console.log('     Value: (copy the entire private key above, including BEGIN/END lines)');
  console.log('3. For each variable, select all environments (Production, Preview, Development)');
  console.log('4. Save and redeploy\n');
  
} catch (error) {
  console.error('❌ Error reading/parsing firebase-service-account-key.json:', error.message);
  process.exit(1);
}

