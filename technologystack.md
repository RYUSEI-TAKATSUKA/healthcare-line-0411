# 技術スタック

本ドキュメントでは、LINEフィットネスBOTプロジェクトで使用する技術スタックの詳細を定義します。

---

## 1. プロジェクト概要

**LINEフィットネスBOT**は、LINEプラットフォーム上で動作するAI駆動のパーソナルヘルスケアアシスタントです。

### 主要機能
1. **目標設定**: ユーザーの健康・フィットネス目標を対話的に設定
2. **トレーニング計画**: 目標に基づいたカスタマイズされたトレーニングプラン作成
3. **記録・進捗**: トレーニング実績と身体測定値の記録・可視化
4. **健康相談**: AI（LLM）を活用した健康・フィットネスに関する質問応答
5. **今日のタスク**: 当日実施すべきトレーニングの表示とリマインド
6. **マイページ**: ユーザー情報・設定の管理

### ターゲットユーザー
- フィットネス習慣の形成・維持に興味がある方
- 手軽に健康管理をしたい働き盛りの社会人
- フィットネス初心者から中級者

---

## 2. コアランタイム

| 項目 | バージョン | 説明 |
|------|-----------|------|
| **Node.js** | `18.x` (推奨: v18.16.0以上) | JavaScriptランタイム環境 |
| **TypeScript** | `5.2.x` | 静的型付けによる開発効率・品質向上 |
| **パッケージマネージャ** | `pnpm 8.x` | 高速で効率的な依存関係管理 |

**重要**: これらのバージョンは変更しないでください。変更が必要な場合は必ず承認を得てください。

---

## 3. フレームワーク & ライブラリ

### 3.1 アプリケーションフレームワーク

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Next.js** | `13.5.x` (App Router) | フルスタックReactフレームワーク、API Routes提供 |
| **React** | `18.2.x` | UI構築（管理画面用、オプション） |

### 3.2 データベース & ORM

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Supabase** | Latest | PostgreSQL 14+ をベースとしたBaaS、認証・RLS提供 |
| **Prisma** | Latest | タイプセーフなORM、マイグレーション管理 |
| **PostgreSQL** | `14+` | リレーショナルデータベース（Supabase経由） |

**データベース名**: `line_fitness_bot_db`  
**文字セット**: UTF-8  
**タイムゾーン**: Asia/Tokyo

### 3.3 外部API連携

#### LINE Platform
| API | バージョン | 用途 |
|-----|-----------|------|
| **LINE Messaging API** | v2 | Webhook受信、メッセージ送信、リッチメニュー管理 |
| **LINE Bot SDK** | Latest | LINE APIクライアント実装 |

#### AI/LLM プロバイダー
| プロバイダー | モデル例 | 用途 |
|-------------|---------|------|
| **OpenAI** | `gpt-4o-mini`, `gpt-4o` | 目標設定、健康相談、プラン生成 |
| **Anthropic Claude** | `claude-3-sonnet` | 代替LLMオプション |
| **Google Gemini** | `gemini-ultra-1.0` | 代替LLMオプション |

**主要用途**:
- 自然言語による意図理解
- 構造化データ抽出（Function Calling）
- パーソナライズされたアドバイス生成

### 3.4 開発ツール

| ツール | 用途 |
|--------|------|
| **ESLint** | コード品質チェック（Airbnb + Prettier設定） |
| **Prettier** | コードフォーマッター |
| **Husky** | Gitフック管理（コミット前チェック） |
| **lint-staged** | ステージングファイルのLint |
| **Jest** | ユニット・インテグレーションテスト |
| **Playwright** | E2Eテスト |

---

## 4. アーキテクチャパターン

### 4.1 設計思想
- **ドメイン駆動設計 (DDD)**: ビジネスロジックを技術的関心事から分離
- **イベント駆動アーキテクチャ (EDA)**: LINEの非同期特性に対応
- **レイヤードアーキテクチャ**: Interface → Application → Domain → Infrastructure

### 4.2 主要レイヤー

```
Interface Layer (src/app/api/line/webhook)
    ↓
Application Layer (src/application)
  - EventMediator: イベントルーティング
  - SessionManager: ユーザーセッション管理
    ↓
Domain Layer (src/domains)
  - health-consultation: 健康相談ドメイン
  - goal-setting: 目標設定ドメイン
  - workout-planning: トレーニング計画ドメイン
  - workout-execution: トレーニング実行・記録ドメイン
    ↓
Infrastructure Layer (src/infrastructure)
  - line: LINE APIアダプター
  - openai: LLM APIアダプター
  - supabase: データベースリポジトリ
```

### 4.3 主要コンポーネント

| コンポーネント | 責務 |
|--------------|------|
| **EventMediator** | Webhookイベントを適切なドメインハンドラーに振り分け |
| **SessionManager** | ユーザーのフロー状態（目標設定中、相談中など）を管理 |
| **Domain Services** | 各機能の純粋なビジネスロジック |
| **AI Adapter** | LLMプロバイダーとのやり取りを抽象化 |
| **Prompt Manager** | ドメイン別のプロンプトテンプレート管理 |

---

## 5. データモデル概要

### 5.1 主要テーブル（15テーブル）

| テーブル | 説明 | 想定レコード数 |
|---------|------|---------------|
| `users` | ユーザー基本情報 | 〜100万 |
| `goals` | フィットネス目標 | 〜300万 |
| `training_plans` | トレーニング計画 | 〜300万 |
| `workout_sessions` | 個別セッション | 〜1000万 |
| `workout_records` | 実施記録 | 〜1000万 |
| `physical_stats` | 身体測定値 | 〜3000万 |
| `consultations` | 健康相談履歴 | 〜500万 |
| `user_sessions` | セッション状態管理 | ユーザー数と同等 |
| `achievements` | アチーブメント定義 | 〜100 |
| `user_achievements` | 獲得バッジ | 〜1000万 |
| `task_reminders` | リマインド設定 | 〜1000万 |
| `conversation_history` | LLM会話履歴 | 〜5000万 |
| `api_keys` | 外部APIキー管理 | 〜10 |
| `llm_models` | LLMモデル定義 | 〜10 |
| `settings`, `system_logs` | システム設定・ログ | 可変 |

### 5.2 セキュリティ
- **RLS (Row Level Security)**: Supabaseの行レベルセキュリティで`user_id`ベースのアクセス制御
- **暗号化**: APIキー等の機密情報は暗号化保存
- **認証**: LINE User IDと内部UUIDの紐付けで匿名性確保

---

## 6. インフラ & デプロイ

| 項目 | 技術/サービス | 説明 |
|------|-------------|------|
| **ホスティング** | Vercel | Next.js最適化、グローバルCDN、サーバーレス関数 |
| **データベース** | Supabase | マネージドPostgreSQL、自動バックアップ |
| **CI/CD** | GitHub Actions | 自動テスト、ビルド、デプロイ |
| **監視** | Sentry (予定) | エラートラッキング、パフォーマンス監視 |

---

## 7. 環境変数

`.env.local`に以下を設定（詳細は`spec/01_system_design/environment.md`参照）：

```bash
# LINE API
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# OpenAI
OPENAI_API_KEY=

# Anthropic Claude (オプション)
ANTHROPIC_API_KEY=

# Google Gemini (オプション)
GOOGLE_OAUTH_TOKEN=
```

**重要**: これらの秘密情報は絶対にコミットしないでください。

---

## 8. コーディング規約

### 8.1 命名規則
- **ファイル名**: kebab-case (`goal-setting.ts`)
- **クラス名**: PascalCase (`GoalService`)
- **関数・変数**: camelCase (`getUserGoals`)
- **定数**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)

### 8.2 フォーマット
- インデント: 2スペース
- 引用符: シングルクォート
- セミコロン: 必須
- ESLint + Prettier で自動整形

### 8.3 レイヤー間依存
- **下向き依存のみ**: Interface → Application → Domain → Infrastructure
- **ドメイン間の直接依存禁止**: 共有ロジックは`domains/shared/`へ

---

## 9. テスト戦略

| テストタイプ | ツール | カバレッジ目標 | 対象 |
|------------|--------|-------------|------|
| **ユニット** | Jest | 80%+ | ドメインロジック、ユーティリティ |
| **インテグレーション** | Jest | 主要フロー | API Routes、Repository |
| **E2E** | Playwright | 主要ユーザーフロー | Webhook → 応答の全体フロー |

**モック方針**:
- LLM APIはフィクスチャで固定応答
- LINE APIはスタブ化
- Supabaseはテスト用DB使用

---

## 10. パフォーマンス要件

| 指標 | 目標値 | 説明 |
|------|--------|------|
| **通常操作応答** | 2秒以内 | メニュー操作、記録保存など |
| **AI生成応答** | 10秒以内（開始） | ストリーミングまたはローディング表示 |
| **可用性** | 99.9% | LINEプラットフォームの稼働に依存 |
| **同時接続** | 1000+ | Vercel Serverless Functionsでスケール |

---

## 11. 今後のロードマップ

### MVP後の拡張予定
1. **LIFF (LINE Front-end Framework)**: 複雑な入力フォーム（カレンダー、グラフ）
2. **RAG (Retrieval-Augmented Generation)**: 専門知識に基づく回答強化
3. **ウェアラブルデバイス連携**: Apple Health、Google Fit
4. **画像解析**: 食事写真からの栄養計算
5. **Redis キャッシング**: セッションデータの高速アクセス

---

## 12. 参考ドキュメント

プロジェクトの詳細仕様は`spec/`ディレクトリを参照してください：

- [要件定義](spec/00_requirements/requirements.md)
- [アーキテクチャ設計](spec/01_system_design/architecture.md)
- [ディレクトリ構成](spec/01_system_design/directory_structure.md)
- [データベース設計](spec/02_data_model/database_design.md)
- [API仕様](spec/03_interface/api_spec.md)
- [LINE メッセージ仕様](spec/03_interface/line_message_spec.md)
- [ワークフロー詳細](spec/04_workflows/)

---

> **更新履歴**
> - 2025-11-23: 初版作成（AIエージェント向けプロジェクト技術スタック定義）

