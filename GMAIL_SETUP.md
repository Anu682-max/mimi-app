# 📧 Gmail Email Setup Guide

## Gmail App Password Үүсгэх

### Алхам 1: Google Account Security Settings
1. **Google Account-д нэвтрэх:** https://myaccount.google.com/
2. **Security** хэсэг рүү орох
3. **2-Step Verification** идэвхжүүлэх (хэрэв идэвхгүй бол)

### Алхам 2: App Password Үүсгэх
1. **Security** хэсэгт **App passwords** гэснийг хайх
2. **App passwords** дарах
3. **Select app** dropdown:
   - "Mail" сонгох
4. **Select device** dropdown:
   - "Other (Custom name)" сонгох
   - "InDate Backend" гэж нэрлэх
5. **Generate** товч дарах
6. **16 оронтой код** гарч ирнэ - энийг хуулж авах!
   - Жишээ: `abcd efgh ijkl mnop`

### Алхам 3: Backend .env Тохируулах
```bash
# backend/.env файлд дараах мөрүүдийг нэмэх

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop  # 16 оронтой код (хоосон зайгүй)
```

**Жишээ:**
```bash
GMAIL_USER=myapp@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

## 🧪 Test Хийх

### Backend Restart
```powershell
cd 'c:\Users\anulk\OneDrive\Desktop\date app\indate\backend'
pnpm dev
```

Backend эхлэхэд харах ёстой:
```
✅ Email service configured successfully
```

### API Endpoints

#### 1. Verify Email Service
```bash
GET http://localhost:3699/api/v1/email/verify
```

#### 2. Send Test Email
```bash
POST http://localhost:3699/api/v1/email/test
Content-Type: application/json

{
  "to": "recipient@example.com",
  "name": "Test User"
}
```

#### 3. Welcome Email
```bash
POST http://localhost:3699/api/v1/email/welcome
Content-Type: application/json

{
  "to": "newuser@example.com",
  "name": "John"
}
```

#### 4. Match Notification
```bash
POST http://localhost:3699/api/v1/email/match-notification
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "Sarah",
  "matchName": "Alex"
}
```

#### 5. Message Notification
```bash
POST http://localhost:3699/api/v1/email/message-notification
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "Sarah",
  "senderName": "Alex",
  "messagePreview": "Hey! How are you?"
}
```

#### 6. Password Reset
```bash
POST http://localhost:3699/api/v1/email/password-reset
Content-Type: application/json

{
  "to": "user@example.com",
  "resetToken": "abc123xyz"
}
```

## 🎨 Email Templates

System нь дараах email templates ашигладаг:

1. **Welcome Email** 💕
   - New user registration
   - Beautiful gradient design
   - Call-to-action buttons

2. **Match Notification** 🎉
   - New match alerts
   - Match name display
   - Direct link to chat

3. **Message Notification** 💬
   - New message alerts
   - Message preview
   - Quick reply link

4. **Password Reset** 🔐
   - Secure reset links
   - 1-hour expiry warning
   - Security notices

## ⚠️ Анхаар!

1. **Gmail App Password** ашиглах ёстой, энгийн нууц үг биш!
2. **2-Step Verification** заавал идэвхтэй байх ёстой
3. **Sending Limits:** Gmail free account нь өдөрт 500 email илгээх боломжтой
4. **Production-д:** Professional email service (SendGrid, Mailgun) ашиглах хэрэгтэй

## 🔧 Troubleshooting

### "Email service not configured"
- GMAIL_USER болон GMAIL_APP_PASSWORD зөв оруулсан эсэхийг шалгах
- Backend restart хийх

### "Authentication failed"
- App Password зөв эсэхийг шалгах
- 16 оронтой код, хоосон зайгүй
- 2-Step Verification идэвхтэй эсэхийг шалгах

### "Email not received"
- Spam folder шалгах
- Gmail sending limits хэтрээгүй эсэхийг шалгах
- `GET /api/v1/email/verify` endpoint ашиглаж connection шалгах

## 📝 Integration with App

Backend автоматаар email илгээнэ:

1. **User Registration** → Welcome email
2. **New Match** → Match notification
3. **New Message** → Message notification
4. **Forgot Password** → Password reset email

Code-д ингэж ашиглана:
```typescript
import { emailService } from './services/email.service';

// Send welcome email
await emailService.sendWelcomeEmail('user@example.com', 'John');

// Send match notification
await emailService.sendMatchNotification('user@example.com', 'Sarah', 'Alex');
```
