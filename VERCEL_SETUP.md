# Vercel Environment Variables Setup

## Problem
If you're getting "Invalid JWT Signature" error on Vercel, it's because:
1. The `firebase-service-account-key.json` file might not be accessible on Vercel
2. The private key newlines might be lost when reading from file

## Solution: Use Environment Variables on Vercel

### Step 1: Get Your Firebase Service Account Key JSON

Read your `firebase-service-account-key.json` file and copy the entire content.

### Step 2: Add Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `cash_entry_backend`
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** Paste the entire JSON content from `firebase-service-account-key.json`
   - **Environments:** Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Important - Format the JSON Correctly

When pasting the JSON into Vercel, make sure:
- The entire JSON is on a single line, OR
- Use proper JSON formatting with escaped quotes

**Option A: Single Line (Recommended)**

Run this command to generate the single-line JSON:
```bash
node -e "const fs = require('fs'); const key = JSON.parse(fs.readFileSync('firebase-service-account-key.json', 'utf8')); console.log(JSON.stringify(key));"
```

Copy the output and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in Vercel.

**Option B: Pretty JSON (Multi-line)**
Keep the JSON formatted but ensure all quotes are properly escaped. Vercel will handle it.

### Step 4: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment, OR
3. Push a new commit to trigger automatic deployment

### Step 5: Verify

After deployment, test the API:
```bash
curl --location 'https://your-vercel-url.vercel.app/api/send-notification' \
--header 'Content-Type: application/json' \
--data '{
    "deviceToken": "YOUR_DEVICE_TOKEN",
    "type": "visible",
    "title": "Test",
    "body": "Testing from Vercel"
}'
```

## Alternative: Using Vercel CLI

You can also set environment variables using Vercel CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set the environment variable
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY

# When prompted, paste your JSON (single line or formatted)
# Select environments: production, preview, development
```

## Troubleshooting

### Still getting "Invalid JWT Signature"?

1. **Check the private key format**: Make sure `\n` characters are preserved in the private_key field
2. **Verify the key is not revoked**: Go to [Firebase Console](https://console.firebase.google.com/project/quicklink-caller/iam-admin/serviceaccounts) and check if the key ID `d80b91a6043294176d8b887d63426d90de59da5b` is still present
3. **Regenerate the key**: If the key is revoked, generate a new one from Firebase Console
4. **Check server time**: Vercel servers should have synced time, but if issues persist, this could be a factor

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → **Logs**
2. Look for Firebase initialization messages
3. Check for any error messages during initialization

## Quick Script to Generate Single-Line JSON

If you need to convert your JSON to a single line, you can use this Node.js script:

```javascript
const fs = require('fs');
const key = JSON.parse(fs.readFileSync('firebase-service-account-key.json', 'utf8'));
console.log(JSON.stringify(key));
```

Run it and copy the output to Vercel environment variable.

