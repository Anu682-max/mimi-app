# Cloudinary Зураг Upload Setup

## 1. Cloudinary Бүртгэл үүсгэх

1. **Cloudinary website руу орох**: https://cloudinary.com/
2. **Sign Up** (Үнэгүй бүртгүүлэх)
3. **Dashboard** руу орох

## 2. Credentials авах

Dashboard дээр дараах мэдээллийг хайна:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

## 3. Backend .env файлд нэмэх

Файл: `backend/.env`

```env
# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

⚠️ **Анхаар:** Cloudinary-ээс авсан credentials-ээ оруулна уу!

## 4. Backend дахин эхлүүлэх

```powershell
# Backend terminal дээр
cd backend
pnpm dev
```

## 5. Test хийх

### A) Profile Photo Upload (Web)

1. Browser дээр: http://localhost:3000/profile
2. "Add Photo" товч дарж зураг сонгох
3. Зураг upload болж, profile дээр харагдана

### B) Chat Image Send

1. Chat хуудас руу орох
2. 📷 (Photo icon) дарж зураг сонгох
3. Зураг upload болж, мессеж болон илгээгдэнэ

## 6. API Endpoints

### Upload Image
```
POST /api/v1/media/upload
Headers:
  Authorization: Bearer <token>
Body (multipart/form-data):
  image: <file>

Response:
{
  "status": "success",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "indate-uploads/upload-123456",
    "width": 800,
    "height": 600
  }
}
```

### Add Profile Photo
```
POST /api/v1/users/me/photo
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
  {
    "photoUrl": "https://res.cloudinary.com/..."
  }

Response:
{
  "message": "Photo updated successfully",
  "photos": ["url1", "url2", ...]
}
```

### Remove Profile Photo
```
DELETE /api/v1/users/me/photo
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
  {
    "photoUrl": "https://res.cloudinary.com/..."
  }

Response:
{
  "message": "Photo removed successfully",
  "photos": ["url1", ...]
}
```

## 7. Features

✅ **Profile Photo Upload**
- Up to 6 photos
- First photo = main profile picture
- Delete photos
- 5MB file size limit
- Formats: JPG, PNG, GIF, WEBP

✅ **Chat Image Sharing**
- Send images in chat
- Auto-upload to Cloudinary
- Display in message thread
- Click to view full size

✅ **Image Optimization**
- Auto-resize to 1000px width
- Compressed for fast loading
- Cloudinary CDN delivery

## 8. Folder Structure

Cloudinary дээр зурагууд:
```
indate-uploads/
  ├── upload-1703520123456-789.jpg
  ├── upload-1703520123457-234.png
  └── upload-1703520123458-567.jpg
```

## 9. Error Handling

**Cloudinary configured биш бол:**
```
❌ Upload error: Cloudinary not configured
💡 Set CLOUDINARY_* env variables in backend/.env
```

**Token байхгүй бол:**
```
❌ 401 Unauthorized
💡 Login хийх шаардлагатай
```

**Файл хэт том бол:**
```
❌ File too large (max 5MB)
💡 5MB-аас бага зураг сонгоно уу
```

## 10. Security

- ✅ JWT Authentication required
- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ User-specific uploads only
- ✅ Cloudinary credentials in .env (not in code)

## 11. Mobile Support

React Native mobile app-д мөн ижил API ашиглана:

```typescript
// Upload image
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'photo.jpg',
});

const response = await fetch(`${API_URL}/api/v1/media/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 12. Free Plan Limits

Cloudinary үнэгүй account:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ Unlimited transformations
- ✅ Good enough for development & small apps

## Done! 🎉

Cloudinary холбогдсон! Profile photo болон chat image sending бэлэн!
