# Phase 4: AI Chat Translation

This document describes the AI-powered chat translation feature for cross-language communication.

## Overview

InDate enables users speaking different languages to communicate seamlessly through automatic message translation.

## How It Works

1. **User A (Japanese)** sends a message in Japanese
2. **Backend** detects User B uses English
3. **AI Translation** converts the message to English
4. **User B** receives both original and translated text
5. User B can toggle between original and translated

## Architecture

```
┌─────────────┐    Message     ┌─────────────┐
│   User A    │ ──────────────▶│   Backend   │
│  (locale:ja)│                │  Chat Svc   │
└─────────────┘                └──────┬──────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │ Translation │
                               │   Adapter   │
                               └──────┬──────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │  OpenAI API │
                               │ (or other)  │
                               └──────┬──────┘
                                      │
                               Translated ▼
                               ┌─────────────┐
                               │   User B    │
                               │  (locale:en)│
                               └─────────────┘
```

## Backend Implementation

### Translation Adapter Interface

```typescript
// backend/src/ai/translation.adapter.ts

interface TranslationAdapter {
  translate(
    text: string,
    sourceLocale: string,
    targetLocale: string
  ): Promise<TranslationResult>;

  detectLanguage?(text: string): Promise<string>;

  supportsLocales(sourceLocale: string, targetLocale: string): boolean;
}
```

### OpenAI Implementation

```typescript
class OpenAITranslationAdapter implements TranslationAdapter {
  async translate(text, sourceLocale, targetLocale) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Translate from ${sourceLocale} to ${targetLocale}. 
                   Preserve tone, style, and emojis.`,
        },
        { role: 'user', content: text },
      ],
    });

    return {
      translatedText: response.choices[0].message.content,
      sourceLocale,
      targetLocale,
    };
  }
}
```

### Chat Service Integration

```typescript
// backend/src/chat/chat.service.ts

async sendMessage(data: SendMessageDTO) {
  const sender = await userRepository.getById(data.senderId);
  const recipient = await userRepository.getById(recipientId);

  let translatedText;

  // Translate if locales differ
  if (
    config.features.chatTranslationEnabled &&
    sender.locale !== recipient.locale &&
    recipient.preferences.autoTranslate
  ) {
    const result = await this.translationAdapter.translate(
      data.text,
      sender.locale,
      recipient.locale
    );
    translatedText = result.translatedText;
  }

  const message = new Message({
    originalText: data.text,
    translatedText,
    sourceLocale: sender.locale,
    targetLocale: recipient.locale,
  });

  await message.save();
  return message;
}
```

### Message Schema

```typescript
// backend/src/chat/chat.model.ts

{
  originalText: String,      // Original message text
  translatedText: String,    // AI-translated text
  sourceLocale: String,      // Sender's locale (e.g., "ja")
  targetLocale: String,      // Recipient's locale (e.g., "en")
}
```

## Mobile Implementation

### Message Bubble with Translation Toggle

```tsx
// mobile/src/screens/chat/ChatScreen.tsx

function MessageBubble({ message, isOwnMessage }) {
  const [showingOriginal, setShowingOriginal] = useState(false);
  
  const hasTranslation = message.translatedText && 
                         message.sourceLocale !== userLocale;
  
  const displayText = showingOriginal 
    ? message.originalText 
    : message.translatedText;

  return (
    <View style={styles.bubble}>
      <Text>{displayText}</Text>
      
      {hasTranslation && (
        <TouchableOpacity onPress={() => setShowingOriginal(!showingOriginal)}>
          <Text>
            {showingOriginal 
              ? t('chat.show_translation')
              : t('chat.translated_from', { language: message.sourceLocale })}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### Auto-Translate Setting

Users can toggle auto-translation in Settings:

```typescript
// User preferences
{
  preferences: {
    autoTranslate: true  // Enable/disable translation
  }
}
```

When disabled:
- Messages are stored with original text only
- No translation API calls are made

## Configuration

### Enable/Disable Translation

In environment:
```env
CHAT_TRANSLATION_ENABLED=true
```

In region config:
```yaml
features:
  chatTranslationEnabled: true
```

### Translation Provider

```env
TRANSLATION_PROVIDER=openai  # or 'mock' for testing
OPENAI_API_KEY=sk-...
```

## Adding a New Provider

### 1. Implement the Adapter

```typescript
// backend/src/ai/google-translate.adapter.ts

class GoogleTranslateAdapter implements TranslationAdapter {
  async translate(text, sourceLocale, targetLocale) {
    // Call Google Translate API
    return { translatedText, sourceLocale, targetLocale };
  }

  supportsLocales(source, target) {
    return true; // Google supports most language pairs
  }
}
```

### 2. Register in Factory

```typescript
// backend/src/ai/translation.adapter.ts

function createTranslationAdapter(provider, apiKey) {
  switch (provider) {
    case 'openai':
      return new OpenAITranslationAdapter(apiKey);
    case 'google':
      return new GoogleTranslateAdapter(apiKey);
    default:
      return new MockTranslationAdapter();
  }
}
```

## API Response Format

Messages include translation data:

```json
{
  "id": "msg_123",
  "senderId": "user_456",
  "recipientId": "user_789",
  "originalText": "こんにちは！元気ですか？",
  "translatedText": "Hello! How are you?",
  "sourceLocale": "ja",
  "targetLocale": "en",
  "showTranslation": true,
  "createdAt": "2025-12-13T03:00:00Z"
}
```

## Testing

### Unit Test: Translation Flow

```typescript
describe('Chat Translation', () => {
  it('should translate message when locales differ', async () => {
    const mockAdapter = new MockTranslationAdapter();
    const chatService = new ChatService(mockAdapter);

    // Create users with different locales
    const sender = { id: '1', locale: 'ja' };
    const recipient = { id: '2', locale: 'en', preferences: { autoTranslate: true } };

    const message = await chatService.sendMessage({
      conversationId: 'conv_1',
      senderId: sender.id,
      text: 'こんにちは',
    });

    expect(message.translatedText).toBeDefined();
    expect(message.sourceLocale).toBe('ja');
    expect(message.targetLocale).toBe('en');
  });

  it('should not translate when locales match', async () => {
    // Both users are English
    const message = await chatService.sendMessage({ ... });
    expect(message.translatedText).toBeUndefined();
  });
});
```

### E2E Test: Cross-Language Chat

1. Create two test users (en, ja)
2. User A sends message in Japanese
3. User B receives message with translation
4. User B toggles to view original
5. User B replies in English
6. User A sees translated response

## Performance Considerations

1. **Caching**: Common phrases could be cached
2. **Batch Processing**: Optimize API calls for multiple messages
3. **Fallback**: If translation fails, deliver original text
4. **Rate Limiting**: Implement per-user translation limits

## Cost Optimization

- Use `gpt-4o-mini` for cost-effective translation
- Cache frequent translations (Redis)
- Implement message length limits
- Optional: Local models for common language pairs
