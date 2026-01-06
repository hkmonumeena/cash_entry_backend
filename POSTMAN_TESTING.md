# Postman Testing - Firebase Push Notification API

## Base URLs

**Local Development:**
```
http://localhost:3000
```

**Production (Vercel):**
```
https://cash-entry-backend.vercel.app
```
OR
```
https://cash-entry-backend-hkmonumeena.vercel.app
```

**To find your exact Vercel URL:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `cash_entry_backend`
3. Check the "Domains" section or look at the deployment URL
4. Common patterns:
   - `https://[project-name].vercel.app`
   - `https://[project-name]-[username].vercel.app`
   - `https://[custom-domain]` (if you set one up)

---

## 1. Send Background Notification (Data Only)

### cURL Command
```bash
curl --location 'http://localhost:3000/api/send-notification' \
--header 'Content-Type: application/json' \
--data '{
    "deviceToken": "YOUR_FCM_DEVICE_TOKEN",
    "type": "background",
    "data": {
        "action": "update",
        "userId": "123",
        "message": "Background data notification"
    }
}'
```

### Postman Collection JSON
```json
{
    "name": "Send Background Notification",
    "request": {
        "method": "POST",
        "header": [
            {
                "key": "Content-Type",
                "value": "application/json"
            }
        ],
        "body": {
            "mode": "raw",
            "raw": "{\n    \"deviceToken\": \"YOUR_FCM_DEVICE_TOKEN\",\n    \"type\": \"background\",\n    \"data\": {\n        \"action\": \"update\",\n        \"userId\": \"123\",\n        \"message\": \"Background data notification\"\n    }\n}"
        },
        "url": {
            "raw": "{{baseUrl}}/api/send-notification",
            "host": ["{{baseUrl}}"],
            "path": ["api", "send-notification"]
        }
    }
}
```

---

## 2. Send Visible Notification (With Title)

### cURL Command
```bash
curl --location 'http://localhost:3000/api/send-notification' \
--header 'Content-Type: application/json' \
--data '{
    "deviceToken": "YOUR_FCM_DEVICE_TOKEN",
    "type": "visible",
    "title": "New Message",
    "body": "You have a new message from John",
    "data": {
        "messageId": "123",
        "senderId": "456",
        "type": "message"
    }
}'
```

### Postman Collection JSON
```json
{
    "name": "Send Visible Notification",
    "request": {
        "method": "POST",
        "header": [
            {
                "key": "Content-Type",
                "value": "application/json"
            }
        ],
        "body": {
            "mode": "raw",
            "raw": "{\n    \"deviceToken\": \"YOUR_FCM_DEVICE_TOKEN\",\n    \"type\": \"visible\",\n    \"title\": \"New Message\",\n    \"body\": \"You have a new message from John\",\n    \"data\": {\n        \"messageId\": \"123\",\n        \"senderId\": \"456\",\n        \"type\": \"message\"\n    }\n}"
        },
        "url": {
            "raw": "{{baseUrl}}/api/send-notification",
            "host": ["{{baseUrl}}"],
            "path": ["api", "send-notification"]
        }
    }
}
```

---

## 3. Send Bulk Notifications

### cURL Command
```bash
curl --location 'http://localhost:3000/api/send-bulk-notification' \
--header 'Content-Type: application/json' \
--data '{
    "deviceTokens": [
        "TOKEN_1",
        "TOKEN_2",
        "TOKEN_3"
    ],
    "type": "visible",
    "title": "Bulk Notification",
    "body": "This is a bulk notification to multiple devices",
    "data": {
        "notificationType": "bulk",
        "timestamp": "2024-01-01T00:00:00Z"
    }
}'
```

### Postman Collection JSON
```json
{
    "name": "Send Bulk Notification",
    "request": {
        "method": "POST",
        "header": [
            {
                "key": "Content-Type",
                "value": "application/json"
            }
        ],
        "body": {
            "mode": "raw",
            "raw": "{\n    \"deviceTokens\": [\n        \"TOKEN_1\",\n        \"TOKEN_2\",\n        \"TOKEN_3\"\n    ],\n    \"type\": \"visible\",\n    \"title\": \"Bulk Notification\",\n    \"body\": \"This is a bulk notification to multiple devices\",\n    \"data\": {\n        \"notificationType\": \"bulk\",\n        \"timestamp\": \"2024-01-01T00:00:00Z\"\n    }\n}"
        },
        "url": {
            "raw": "{{baseUrl}}/api/send-bulk-notification",
            "host": ["{{baseUrl}}"],
            "path": ["api", "send-bulk-notification"]
        }
    }
}
```

---

## 4. Complete Postman Collection

### Import this into Postman:

```json
{
    "info": {
        "name": "Firebase Push Notification API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:3000",
            "type": "string"
        }
    ],
    "item": [
        {
            "name": "Send Background Notification",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"deviceToken\": \"YOUR_FCM_DEVICE_TOKEN\",\n    \"type\": \"background\",\n    \"data\": {\n        \"action\": \"update\",\n        \"userId\": \"123\",\n        \"message\": \"Background data notification\"\n    }\n}"
                },
                "url": {
                    "raw": "{{baseUrl}}/api/send-notification",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "send-notification"]
                }
            }
        },
        {
            "name": "Send Visible Notification",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"deviceToken\": \"YOUR_FCM_DEVICE_TOKEN\",\n    \"type\": \"visible\",\n    \"title\": \"New Message\",\n    \"body\": \"You have a new message from John\",\n    \"data\": {\n        \"messageId\": \"123\",\n        \"senderId\": \"456\",\n        \"type\": \"message\"\n    }\n}"
                },
                "url": {
                    "raw": "{{baseUrl}}/api/send-notification",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "send-notification"]
                }
            }
        },
        {
            "name": "Send Bulk Notification",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"deviceTokens\": [\n        \"TOKEN_1\",\n        \"TOKEN_2\",\n        \"TOKEN_3\"\n    ],\n    \"type\": \"visible\",\n    \"title\": \"Bulk Notification\",\n    \"body\": \"This is a bulk notification to multiple devices\",\n    \"data\": {\n        \"notificationType\": \"bulk\",\n        \"timestamp\": \"2024-01-01T00:00:00Z\"\n    }\n}"
                },
                "url": {
                    "raw": "{{baseUrl}}/api/send-bulk-notification",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "send-bulk-notification"]
                }
            }
        }
    ]
}
```

---

## How to Use in Postman

### Method 1: Import cURL
1. Open Postman
2. Click **Import** button
3. Select **Raw text** tab
4. Paste any of the cURL commands above
5. Click **Import**

### Method 2: Import Collection
1. Open Postman
2. Click **Import** button
3. Select **Raw text** tab
4. Paste the complete Postman Collection JSON above
5. Click **Import**
6. Update the `baseUrl` variable with your actual URL

### Method 3: Manual Setup
1. Create a new request in Postman
2. Set method to **POST**
3. Enter URL: `http://localhost:3000/api/send-notification`
4. Go to **Headers** tab and add:
   - Key: `Content-Type`
   - Value: `application/json`
5. Go to **Body** tab, select **raw** and **JSON**
6. Paste the JSON body from any example above
7. Replace `YOUR_FCM_DEVICE_TOKEN` with your actual device token

---

## Expected Responses

### Success Response (200)
```json
{
    "status": "success",
    "message": "Notification sent successfully",
    "data": {
        "success": true,
        "messageId": "projects/quicklink-caller/messages/0:1234567890",
        "type": "background"
    }
}
```

### Error Response (400)
```json
{
    "status": "error",
    "message": "Device token is required",
    "data": {}
}
```

### Error Response (500)
```json
{
    "status": "error",
    "message": "Failed to send notification",
    "data": {
        "error": "Invalid registration token"
    }
}
```

---

## Notes

- Replace `YOUR_FCM_DEVICE_TOKEN` with your actual Firebase Cloud Messaging device token
- For production, update the base URL to your Vercel deployment URL
- Background notifications only send data (no visible notification)
- Visible notifications show a notification with title and body
- All data values are automatically converted to strings (FCM requirement)

