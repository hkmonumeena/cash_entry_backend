# Firebase Push Notification Setup Guide

## Prerequisites

1. A Firebase project with Cloud Messaging enabled
2. A service account key from Firebase Console

## Setup Instructions

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Replace the dummy file `firebase-service-account-key.json` with your downloaded JSON file

**Note:** A dummy template file `firebase-service-account-key.json` is already created in the project root. Simply replace its contents with your actual Firebase service account key.

### 2. Configure Environment Variables

Add one of the following to your `.env` file:

**Option 1: Direct JSON (Recommended for serverless)**
```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
```

**Option 2: File Path (Using the dummy file)**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account-key.json
```

Or if you placed it in a different location:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
```

**Option 3: Google Application Credentials**
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

## API Endpoints

### Send Single Notification

**Endpoint:** `POST /api/send-notification`

**Request Body for Background Notification:**
```json
{
  "deviceToken": "your-fcm-device-token",
  "type": "background",
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Request Body for Visible Notification:**
```json
{
  "deviceToken": "your-fcm-device-token",
  "type": "visible",
  "title": "Notification Title",
  "body": "Notification body text",
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Notification sent successfully",
  "data": {
    "success": true,
    "messageId": "projects/.../messages/...",
    "type": "background" // or "visible"
  }
}
```

### Send Bulk Notifications

**Endpoint:** `POST /api/send-bulk-notification`

**Request Body:**
```json
{
  "deviceTokens": [
    "token1",
    "token2",
    "token3"
  ],
  "type": "visible",
  "title": "Bulk Notification",
  "body": "This is a bulk notification",
  "data": {
    "key": "value"
  }
}
```

## Example cURL Commands

### Background Notification
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "your-device-token",
    "type": "background",
    "data": {
      "action": "update",
      "userId": "123"
    }
  }'
```

### Visible Notification
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "your-device-token",
    "type": "visible",
    "title": "New Message",
    "body": "You have a new message",
    "data": {
      "messageId": "123"
    }
  }'
```

## Notes

- All data values in the payload are automatically converted to strings (FCM requirement)
- Background notifications only send data payload (no visible notification)
- Visible notifications show a notification with title and body, plus optional data payload
- Invalid device tokens will return appropriate error messages

