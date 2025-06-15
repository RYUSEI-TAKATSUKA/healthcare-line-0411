# Healthcare LINE Bot

LINE Fitness BOT - 日本語対応のヘルスケアアシスタントLINEボット

## 概要

このプロジェクトは、LINEメッセージングプラットフォームを通じて動作する日本語のヘルスケアアシスタントです。AI搭載のフィットネスガイダンス、目標設定、トレーニングプラン、進捗追跡、健康相談をLLM統合により提供します。

## 主な機能

- 🎯 **目標設定**: LLMアシスタンスによるSMART目標作成
- 🏋️ **ワークアウトプランニング**: AI生成によるパーソナライズされたトレーニングプラン
- 📊 **ワークアウト実行**: 進捗追跡と記録
- 🩺 **健康相談**: LLMを活用した健康Q&A
- 💬 **対話型インターフェース**: LINEの豊富なUI機能を活用

## 技術スタック

- **Runtime**: Node.js 18.x, TypeScript 5.x
- **Framework**: Next.js 13.x with App Router
- **Database**: Supabase (PostgreSQL)
- **LLM Integration**: OpenAI, Anthropic Claude, Google Gemini
- **Messaging**: LINE Messaging API
- **Testing**: Jest/Vitest, Playwright for E2E
- **Linting**: ESLint with Airbnb config + Prettier
- **Package Manager**: pnpm

## アーキテクチャ

### 設計パターン
- **イベント駆動アーキテクチャ**: すべてのユーザーインタラクションはEvent Mediatorを通じて流れる
- **ドメイン駆動設計**: 異なるドメイン（目標設定、ワークアウトプランニングなど）に分離
- **レイヤー分離**: Interface → Application → Domain → Infrastructure

### 主要コンポーネント

**Application Layer:**
- **Event Mediator**: すべてのイベントの中央オーケストレーター
- **Session Manager**: ユーザー会話状態とコンテキストの管理
- **UI Manager**: LINE固有のUIコンポーネントの処理
- **LINE Adapter**: LINE Messaging APIと内部イベント間の変換

**Domain Layer:**
- **Goal Setting**: LLMアシスタンスによるSMART目標作成
- **Workout Planning**: AI生成パーソナライズトレーニングプラン
- **Workout Execution**: 進捗追跡と記録
- **Health Consultation**: LLMを活用した健康Q&A

**Infrastructure Layer:**
- **ChatCompletion**: リトライロジック付きLLM APIラッパー
- **Supabase Connector**: RLS準拠のデータベースアクセス

## 開発コマンド

```bash
# パッケージ管理（pnpmを推奨）
pnpm install           # 依存関係のインストール
pnpm run dev           # 開発サーバー起動
pnpm run build         # プロダクションビルド
pnpm run start         # プロダクションサーバー起動

# コード品質
pnpm run lint          # ESLint実行
pnpm run type-check    # TypeScript型チェック

# テスト
pnpm run test:unit     # ユニットテスト実行
pnpm run test:integration  # 統合テスト実行
pnpm run test:e2e      # E2Eテスト実行

# データベース（実装時）
pnpm run db:migrate    # Prismaマイグレーション実行
pnpm run db:seed       # データベースシード
```

## 環境変数

```bash
# LINE API
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# LLM APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_OAUTH_TOKEN=
```

## ディレクトリ構造

```
src/
├── app/api/line/webhook/     # LINE webhook endpoint
├── domains/                  # ドメインモジュール
│   ├── goal-setting/
│   ├── workout-planning/
│   ├── workout-execution/
│   └── health-consultation/
├── server/                   # アプリケーション層
│   ├── event-mediator/
│   ├── session-manager/
│   ├── prompt-manager/
│   └── ui-manager/
├── lib/                      # インフラストラクチャ
│   ├── supabase/
│   ├── line/
│   └── llm/
└── types/                    # 型定義
```

## 開発状況

現在、このプロジェクトは仕様段階にあります。詳細なドキュメントに基づいて実装が進められる予定です。

## ドキュメント

- [アーキテクチャ詳細](./ARCHITECTURE.md)
- [要件定義書](./LINEフィットネスBOT要件定義書.md)
- [Claude開発ガイド](./CLAUDE.md)
- [仕様書](./spec/)

## ライセンス

MIT License

## 貢献

このプロジェクトへの貢献を歓迎します。プルリクエストを送信する前に、コーディング規約とテストガイドラインを確認してください。 