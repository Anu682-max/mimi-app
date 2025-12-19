# InDate - 今週の優先タスク

**週**: 2025年12月20日 - 12月27日  
**目標**: Phase 4 コア機能完成

---

## 🔴 最優先 (今日から開始)

### タスク 1: リアルタイムチャット基盤
**担当**: Backend Developer  
**期限**: 12/22 (日)  
**工数**: 12-16時間

**成果物**:
```
backend/src/chat/
├── chat.socket.ts          # Socket.io サーバー
├── chat.socket.service.ts  # ビジネスロジック
└── types/socket.types.ts   # 型定義

web/src/contexts/
└── SocketContext.tsx       # Socket.io クライアント
```

**チェックリスト**:
- [ ] Socket.io サーバーセットアップ完了
- [ ] JWT認証middleware実装
- [ ] Room管理実装 (conversation別)
- [ ] イベント実装: `message:send`, `message:receive`
- [ ] オンライン/オフライン状態管理
- [ ] フロントエンドContext実装
- [ ] リアルタイムメッセージ受信テスト完了

**技術的詳細**:
```typescript
// backend/src/chat/chat.socket.ts
import { Server as SocketServer } from 'socket.io';

export function setupSocketServer(httpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  // JWT認証middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    // Join user's conversations
    socket.on('join:conversations', async () => {
      const conversations = await getUserConversations(userId);
      conversations.forEach(conv => {
        socket.join(`conversation:${conv.id}`);
      });
    });

    // Send message
    socket.on('message:send', async (data) => {
      const message = await saveMessage(data);
      io.to(`conversation:${data.conversationId}`)
        .emit('message:receive', message);
    });

    // Online status
    await updateUserStatus(userId, 'online');
    socket.on('disconnect', async () => {
      await updateUserStatus(userId, 'offline');
    });
  });
}
```

---

### タスク 2: 画像アップロード設定
**担当**: Full Stack Developer  
**期限**: 12/23 (月)  
**工数**: 8-10時間

**成果物**:
```
backend/src/media/
├── media.service.ts        # Cloudinary統合
├── media.controller.ts     # Upload API
└── media.routes.ts         # Routes

backend/.env
+ CLOUDINARY_CLOUD_NAME=xxx
+ CLOUDINARY_API_KEY=xxx
+ CLOUDINARY_API_SECRET=xxx
```

**チェックリスト**:
- [ ] Cloudinaryアカウント作成完了
- [ ] Upload preset設定完了
- [ ] 環境変数設定完了
- [ ] `media.service.ts` 実装完了
- [ ] POST `/api/v1/media/upload` エンドポイント完成
- [ ] 画像圧縮・リサイズ機能実装
- [ ] Postmanでテスト完了

**実装例**:
```typescript
// backend/src/media/media.service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: Express.Multer.File) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'indate/profiles',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
```

---

### タスク 3: プロフィール画像アップロードUI
**担当**: Frontend Developer  
**期限**: 12/24 (火)  
**工数**: 10-12時間

**成果物**:
```
web/src/app/profile/
└── page.tsx                # 画像アップロードUI追加

web/src/components/
└── ImageUploader.tsx       # 再利用可能コンポーネント
```

**チェックリスト**:
- [ ] ImageUploaderコンポーネント作成
- [ ] ドラッグ&ドロップ機能実装
- [ ] プレビュー機能実装
- [ ] 複数画像対応（最大6枚）
- [ ] 画像削除機能
- [ ] プログレスバー表示
- [ ] プロフィールページに統合
- [ ] レスポンシブ対応確認

**実装例**:
```tsx
// web/src/components/ImageUploader.tsx
export function ImageUploader({ maxImages = 6, onUpload }) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = async (files: File[]) => {
    setUploading(true);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const { url } = await response.json();
      setImages(prev => [...prev, url]);
    }

    setUploading(false);
    onUpload(images);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((img, i) => (
        <ImagePreview key={i} src={img} onDelete={...} />
      ))}
      {images.length < maxImages && (
        <DropZone onDrop={handleDrop} uploading={uploading} />
      )}
    </div>
  );
}
```

---

## 🟡 重要 (今週中)

### タスク 4: AI翻訳UI統合
**担当**: Frontend Developer  
**期限**: 12/25 (水)  
**工数**: 10-12時間

**成果物**:
```
web/src/app/chat/page.tsx   # 翻訳機能追加
web/src/hooks/useTranslation.ts  # Custom hook
```

**チェックリスト**:
- [ ] 翻訳トグルボタン追加
- [ ] useTranslation hook作成
- [ ] 原文/翻訳文切り替え表示
- [ ] 言語選択UI実装
- [ ] ローディング状態表示
- [ ] エラーハンドリング
- [ ] 翻訳キャッシュ実装

---

### タスク 5: タイピングインジケーター
**担当**: Full Stack  
**期限**: 12/26 (木)  
**工数**: 4-6時間

**成果物**:
- Socket イベント: `typing:start`, `typing:stop`
- UI: "○○が入力中..." 表示

**チェックリスト**:
- [ ] Socket イベント実装
- [ ] デバウンス処理実装
- [ ] UI コンポーネント作成
- [ ] アニメーション実装

---

### タスク 6: 既読機能
**担当**: Backend + Frontend  
**期限**: 12/27 (金)  
**工数**: 6-8時間

**成果物**:
```
backend/src/chat/
└── message.model.ts        # readBy フィールド追加

web/src/app/chat/page.tsx   # 既読バッジ表示
```

**チェックリスト**:
- [ ] Message モデルに `readBy` フィールド追加
- [ ] 既読更新API実装
- [ ] Socket で既読通知
- [ ] UI に既読バッジ表示
- [ ] 未読カウント機能

---

## 🟢 できれば (余裕があれば)

### タスク 7: 絵文字サポート
**工数**: 2-3時間
- [ ] Emoji Picker コンポーネント統合
- [ ] 絵文字送信・表示確認

### タスク 8: メッセージ検索
**工数**: 4-6時間
- [ ] 検索UI実装
- [ ] フロントエンド検索ロジック
- [ ] ハイライト表示

---

## 📊 進捗管理

### デイリースタンドアップ (毎日10:00)
- 昨日やったこと
- 今日やること
- ブロッカー

### 週次レビュー (金曜 17:00)
- 完了タスク確認
- デモ
- 来週の計画

---

## 🚨 ブロッカー対応

### もし詰まったら:
1. **30分ルール**: 30分詰まったらチームに相談
2. **ペアプログラミング**: 難しいタスクは2人で
3. **スコープ調整**: 完璧を求めすぎない

### 連絡手段:
- 緊急: Slack DM
- 質問: #indate-dev チャンネル
- レビュー: GitHub PR

---

## ✅ Definition of Done

各タスクは以下を満たすこと:
- [ ] コードレビュー完了
- [ ] ローカルでテスト完了
- [ ] ドキュメント更新（必要に応じて）
- [ ] mainブランチにマージ
- [ ] Vercelデプロイ成功

---

**チーム**: 全員頑張りましょう！🚀  
**質問**: いつでもSlackで！
