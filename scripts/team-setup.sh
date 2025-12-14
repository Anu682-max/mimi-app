#!/bin/bash

# InDate - Quick Team Setup Script
# このスクリプトはチーム開発の初期設定を行います

echo "🚀 InDate チーム開発セットアップ"
echo "=================================="
echo ""

# 1. Git設定確認
echo "1️⃣ Git設定を確認中..."
if ! git config user.name > /dev/null; then
    echo "❌ Git user.name が設定されていません"
    read -p "あなたの名前を入力してください: " username
    git config user.name "$username"
fi

if ! git config user.email > /dev/null; then
    echo "❌ Git user.email が設定されていません"
    read -p "あなたのメールアドレスを入力してください: " email
    git config user.email "$email"
fi

echo "✅ Git設定完了"
echo "   Name: $(git config user.name)"
echo "   Email: $(git config user.email)"
echo ""

# 2. リモートブランチ確認
echo "2️⃣ リモートブランチを確認中..."
git fetch origin
echo "✅ リモートブランチ取得完了"
echo ""

# 3. 最新のmainブランチに更新
echo "3️⃣ mainブランチを最新に更新中..."
git checkout main
git pull origin main
echo "✅ 最新のmainブランチに更新完了"
echo ""

# 4. 依存関係インストール
echo "4️⃣ 依存関係をインストール中..."

if [ -d "backend" ]; then
    echo "📦 Backend..."
    cd backend && pnpm install && cd ..
fi

if [ -d "web" ]; then
    echo "📦 Web..."
    cd web && pnpm install && cd ..
fi

if [ -d "mobile" ]; then
    echo "📦 Mobile..."
    cd mobile && pnpm install && cd ..
fi

echo "✅ 依存関係インストール完了"
echo ""

# 5. 環境変数設定
echo "5️⃣ 環境変数を設定中..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env が見つかりません"
    echo "   backend/.env.example からコピーします..."
    cp backend/.env.example backend/.env
    echo "✅ backend/.env を作成しました（内容を確認してください）"
fi

if [ ! -f "web/.env.local" ]; then
    echo "⚠️  web/.env.local が見つかりません"
    echo "   デフォルト設定を作成します..."
    echo "NEXT_PUBLIC_API_URL=https://indate.vercel.app" > web/.env.local
    echo "✅ web/.env.local を作成しました"
fi

echo ""

# 6. セットアップ完了
echo "✅ セットアップ完了！"
echo ""
echo "📝 次のステップ:"
echo "   1. backend/.env を確認・編集してください"
echo "   2. 新しいブランチを作成して作業を開始:"
echo "      git checkout -b feature/あなたの機能名"
echo "   3. 作業が完了したら:"
echo "      git add ."
echo "      git commit -m 'feat: 機能の説明'"
echo "      git push origin feature/あなたの機能名"
echo "   4. GitHubでPull Requestを作成してください"
echo ""
echo "📖 詳細は docs/TEAM_WORKFLOW.md を参照してください"
