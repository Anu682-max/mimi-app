# InDate - 実装計画書（詳細版）

**作成日**: 2025-12-19  
**対象**: Phase 4-7 (運用開始までの必須実装)

---

## Week 1: Phase 4 - コア機能完成

### Day 1-2: リアルタイムチャット (2日)

#### タスク 4.1.1: Socket.io 統合
**ファイル**: `backend/src/chat/chat.socket.ts` (新規作成)

```typescript
// 実装内容:
- Socket.io サーバーセットアップ
- JWT認証middleware for Socket
- Room管理 (conversation ID based)
- イベント: message:send, message:read, typing:start, typing:stop
- Online/Offline ステータス管理
```

**ファイル**: `web/src/contexts/SocketContext.tsx` (新規作成)

```typescript
// 実装内容:
- Socket.io クライアント接続管理
- リアルタイムメッセージ受信
- タイピングインジケーター
- オンラインステータス表示
```

**推定工数**: 12-16時間

---

#### タスク 4.1.2: チャットUI改善
**ファイル**: `web/src/app/chat/page.tsx` (更新)

```typescript
// 追加機能:
- 送信中インジケーター
- 既読/未読バッジ
- オンライン/オフライン表示
- タイピングインジケーター ("相手が入力中...")
- メッセージのタイムスタンプ改善
```

**推定工数**: 6-8時間

---

### Day 3-4: AI翻訳機能統合 (2日)

#### タスク 4.2.1: AI翻訳UIの統合
**ファイル**: `web/src/app/chat/page.tsx` (更新)

```typescript
// 実装内容:
- 翻訳トグルボタン
- 原文/翻訳文の切り替え表示
- 翻訳言語選択ドロップダウン
- ローディングインジケーター
```

**ファイル**: `web/src/hooks/useTranslation.ts` (新規作成)

```typescript
// Custom hook:
- メッセージ翻訳APIコール
- 翻訳キャッシュ管理
- エラーハンドリング
```

**推定工数**: 10-12時間

---

#### タスク 4.2.2: 翻訳バックエンドの完成
**ファイル**: `backend/src/ai/translation.adapter.ts` (既存)

```typescript
// 確認・改善:
- OpenAI API エラーハンドリング
- レート制限対策
- 翻訳履歴の保存（オプション）
- コスト最適化（キャッシング）
```

**推定工数**: 6-8時間

---

### Day 5-6: 画像アップロード (2日)

#### タスク 4.3.1: Cloudinary設定
**必要な作業**:
1. Cloudinary アカウント作成
2. Upload preset設定
3. 環境変数追加: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**ファイル**: `backend/src/media/media.service.ts` (新規作成)

```typescript
// 実装内容:
- Cloudinary SDK統合
- 画像アップロード処理
- 画像変換 (リサイズ、圧縮)
- 画像削除処理
- URL生成
```

**推定工数**: 8-10時間

---

#### タスク 4.3.2: プロフィール画像アップロードUI
**ファイル**: `web/src/app/profile/page.tsx` (更新)

```typescript
// 追加機能:
- 複数画像アップロード（最大6枚）
- ドラッグ&ドロップ対応
- プレビュー機能
- 画像の並び替え
- 画像削除
- プログレスバー
```

**推定工数**: 10-12時間

---

#### タスク 4.3.3: チャット内画像送信
**ファイル**: `web/src/app/chat/page.tsx` (更新)

```typescript
// 追加機能:
- 画像選択ボタン
- 画像プレビュー（送信前）
- 画像メッセージの表示
- 画像モーダル（拡大表示）
```

**推定工数**: 8-10時間

---

### Day 7: 通知システム基盤 (1日)

#### タスク 4.4.1: Firebase Cloud Messaging設定
**必要な作業**:
1. Firebase プロジェクト作成
2. FCM設定
3. Service Worker設定（Web Push）
4. 環境変数追加: `FIREBASE_*`

**ファイル**: `web/public/firebase-messaging-sw.js` (新規作成)

```javascript
// Service Worker:
- プッシュ通知受信
- 通知表示処理
- 通知クリック処理
```

**推定工数**: 6-8時間

---

## Week 2: Phase 5 - セキュリティ & パフォーマンス

### Day 8-9: セキュリティ強化 (2日)

#### タスク 5.1.1: Rate Limiting
**ファイル**: `backend/src/common/middlewares/rate-limit.middleware.ts` (新規作成)

```typescript
// 実装内容:
- express-rate-limit 統合
- IP別レート制限
- エンドポイント別制限設定
  - /auth/login: 5 req/15min
  - /auth/register: 3 req/hour
  - /api/*: 100 req/15min
```

**推定工数**: 4-6時間

---

#### タスク 5.1.2: Email確認機能
**必要な作業**:
1. SendGrid または Resend アカウント設定
2. Email テンプレート作成

**ファイル**: `backend/src/auth/email.service.ts` (新規作成)

```typescript
// 実装内容:
- メール送信サービス
- 確認トークン生成
- Email確認エンドポイント
- 再送信ロジック
```

**ファイル**: `backend/src/auth/auth.routes.ts` (更新)

```typescript
// 追加エンドポイント:
- POST /auth/verify-email
- POST /auth/resend-verification
```

**推定工数**: 8-10時間

---

#### タスク 5.1.3: セキュリティヘッダー
**ファイル**: `backend/src/main.ts` (更新)

```typescript
// 追加ミドルウェア:
- helmet (セキュリティヘッダー)
- hpp (HTTP Parameter Pollution)
- cors (CORS最適化)
- xss-clean
```

**推定工数**: 2-3時間

---

### Day 10-11: パフォーマンス最適化 (2日)

#### タスク 5.2.1: Database最適化
**ファイル**: `backend/src/user/user.model.ts` 他 (更新)

```typescript
// 実装内容:
- インデックス追加:
  - User: email (unique), location (geo)
  - Message: conversationId + createdAt
  - Conversation: participants + updatedAt
- Compound インデックス
- Text search インデックス
```

**推定工数**: 4-6時間

---

#### タスク 5.2.2: フロントエンド最適化
**作業内容**:

1. **画像最適化**
   - Next.js Image コンポーネント使用
   - Lazy loading実装
   - WebP形式対応

2. **コード分割**
   - Dynamic imports
   - Route-based splitting
   - Component lazy loading

3. **キャッシング**
   - SWR/React Query導入
   - API レスポンスキャッシュ
   - Static Generation活用

**推定工数**: 10-12時間

---

## Week 3: Phase 6 - 品質保証 & テスト

### Day 12-14: テスト実装 (3日)

#### タスク 6.1.1: バックエンドテスト
**ファイル**: `backend/src/**/*.test.ts`

```typescript
// テスト対象:
1. Auth tests
   - Login/Register flow
   - JWT validation
   - Password reset

2. User tests
   - Profile CRUD
   - Photo upload

3. Chat tests
   - Message send/receive
   - Conversation creation
   - Translation

4. Matching tests
   - Swipe logic
   - Match detection
```

**目標**: 70%+ カバレッジ  
**推定工数**: 16-20時間

---

#### タスク 6.1.2: E2Eテスト (Playwright)
**ファイル**: `e2e/**/*.spec.ts` (新規)

```typescript
// テストシナリオ:
1. User registration & login
2. Profile editing
3. Discover & swipe
4. Matching & chat
5. Settings update
```

**推定工数**: 12-16時間

---

### Day 15: QA & Bug Fixes (1日)

#### タスク 6.2.1: 手動テスト
**チェックリスト**:
- [ ] 全ページの動作確認
- [ ] モバイルレスポンシブ (iPhone, Android)
- [ ] ブラウザ互換性 (Chrome, Safari, Firefox)
- [ ] 多言語切り替え
- [ ] エラーケース

**推定工数**: 6-8時間

---

## Week 4: Phase 7 - 本番環境準備

### Day 16-17: インフラ設定 (2日)

#### タスク 7.1.1: Production環境設定

**Vercel設定**:
```bash
# 環境変数設定 (Vercel Dashboard)
MONGODB_URI=mongodb+srv://production...
JWT_SECRET=<強固なシークレット>
OPENAI_API_KEY=sk-...
CLOUDINARY_*=...
FIREBASE_*=...
SENDGRID_API_KEY=...
NODE_ENV=production
```

**MongoDB Atlas設定**:
- M10クラスターへアップグレード
- バックアップ有効化
- アラート設定
- IP Whitelist

**推定工数**: 6-8時間

---

#### タスク 7.1.2: モニタリング設定

**Sentry設定**:
```typescript
// web/src/app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Vercel Analytics**:
- Analytics有効化
- Speed Insights有効化

**推定工数**: 4-6時間

---

### Day 18: CI/CD パイプライン (1日)

#### タスク 7.2.1: GitHub Actions設定
**ファイル**: `.github/workflows/ci.yml` (新規作成)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run linter
      - Run tests
      - Upload coverage

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - Deploy to Vercel Production
```

**推定工数**: 6-8時間

---

## 総工数見積もり

| Phase | 日数 | 工数（時間） | 担当者数 |
|-------|------|-------------|---------|
| Phase 4 | 7日 | 80-100h | 2名 |
| Phase 5 | 4日 | 40-50h | 2名 |
| Phase 6 | 4日 | 40-50h | 2-3名 |
| Phase 7 | 3日 | 30-40h | 1-2名 |
| **合計** | **18日** | **190-240h** | **2-3名** |

---

## リスク管理

### 高リスク項目
1. **リアルタイム機能の複雑性**
   - 対策: Socket.ioの経験者をアサイン
   - 代替案: Polling方式でのフォールバック

2. **画像アップロードのパフォーマンス**
   - 対策: Cloudinaryの自動最適化活用
   - 代替案: クライアントサイドでの事前圧縮

3. **テストカバレッジの確保**
   - 対策: テスト駆動開発 (TDD) の推奨
   - 代替案: クリティカルパスのみ優先

### 依存関係
- Cloudinaryアカウント承認: 即日
- Firebase承認: 即日
- SendGrid承認: 1-2日
- 決済なし: ブロッカーなし

---

## 品質基準

### パフォーマンス
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- API Response Time: < 200ms (p95)

### セキュリティ
- OWASP Top 10対策完了
- SSL/TLS: A+ rating
- No critical vulnerabilities

### 信頼性
- Uptime: 99.9%
- Error Rate: < 0.1%
- Test Coverage: 70%+

---

## 次のステップ

1. ✅ このロードマップをチームでレビュー
2. ✅ タスクをJira/Trello/GitHub Projectsに登録
3. ✅ 各担当者にアサイン
4. ✅ デイリースタンドアップ開始
5. ✅ 週次レビューミーティング設定

---

**承認者**: プロジェクトマネージャー  
**最終更新**: 2025-12-19
