# PWA Setup Guide - InDate

InDateアプリはProgressive Web App (PWA)として設定されており、ユーザーはホーム画面にインストールしてネイティブアプリのように使用できます。

---

## 📱 PWA機能

### 実装済み機能
- ✅ **オフライン対応** - Service Workerによるキャッシング
- ✅ **インストール可能** - ホーム画面に追加可能
- ✅ **モバイル最適化** - タッチフレンドリーUI
- ✅ **プッシュ通知対応** - 通知機能の基盤
- ✅ **スプラッシュスクリーン** - アプリ起動時の画面
- ✅ **アプリショートカット** - よく使う機能への直接アクセス

### モバイル最適化
- タッチターゲットサイズ: 最小44x44px
- Safe Area対応 (iPhone X+ のノッチ対応)
- モバイル100vhの正確な処理
- 入力時の自動ズーム防止

---

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
cd web
pnpm install
```

### 2. PWAアイコンの生成

```bash
pnpm run generate-icons
```

このコマンドは以下のサイズのアイコンを生成します：
- 72x72, 96x96, 128x128, 144x144
- 152x152 (Apple Touch Icon)
- 192x192, 384x384, 512x512 (Android)

生成されたアイコンは `public/icons/` に保存されます。

### 3. カスタムアイコンの設定（オプション）

デフォルトのハートアイコンの代わりに独自のロゴを使用する場合：

1. `scripts/generate-icons.js` を編集
2. `svgIcon` 変数を自分のSVGに置き換える
3. または、512x512のPNG画像を用意して `sharp(sourcePath)` で読み込む

### 4. マニフェストのカスタマイズ

`public/manifest.json` を編集して、アプリ名や説明をカスタマイズできます：

```json
{
  "name": "Your App Name",
  "short_name": "AppName",
  "description": "Your app description",
  ...
}
```

---

## 📲 ユーザーインストール方法

### Android / Chrome
1. アプリにアクセス
2. 画面下部のインストールプロンプトをタップ
3. または、メニュー → "ホーム画面に追加"

### iOS / Safari
1. Safariでアプリにアクセス
2. 共有ボタン (□↑) をタップ
3. "ホーム画面に追加" を選択
4. 名前を確認して "追加" をタップ

---

## 🔧 技術詳細

### ファイル構成

```
web/
├── public/
│   ├── manifest.json           # PWAマニフェスト
│   ├── sw.js                   # Service Worker
│   ├── offline.html            # オフライン時のフォールバックページ
│   └── icons/                  # PWAアイコン (自動生成)
│       ├── icon-72x72.png
│       ├── icon-192x192.png
│       └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx          # PWAメタタグ
│   │   ├── providers.tsx       # SW登録
│   │   └── globals.css         # モバイル最適化CSS
│   └── components/
│       └── PWAInstallPrompt.tsx # インストールプロンプト
└── scripts/
    └── generate-icons.js       # アイコン生成スクリプト
```

### Service Worker戦略

**Network First, Cache Fallback**:
1. まずネットワークからフェッチを試みる
2. 成功したらキャッシュに保存
3. 失敗したらキャッシュから返す
4. キャッシュもない場合はオフラインページを表示

### キャッシュ管理

- キャッシュ名: `indate-v1`
- 自動更新: 1時間ごと
- 古いキャッシュの自動削除

---

## 🎨 カスタマイズ

### テーマカラーの変更

```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  themeColor: "#8b5cf6", // ここを変更
  ...
};
```

### スプラッシュスクリーンの背景色

```json
// public/manifest.json
{
  "background_color": "#0a0a0f", // ここを変更
  ...
}
```

### アプリショートカットの追加

```json
// public/manifest.json
{
  "shortcuts": [
    {
      "name": "新しいショートカット",
      "url": "/your-page",
      "icons": [...]
    }
  ]
}
```

---

## 🧪 テスト方法

### Lighthouse監査

```bash
# Chrome DevToolsで:
1. F12で開発者ツールを開く
2. Lighthouseタブを選択
3. "Progressive Web App" を選択
4. "Generate report" をクリック
```

目標スコア: **90+**

### PWAチェックリスト

- [ ] HTTPSで配信されている
- [ ] manifest.jsonが存在する
- [ ] Service Workerが登録されている
- [ ] 192x192と512x512のアイコンがある
- [ ] オフライン時にも動作する
- [ ] モバイルでViewportが適切
- [ ] レスポンシブデザイン

---

## 📊 パフォーマンス最適化

### 実装済み最適化
- Service Workerによるアセットキャッシュ
- 画像の遅延読み込み対応準備
- CSS/JSの最小化（Next.js自動）
- モバイルviewport高さの正確な計算

### 推奨される追加最適化
- 画像の WebP/AVIF 変換
- Code Splitting の活用
- 重要なCSSのインライン化
- プリロード/プリフェッチの活用

---

## 🐛 トラブルシューティング

### Service Workerが登録されない
- HTTPSで配信されているか確認
- `process.env.NODE_ENV === 'production'` を確認
- ブラウザコンソールでエラーを確認

### インストールプロンプトが表示されない
- PWAの要件を満たしているか確認 (Lighthouse)
- ユーザーが以前にプロンプトを却下していないか確認
- 7日間の却下制限が有効か確認

### アイコンが表示されない
- `pnpm run generate-icons` を実行済みか確認
- `public/icons/` にファイルが存在するか確認
- manifest.jsonのパスが正しいか確認

### オフラインで動かない
- Service Workerが正しく登録されているか確認
- キャッシュに必要なアセットがあるか確認
- ネットワークタブでService Workerの動作を確認

---

## 📚 参考リンク

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox (Google's SW Library)](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## ✅ デプロイチェックリスト

本番環境にデプロイする前に:

- [ ] アイコンを全サイズ生成済み
- [ ] manifest.jsonのURL/名前を確認
- [ ] Service Workerが本番環境で動作することを確認
- [ ] Lighthouseで90+スコア
- [ ] iOS/Androidの両方でテスト
- [ ] オフライン動作をテスト
- [ ] プッシュ通知の許可フローをテスト

---

**PWA化完了！🎉**

これでInDateはモバイルデバイスにインストール可能なプログレッシブWebアプリになりました！
