# チーム開発ワークフロー

## 🎯 概要

このドキュメントでは、InDateプロジェクトでのチーム開発とCI/CD（自動デプロイ）の設定方法を説明します。

---

## 🔄 現在の問題

- **mainブランチにpushしないと自動デプロイされない**
- チームメンバーが独立して作業できない
- コードレビューのプロセスがない

---

## ✅ 推奨ワークフロー

### 1. GitHub Flow（ブランチベース開発）

```
main (本番) ← 常にデプロイ可能
  ↑
  └── feature/新機能 (開発ブランチ)
  └── fix/バグ修正 (修正ブランチ)
```

#### 開発者の作業手順

```bash
# 1. 最新のmainを取得
git checkout main
git pull origin main

# 2. 新しいブランチを作成
git checkout -b feature/add-push-notifications

# 3. 作業してコミット
git add .
git commit -m "feat: Add push notification system"

# 4. GitHubにプッシュ
git push origin feature/add-push-notifications

# 5. GitHubでPull Request作成
# → レビュー → 承認 → Merge
```

---

### 2. Vercel Preview Deployments（プレビューデプロイ）

#### 設定方法

1. **Vercelダッシュボード** → プロジェクト設定
2. **Git** セクションで以下を有効化：
   - ✅ Automatically create Preview Deployments for all branches
   - ✅ Automatically deploy commits pushed to the Production Branch (main)

#### 効果

- **Pull Request作成時**: 自動的にプレビューURLが生成される
  - 例: `https://indate-pr-123.vercel.app`
- **mainにマージ時**: 本番環境に自動デプロイ
  - 例: `https://indate.vercel.app`

---

### 3. Protected Branches（ブランチ保護）

mainブランチを直接編集できないようにして、必ずPRを経由させる。

#### GitHubでの設定

1. **リポジトリ** → **Settings** → **Branches**
2. **Add rule** をクリック
3. **Branch name pattern**: `main`
4. 以下をチェック：
   - ✅ Require a pull request before merging
   - ✅ Require approvals (最低1人)
   - ✅ Require status checks to pass
   - ✅ Include administrators (管理者も例外なし)

---

### 4. GitHub Actions（自動テスト・デプロイ）

#### `.github/workflows/deploy.yml` を作成

```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install && npm test
      - run: cd web && npm install && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Trigger Vercel Deploy
        run: echo "Vercel will auto-deploy"
```

---

## 👥 チームメンバーの設定

### 1. GitHubリポジトリへのアクセス権付与

1. **リポジトリ** → **Settings** → **Collaborators**
2. **Add people** でメンバーを招待
3. 権限レベル:
   - **Write**: コミット・PR作成可能
   - **Maintain**: 設定変更可能
   - **Admin**: 全権限

### 2. Vercelチームへの招待

1. **Vercel Dashboard** → **Settings** → **Members**
2. **Invite** でメンバーを招待
3. 役割:
   - **Member**: デプロイの閲覧・管理
   - **Owner**: プロジェクト設定変更

---

## 📝 実際の作業例

### 例1: 新機能追加（プッシュ通知）

```bash
# 開発者A
git checkout -b feature/push-notifications
# ... 開発 ...
git push origin feature/push-notifications
# → GitHub で PR作成
# → プレビューURL: https://indate-pr-45.vercel.app

# レビュアー（開発者B）
# → PRをレビュー、コメント
# → 承認後、Merge

# → 自動的に本番デプロイ: https://indate.vercel.app
```

### 例2: バグ修正（ログインエラー）

```bash
git checkout -b fix/login-network-error
# ... 修正 ...
git push origin fix/login-network-error
# → PR作成 → レビュー → Merge → 本番デプロイ
```

---

## 🚀 今すぐできる設定

### ステップ1: Vercel Preview Deployments有効化

```bash
# Vercel CLI をインストール
npm install -g vercel

# ログイン
vercel login

# プロジェクトをリンク
cd /path/to/indate
vercel link

# 設定を確認
vercel env pull
```

### ステップ2: チームメンバーを招待

1. **GitHub**: https://github.com/dxmaster-net/indate/settings/access に移動
2. メンバーのGitHubユーザー名を追加
3. **Vercel**: https://vercel.com/dxmaster-net に移動してメンバー招待

### ステップ3: Protected Branchを設定

1. https://github.com/dxmaster-net/indate/settings/branches
2. `main`ブランチのルールを追加

---

## 📊 ワークフローの比較

| 項目 | 現在 | 推奨 |
|------|------|------|
| デプロイ方法 | 手動push | 自動（PR→Merge→Deploy） |
| コードレビュー | なし | Pull Request必須 |
| テスト | 手動 | 自動（GitHub Actions） |
| プレビュー環境 | なし | PR毎に自動生成 |
| 本番保護 | なし | Protected Branch |

---

## ❓ FAQ

**Q: 急ぎの修正はどうする？**
A: Hotfixブランチを作成し、PR作成後に即座にマージ。プロセスは同じ。

**Q: デプロイが遅い場合は？**
A: Vercelの無料プランは制限あり。Pro/Teamプランにアップグレード検討。

**Q: モバイルアプリのデプロイは？**
A: EAS Build（Expo Application Services）を使用。別途設定が必要。

---

## 🔗 参考リンク

- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)
- [Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
