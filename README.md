# InDate - AI Dating App

An AI-powered dating app with multi-language support and real-time chat translation.

## 🌐 Live Demo

**https://indate.vercel.app**

## 🚀 Features

- **Multi-language Support** - English, Japanese, Korean
- **AI Chat Translation** - Auto-translate messages between users
- **Swipe Matching** - Tinder-style discover feature
- **Profile Management** - Edit bio, interests, photos
- **Real-time Chat** - Message your matches

## 📁 Project Structure

```
indate/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── api/       # Vercel serverless entry
│   │   ├── auth/      # Authentication
│   │   ├── chat/      # Chat functionality
│   │   ├── common/    # i18n, middleware
│   │   └── config/    # Regional configs
│   └── scripts/       # Admin scripts
├── web/               # Next.js frontend
│   └── src/
│       ├── app/       # Pages (dashboard, discover, chat, etc.)
│       ├── contexts/  # React contexts
│       └── i18n/      # Translations
├── mobile/            # React Native (planned)
└── docs/              # Documentation
    ├── DEVELOPMENT_MN.md  # Mongolian dev guide
    └── TODO_MN.md         # Mongolian TODO list
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: Next.js, React, TailwindCSS
- **Deploy**: Vercel + MongoDB Atlas
- **i18n**: i18next

## 🏃 Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI
pnpm install
pnpm dev
```

### Frontend

```bash
cd web
pnpm install
pnpm dev
```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/register` | Register |
| GET | `/api/v1/profile` | Get profile |
| PUT | `/api/v1/profile` | Update profile |
| GET | `/api/v1/discover` | Get users to swipe |
| POST | `/api/v1/discover/swipe` | Like/Pass |
| GET | `/api/v1/conversations` | Get chats |
| GET | `/api/v1/messages/:id` | Get messages |
| POST | `/api/v1/messages` | Send message |

## 🔒 Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret

# Optional
OPENAI_API_KEY=sk-...
```

## 📖 Documentation

- [Хөгжүүлэлтийн Заавар (MN)](docs/DEVELOPMENT_MN.md)
- [TODO Жагсаалт (MN)](docs/TODO_MN.md)
- **[Team Workflow Guide](docs/TEAM_WORKFLOW.md)** ← チーム開発ワークフロー

## 👥 Team Development

### New Team Member Setup

```bash
# 1. Clone repository
git clone https://github.com/dxmaster-net/indate.git
cd indate

# 2. Run setup script (Mac/Linux)
bash scripts/team-setup.sh

# 3. Create your feature branch
git checkout -b feature/your-feature-name

# 4. Start developing!
```

### Workflow

1. **Create Branch**: `git checkout -b feature/your-feature`
2. **Develop**: Make changes and commit
3. **Push**: `git push origin feature/your-feature`
4. **Create PR**: Open Pull Request on GitHub
5. **Review**: Team reviews your code
6. **Merge**: Auto-deploy to production after merge

📚 **詳細**: [TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) を参照

---

## 👥 Contact

Contact via Slack for questions.

---

*Last updated: 2025-12-14*
