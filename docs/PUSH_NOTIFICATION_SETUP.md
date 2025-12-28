# Push Notification System - Setup Complete ✅

## 📋 Хийсэн өөрчлөлтүүд

### **1. Backend API** 
#### Файлууд:
- [backend/src/api/index.ts](indate/backend/src/api/index.ts)
- [backend/package.json](indate/backend/package.json)

#### Нэмсэн зүйлс:
- ✅ Expo push token schema болон database model
- ✅ `/api/v1/notifications/subscribe/expo` - Mobile app-ийн Expo token бүртгэх endpoint
- ✅ `/api/v1/notifications/send` - Authenticated хэрэглэгч өөртөө test notification илгээх боломжтой болсон
- ✅ Web push болон Expo push notification хоёуланг дэмжих
- ✅ `expo-server-sdk` package суулгасан

---

### **2. Web Push Test Page**
#### Файлууд:
- [web/src/app/test-push/page.tsx](indate/web/src/app/test-push/page.tsx)

#### Засварлалт:
- ✅ UserId автоматаар өөрийнхөө userId ашиглах
- ✅ Login шаардлага нэмсэн
- ✅ Backend API-д token дамжуулах

---

### **3. Mobile App - Push Notification System**

#### 3.1 Notification Service
**Файл:** [mobile/src/services/notificationService.ts](indate/mobile/src/services/notificationService.ts)

**Функцууд:**
- ✅ `registerForPushNotifications()` - Expo push token авах
- ✅ `subscribeToBackend()` - Backend-д token бүртгүүлэх
- ✅ `sendTestNotification()` - Test notification илгээх
- ✅ `addNotificationReceivedListener()` - Notification ирэхэд сонсох
- ✅ `addNotificationResponseListener()` - Notification дарахад навигаци хийх
- ✅ `scheduleLocalNotification()` - Local notification илгээх

#### 3.2 Notification Context
**Файл:** [mobile/src/contexts/NotificationContext.tsx](indate/mobile/src/contexts/NotificationContext.tsx)

**Features:**
- ✅ Auto-register when user logs in
- ✅ Handle foreground notifications
- ✅ Handle notification taps
- ✅ Send test notifications
- ✅ Expo push token management

#### 3.3 Test Screen
**Файл:** [mobile/src/screens/NotificationTestScreen.tsx](indate/mobile/src/screens/NotificationTestScreen.tsx)

**Features:**
- ✅ Registration status харуулах
- ✅ Enable notifications button
- ✅ Send test notification button
- ✅ Debug information
- ✅ Instructions

#### 3.4 App Integration
**Файлууд:**
- [mobile/App.tsx](indate/mobile/App.tsx)
- [mobile/src/screens/SettingsScreen.tsx](indate/mobile/src/screens/SettingsScreen.tsx)

**Нэмсэн:**
- ✅ NotificationProvider wrapper
- ✅ NotificationTestScreen route
- ✅ Settings screen дээр "Test Notifications" холбоос

---

## 🚀 Хэрхэн ашиглах

### Web App:
1. Login хийнэ
2. `/test-push` хуудас руу очино
3. "Enable Push Notifications" дарж зөвшөөрөл өгнө
4. "Send Test Notification" дарж notification илгээнэ

### Mobile App:
1. Login хийнэ
2. Settings → "Test Notifications" сонгоно
3. "Enable Notifications" дарж зөвшөөрөл өгнө  
4. "Send Test Notification" дарж notification илгээнэ

---

## 📦 Dependency шаардлагатай

### Backend:
```bash
cd backend
pnpm install expo-server-sdk
```

### Mobile:
Бүх package аль хэдийн `mobile/package.json`-д байгаа:
- `expo-notifications`
- `expo-device`

---

## ⚙️ Configuration

### Backend .env:
```env
# Push Notifications (Web Push)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@indate.com

# Admin API Key (for sending notifications)
ADMIN_API_KEY=your-secret-admin-key
```

### Web .env.local:
```env
NEXT_PUBLIC_VAPID_KEY=your-vapid-public-key
NEXT_PUBLIC_API_URL=http://localhost:3699/api/v1
```

### Mobile app.json:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

**Note:** Expo projectId авахын тулд:
```bash
cd mobile
npx eas init
```

---

## 🔐 API Endpoints

### GET `/api/v1/notifications/vapid-key`
Web app-ийн VAPID public key авах

### POST `/api/v1/notifications/subscribe`
Web push subscription бүртгэх
```json
{
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### POST `/api/v1/notifications/subscribe/expo`
Expo push token бүртгэх (Mobile)
```json
{
  "expoPushToken": "ExponentPushToken[...]",
  "deviceInfo": {
    "platform": "ios",
    "deviceName": "iPhone 14",
    "osVersion": "17.0"
  }
}
```

### POST `/api/v1/notifications/send`
Test notification илгээх
```json
{
  "title": "💕 New Match!",
  "body": "You have a new match!",
  "url": "/dashboard"
}
```

**Authentication:**
- Bearer token (өөртөө илгээх)
- OR `x-admin-key` header (бусдад илгээх)

---

## 🎨 Features

### Web:
- ✅ Service Worker ашиглан background notifications
- ✅ Permission request
- ✅ Subscription management
- ✅ Test notification илгээх
- ✅ Debug info харуулах

### Mobile:
- ✅ Expo push notifications
- ✅ Foreground & background notifications
- ✅ Notification tap navigation
- ✅ Badge count management
- ✅ Local notifications
- ✅ Auto-registration on login

---

## 🧪 Testing

### Web:
1. Terminal 1: `cd backend && pnpm dev`
2. Terminal 2: `cd web && pnpm dev`
3. Browser: http://localhost:3000/test-push
4. Enable notifications → Send test

### Mobile:
1. Terminal 1: `cd backend && pnpm dev`
2. Terminal 2: `cd mobile && pnpm start`
3. Expo Go app эсвэл simulator дээр ажиллуулах
4. Settings → Test Notifications
5. Enable → Send test

---

## 📝 Important Notes

1. **Physical Device Required:** Expo push notifications require physical device (simulator дээр ажиллахгүй)

2. **Expo Project ID:** Mobile app ажиллуулахаас өмнө `app.json` дээр projectId тохируулах шаардлагатай

3. **VAPID Keys:** Backend дээр VAPID keys generate хийх:
```bash
cd backend
npx ts-node scripts/generate-vapid-keys.ts
```

4. **Service Worker:** Web app дээр `/public/sw.js` бэлэн байгаа

5. **Backend Dependencies:** `expo-server-sdk` суулгах шаардлагатай:
```bash
cd backend && pnpm install
```

---

## 🎯 Next Steps

- [ ] Match үед notification илгээх
- [ ] Message ирэхэд notification илгээх
- [ ] Notification history хадгалах
- [ ] Notification preferences (on/off switches)
- [ ] Rich notifications (images, actions)
- [ ] Scheduled notifications

---

## 🐛 Troubleshooting

### Web:
- Service Worker бүртгэгдээгүй: Browser refresh хийх
- Permission denied: Browser settings дээр notification зөвшөөрөл өгөх
- VAPID key алдаа: .env файлыг шалгах

### Mobile:
- No token: Physical device ашиглах (simulator биш)
- Permission denied: Device settings дээр notification зөвшөөрөл өгөх
- Token not saved: Backend API ажиллаж байгаа эсэхийг шалгах

---

✨ **Push Notification System бүрэн тохируулсан!** ✨
