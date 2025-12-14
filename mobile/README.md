# InDate Mobile App

React Native / Expo mobile application for InDate.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

```bash
cd mobile
pnpm install
```

### Running the App

```bash
# Start Expo development server
pnpm start

# Or run directly on platform
pnpm android
pnpm ios
```

### Testing on Device

1. Install "Expo Go" app from App Store / Google Play
2. Run `pnpm start`
3. Scan QR code with Expo Go (Android) or Camera (iOS)

## 📁 Project Structure

```
mobile/
├── App.tsx                 # Main entry point
├── app.json               # Expo configuration
├── src/
│   ├── config.ts          # API URL and constants
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom hooks
│   ├── i18n/              # Internationalization
│   │   ├── index.ts       # i18n setup
│   │   └── locales/       # Translation files
│   └── screens/           # Screen components
│       ├── LoginScreen.tsx
│       ├── SignupScreen.tsx
│       ├── DiscoverScreen.tsx
│       ├── ChatListScreen.tsx
│       ├── ChatScreen.tsx
│       ├── ProfileScreen.tsx
│       └── SettingsScreen.tsx
└── assets/                # Images, icons
```

## 🔧 Building for Production

### Setup EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Build APK / IPA

```bash
# Android APK
eas build --platform android --profile preview

# iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

## 🌐 API Configuration

The app connects to the backend API. Update the API URL in:

- `app.json` → `extra.apiUrl`
- Or directly in `src/config.ts`

## 📱 Features

- ✅ Authentication (Login / Register)
- ✅ Swipe-based Discover with animations
- ✅ Match notifications
- ✅ Real-time chat
- ✅ AI message translation
- ✅ Profile viewing
- ✅ Multi-language support (EN, JA, KO)
- ✅ Settings with language switcher

## 🎨 Theme

The app uses a dark theme with pink (#EC4899) as the accent color.
