# Restaurant Order System

Рестораны захиалгын удирдлагын систем

## Онцлог

- 👤 Хэрэглэгчийн бүртгэл (Customer, Restaurant, Admin)
- 🏪 Рестораны удирдлага
- 🍽️ Цэсний удирдлага
- 📦 Захиалгын систем
- 🔐 JWT Authentication

## Суулгах

```bash
npm install
```

## MongoDB эхлүүлэх

```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

## Ажиллуулах

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Бүртгүүлэх
- `POST /api/auth/login` - Нэвтрэх

### Restaurants
- `GET /api/restaurants` - Бүх рестораныг авах
- `GET /api/restaurants/:id` - Тодорхой ресторан авах
- `GET /api/restaurants/:id/menu` - Рестораны цэс авах
- `POST /api/restaurants` - Ресторан нэмэх (auth)
- `POST /api/restaurants/:id/menu` - Цэсэнд хоол нэмэх (auth)

### Orders
- `POST /api/orders` - Захиалга үүсгэх (auth)
- `GET /api/orders/my-orders` - Өөрийн захиалгууд (auth)
- `GET /api/orders/:id` - Тодорхой захиалга (auth)
- `PATCH /api/orders/:id/status` - Статус өөрчлөх (restaurant)
- `DELETE /api/orders/:id` - Захиалга цуцлах (auth)

## Жишээ Request

### Бүртгүүлэх
```json
POST /api/auth/register
{
  "name": "Болд",
  "email": "bold@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "99001122",
  "address": "УБ хот"
}
```

### Захиалга үүсгэх
```json
POST /api/orders
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
{
  "restaurantId": "restaurant_id",
  "items": [
    {
      "menuItemId": "item_id",
      "name": "Хуушуур",
      "price": 3000,
      "quantity": 2
    }
  ],
  "totalPrice": 6000,
  "deliveryAddress": "УБ хот, 1-р хороо",
  "phone": "99001122"
}
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/restaurant-orders
JWT_SECRET=tanii_nuuts_tulhuur
PORT=5000
```
