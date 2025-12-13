# InDate - AI-Powered Dating App

An international, multi-region dating app with AI matchmaking, chat translation, and video profiles.

## 🌍 Features

- **AI-Powered Matching** - Smart compatibility scoring beyond just photos
- **Real-Time Chat Translation** - Communicate across languages seamlessly
- **Video Profiles** - AI-enhanced video introductions
- **Verified Profiles** - Build trust with identity verification
- **Multi-Region Support** - Optimized for global users

## 📱 Tech Stack

### Mobile
- React Native
- TypeScript
- i18next (internationalization)
- Socket.io (real-time messaging)

### Backend
- Node.js + Express
- TypeScript
- MongoDB (with geo-spatial queries)
- Redis (caching)
- Socket.io (WebSocket)
- OpenAI (translation, AI features)

## 🗂 Project Structure

```
indate/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── user/           # User management
│   │   ├── matching/       # Match/swipe logic
│   │   ├── chat/           # Messaging
│   │   ├── ai/             # AI services (translation)
│   │   ├── common/         # Shared utilities, i18n
│   │   └── config/         # Configuration
│   └── package.json
├── mobile/                  # React Native app
│   ├── src/
│   │   ├── i18n/           # Internationalization
│   │   ├── screens/        # UI screens
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API services
│   └── package.json
├── config/
│   └── regions/            # Region-specific configs
├── docs/
│   ├── internationalization/
│   └── store-localization/
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- React Native development environment

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npx react-native run-ios
# or
npx react-native run-android
```

## 🌐 Internationalization

### Supported Languages
- 🇺🇸 English (en) - Default
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇩🇪 German (de)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇨🇳 Chinese (zh)

### Adding a New Language

1. Create locale files:
   - `backend/src/locales/{code}.json`
   - `mobile/src/i18n/locales/{code}.json`

2. Register in config:
   - Update `SUPPORTED_LOCALES` in both codebases

See [docs/internationalization/phase-1-i18n.md](docs/internationalization/phase-1-i18n.md) for details.

## 🌏 Multi-Region Architecture

Regions:
- `us-east` - United States (East)
- `eu-west` - Europe (West)
- `ap-northeast` - Asia Pacific (Japan/Korea)

Each region has:
- Custom feature flags
- Locale restrictions
- Age/verification rules
- Database endpoints

See [docs/internationalization/multi-region-architecture.md](docs/internationalization/multi-region-architecture.md).

## 💬 AI Chat Translation

Messages between users with different locales are automatically translated:

```typescript
// User A (Japanese) sends: "こんにちは"
// User B (English) receives: { originalText: "こんにちは", translatedText: "Hello" }
```

Users can toggle to see original or translated text.

See [docs/internationalization/phase-4-chat-translation.md](docs/internationalization/phase-4-chat-translation.md).

## 🔧 Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
REGION=us-east

# Database
MONGODB_URI=mongodb://localhost:27017/indate
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

# AI
OPENAI_API_KEY=sk-...
TRANSLATION_PROVIDER=openai

# Features
CHAT_TRANSLATION_ENABLED=true
AI_MATCHING_ENABLED=true
```

### Region Configuration

Edit `config/regions/{region}.yml`:

```yaml
name: ap-northeast
locales: [ja, ko, en]
defaultLocale: ja
features:
  verificationRequired: true
rules:
  minimumAge: 18
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run i18n tests specifically
npm test -- --grep "i18n"
```

## 📖 Documentation

- [Phase 1: i18n Foundation](docs/internationalization/phase-1-i18n.md)
- [Multi-Region Architecture](docs/internationalization/multi-region-architecture.md)
- [Phase 4: Chat Translation](docs/internationalization/phase-4-chat-translation.md)
- [App Store Templates](docs/store-localization/app-store-templates.md)

## 🔒 Security

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet security headers
- Profile verification system

## 📄 License

Proprietary - All Rights Reserved

## 🤝 Contributing

1. Create a feature branch
2. Follow existing code style
3. Add tests for new features
4. Update documentation
5. Submit a pull request
