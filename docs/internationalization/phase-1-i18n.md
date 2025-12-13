# Phase 1: Internationalization (i18n) Foundation

This document details the i18n implementation for the InDate dating app, covering both mobile and backend.

## Overview

The InDate app now supports multiple languages and locales with a robust localization system.

### Supported Locales
- **English (en)** - Default
- **Japanese (ja)** - 日本語
- **Korean (ko)** - 한국어
- **German (de)** - Deutsch
- **French (fr)** - Français
- **Spanish (es)** - Español
- **Chinese (zh)** - 中文

## Backend i18n

### Locale Files Location
```
backend/src/locales/
├── en.json
├── ja.json
└── ko.json
```

### Translation Helper

The `t()` function in `backend/src/common/i18n.ts` provides:

```typescript
import { t } from './common/i18n';

// Basic usage
t('auth.login_title', 'ja'); // Returns "ログイン"

// With parameters
t('validation.password_min_length', 'en', { min: 8 }); 
// Returns "Password must be at least 8 characters"
```

### Features
- **Parameter Interpolation**: `{{param}}` syntax
- **Fallback**: Falls back to English if translation is missing
- **Caching**: Translations are cached for performance
- **Warning Logs**: Missing translations are logged

### API Headers

The backend accepts these headers for locale:
- `X-Locale`: Explicit locale (highest priority)
- `Accept-Language`: Standard browser header

### User Locale Storage

The user model includes:
```typescript
{
  locale: 'en' | 'ja' | 'ko' | ..., // User's preferred language
  timezone: string,                 // IANA timezone (e.g., "Asia/Tokyo")
  region: string,                   // Geographic region (e.g., "ap-northeast")
}
```

## Mobile i18n

### Locale Files Location
```
mobile/src/i18n/
├── index.ts           # i18next configuration
├── hooks.ts           # Custom hooks
└── locales/
    ├── en.json
    ├── ja.json
    └── ko.json
```

### Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <Text>{t('auth.login_title')}</Text>;
}
```

### Custom Hooks

#### `useLocale()`
```tsx
const { t, locale, setLocale, supportedLocales } = useLocale();

// Change language
await setLocale('ja');
```

#### `useDateFormatter(timezone)`
```tsx
const { formatDate, formatRelativeTime, formatDistance } = useDateFormatter('Asia/Tokyo');

formatDate(new Date());           // "December 13, 2025"
formatRelativeTime(someDate);     // "5 minutes ago"
formatDistance(25);               // "25 km"
```

#### `useLanguageSelector()`
```tsx
const { languages, selectLanguage, currentLanguage } = useLanguageSelector();

// languages = [{ code: 'en', name: 'English', isSelected: true }, ...]
```

### Locale Detection

The app automatically:
1. Checks for saved language preference
2. Falls back to device language
3. Falls back to English if not supported

## Adding a New Language

### 1. Create Locale Files

Backend:
```bash
cp backend/src/locales/en.json backend/src/locales/de.json
# Translate all strings
```

Mobile:
```bash
cp mobile/src/i18n/locales/en.json mobile/src/i18n/locales/de.json
# Translate all strings
```

### 2. Register the Locale

Backend (`backend/src/common/i18n.ts`):
```typescript
export const SUPPORTED_LOCALES: Locale[] = ['en', 'ja', 'ko', 'de', ...];

export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
  // ...
  de: 'Deutsch',
};
```

Mobile (`mobile/src/i18n/index.ts`):
```typescript
import de from './locales/de.json';

const resources = {
  // ...
  de: { translation: de },
};
```

### 3. Test the Language

Run the test suite and verify:
```bash
cd backend
npm test -- --grep "i18n"
```

## Translation Keys Structure

```json
{
  "common": { "ok": "OK", "cancel": "Cancel", ... },
  "auth": { "login_title": "Log In", ... },
  "validation": { "email_required": "Email is required", ... },
  "profile": { "title": "Profile", ... },
  "onboarding": { "welcome": "Welcome to InDate", ... },
  "discover": { "title": "Discover", ... },
  "matching": { "its_a_match": "It's a Match!", ... },
  "chat": { "title": "Messages", ... },
  "notifications": { "new_match": "You have a new match!", ... },
  "settings": { "title": "Settings", ... },
  "verification": { "title": "Get Verified", ... },
  "errors": { "network_error": "Network error", ... },
  "time": { "just_now": "Just now", ... }
}
```

## API Endpoints

### Get Available Locales
```
GET /api/v1/users/locales
```

Response:
```json
{
  "locales": [
    { "code": "en", "name": "English" },
    { "code": "ja", "name": "日本語" }
  ],
  "default": "en"
}
```

### Get All Translations
```
GET /api/v1/users/translations/:locale
```

### Update User Locale
```
PUT /api/v1/users/me/locale
Body: { "locale": "ja" }
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

Key test file: `backend/src/common/i18n.test.ts`

Tests cover:
- Translation lookup
- Parameter interpolation
- Fallback behavior
- Locale validation

### Mobile Tests
Verify language switching in Settings screen:
1. Open Settings
2. Tap "Change Language"
3. Select a different language
4. Verify all UI text updates immediately
