# 開発環境・技術スタック・設定

本ドキュメントでは開発に必要なランタイム・ツール、ディレクトリ構成、Lint／Formatter 設定、環境変数をまとめます。

---

## 1. ランタイム & パッケージマネージャ
- Node.js 18.x (推奨: v18.16.0)
- TypeScript 5.x
- パッケージマネージャ: pnpm (推奨) / npm / yarn

## 2. フレームワーク & ライブラリ
- アプリ: Next.js 13.x (App Router)
- API: Next.js API Routes / Fastify
- DBアクセス: Supabase JS Client
- LLM: openai, anthropic、google-gemini-client
- 型安全通信: tRPC (任意)

## 3. ディレクトリ構成

ディレクトリ構成については別ファイル [`directory-structure.md`](directory-structure.md) を参照してください。

## 4. Lint & Formatter
- ESLint (eslint-config-airbnb-base + prettier)
- Prettier
- 設定ファイル: `.eslintrc.js`, `.prettierrc`
- Husky + lint-staged (commit 時に自動整形 & チェック)

## 5. EditorConfig & エディタ推奨設定
- `.editorconfig` を設置
- VSCode 拡張推奨: ESLint, Prettier, EditorConfig

## 6. 環境変数
プロジェクトルートに `.env.local` を作成し、以下を設定:
```
# LINE API
LINE_CHANNEL_ID=\
LINE_CHANNEL_SECRET=\
LINE_CHANNEL_ACCESS_TOKEN=\
# Supabase
SUPABASE_URL=\
SUPABASE_ANON_KEY=\
SUPABASE_SERVICE_KEY=\
# OpenAI
OPENAI_API_KEY=\
# Anthropic Claude
ANTHROPIC_API_KEY=\
# Google Gemini
GOOGLE_OAUTH_TOKEN=\
```

## 7. 開発サーバー起動
```bash
# リポジトリを clone
git clone <repo-url>
cd <repo-dir>

# パッケージインストール
pnpm install
# 環境変数設定
cp .env.example .env.local
# .env.local に値を設定

# 開発サーバー起動
pnpm run dev
```

## 8. ビルド & デプロイ
```bash
pnpm run build
pnpm run start
```
- Vercel / Cloudflare Pages / 自社サーバーにデプロイ可能

---

> **更新履歴**
> - 2024-04-11: 初版作成
> - 2024-04-11: ディレクトリ構成を別ファイルに分離 