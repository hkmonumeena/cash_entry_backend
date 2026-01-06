# Vercel Environment Variables Setup - Step by Step

## ⚠️ IMPORTANT: Copy the EXACT values below

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: `cash_entry_backend`
3. Click **Settings** → **Environment Variables**

### Step 2: Add Variable 1 - FIREBASE_PROJECT_ID

**Name:** `FIREBASE_PROJECT_ID`

**Value:** 
```
quicklink-caller
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

Click **Save**

---

### Step 3: Add Variable 2 - FIREBASE_CLIENT_EMAIL

**Name:** `FIREBASE_CLIENT_EMAIL`

**Value:**
```
firebase-adminsdk-fvsem@quicklink-caller.iam.gserviceaccount.com
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

Click **Save**

---

### Step 4: Add Variable 3 - FIREBASE_PRIVATE_KEY ⚠️ MOST IMPORTANT

**Name:** `FIREBASE_PRIVATE_KEY`

**Value:** Copy the ENTIRE block below (including BEGIN and END lines):

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYB/BdYqLnH1M+
KZrVK8xbRxv2oz7yjMT9OEINt09x+WHgsRcGmXXUf8GQmOuHBQbqoIDKawNmJF4c
DqWn91MKKvfGfjJFrfM7M89t8B04mQgeiCT+PK60wTvgiUKSX/76/uRb2cmklvOD
nkQvi4jIo4QeTQQxcD4KaaVFucHbQwt5SQSKX0BZj8jELs5gDfaW70SWE6huQaey
VhQBS3IiCtW5HH/zYGa7p6wXihspMBqd4bdtMUkWOIO7miiaSrU1n/zA57N1s92P
qgE5CCMDtVH1kTtOahf/uwzhevnqNIHhTY98az3ZfbJQObtbpJu7ht1nwc6rOFDH
PvIt7gLNAgMBAAECggEANX7DyBA+mD6S0bwiPgLuRDUn6MuUcSIoPq9Bdh2MVAQl
92rK8aSrP7+SKnEfs8vsIko0EkvtJ8w+LLL41Q7i9ovc1v+VidkxN9oU1dvFlKga
kVrz1CwpNBP8tJWw0Ufpv3RCjrcv3mzN6OwWZPKn4M1TEGDQdsCdcF0oYsuExHtR
Tb93CGg4V1NAy3tLMFXYQB2o7ih9XefYw8MKDAHpzQkfSCuxoBofiSWFz6NyZguM
9Q4RLhTSY3BjIEAuPKX0Y78vnrnXBDjtd3S3+LI5MSTiSsqA7vrxbta8uq/qRqbw
PVm7D5v/KZIfKZn31occY5IDCljLCRKwVJHpQa/NsQKBgQD5g5V4S/i6BIL0KV7+
C3GYVUUbORvrhngzSfjf83kr16VAa5Ey5K9w0IfLymi82dMpyPw4LEbeQiWyHr/Y
R5A7p0bDBQfNJGHjDM9hV6xaiRsvr5CwRDuJPZfiNPRGc/Jhj4QI2HRbWglKUttA
5fPB7d34pysCLf/t7U8einxz8QKBgQDdpYoEYFPP8nFAuid9VMGWMoXJ8jwlwIpl
w2fVm4cu5t1yzKzKG9rmGayPvhFMLWjHik94YabR+TzeWzbc4F1JWZr6xX5k0fAz
kbr4YmQB4F2v5doe8AOS1eZtDtyqI180ShLvEOrzdlYmqgK/LmklMdFANQDcPfgO
L4V4VZFonQKBgAdYGSkuS0bmZRhcs2AU5CYQtHUFrE21aopP7hRhbTqeIU4RHHf8
BTHz4VtdPNH6M13yfYIFw5w9JDDm+Myb5qHq3YlV95HRNVRihyQdWYRcrsErkL2v
dHUoq/TLjDkappK6j69W963Mq6NVZwC1BAS8RKFSAlERG4xcRMzoVJtxAoGBALDH
DPM8mNwrs6Q6VLCjXtsaZJaSuuIpVLihRzmZGBKSU2DyWYXA/a+0Hmtu3oDxXrZ3
W7bZu6GQtblq6rDzybNs4izMQ2jKAFhBDOx6HOVaO57FJliyeUctjuDAj8Kq/43G
3p8J0Tpo0YF460PsEjR2LTyWiZ8fVa6KvFsjdBwJAoGANBOU/3VXPa8ythW1m5bR
QTt2QqqFfQgGwbiObjfyaSJx9XsaDZQ6sQmNb41fC9d+DtmD7dfwMdc4Eq/5FveU
4hp3i0Iq+9oy12hjcUTg3k3pGzyH+8WmEl8VMpQQQhoRuqzT6uUJNpVaeuMoDuzc
tVlpBt5oVFcrnSzx+q0+N4I=
-----END PRIVATE KEY-----
```

**⚠️ CRITICAL NOTES:**
- Copy the ENTIRE block above (from `-----BEGIN` to `-----END`)
- Include the BEGIN and END lines
- Keep all the newlines (don't convert to a single line)
- Vercel's text area should preserve the newlines
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

Click **Save**

---

### Step 5: Verify All Variables Are Set

After adding all 3 variables, you should see:
- ✅ FIREBASE_PROJECT_ID
- ✅ FIREBASE_CLIENT_EMAIL  
- ✅ FIREBASE_PRIVATE_KEY

### Step 6: Redeploy

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 7: Check Logs

After redeployment, check the logs. You should see:
```
✅ Firebase Admin SDK initialized using split environment variables
   Project ID: quicklink-caller
   Client Email: firebase-adminsdk-fvsem@quicklink-caller.iam.gserviceaccount.com
   Private key length: 1704, has newlines: true, newline count: 28
```

### Step 8: Test

1. Test status endpoint: `GET /api/firebase-status`
   - Should show `"initialized": true`
   - Should show all 3 variables as "Set"

2. Test notification: `POST /api/send-notification`
   - Should work without JWT signature errors

---

## Troubleshooting

### Still getting "Invalid JWT Signature"?

1. **Verify the key is not revoked:**
   - Go to: https://console.firebase.google.com/project/quicklink-caller/iam-admin/serviceaccounts
   - Check if key ID `d80b91a6043294176d8b887d63426d90de59da5b` exists
   - If not, generate a new key

2. **Check private key format in Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Click on `FIREBASE_PRIVATE_KEY` to view it
   - Make sure it starts with `-----BEGIN PRIVATE KEY-----`
   - Make sure it ends with `-----END PRIVATE KEY-----`
   - Make sure it has newlines (not all on one line)

3. **Try regenerating the key:**
   - Go to Firebase Console → Service Accounts
   - Generate a new key
   - Update the 3 environment variables with the new values

4. **Check Vercel logs:**
   - Look for the initialization message
   - Check the private key length and newline count
   - If newline count is 0, the key format is wrong

