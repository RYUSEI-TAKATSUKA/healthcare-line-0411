# Repository Guidelines for AI Agents

## プロジェクト概要

**LINEフィットネスBOT** - LINE Messaging APIを活用したAI駆動のパーソナルヘルスケアアシスタント

### 主要機能（6つ）
1. **目標設定 (Goal Setting)**: 対話的な目標設定プロセス
2. **トレーニング計画 (Training Plan)**: 目標に基づくプラン作成・管理
3. **記録・進捗 (Record Progress)**: トレーニング実績と身体測定値の記録
4. **健康相談 (Health Consultation)**: AI（LLM）による健康・フィットネス相談
5. **今日のタスク (Today's Tasks)**: 当日のトレーニング表示とリマインド
6. **マイページ (MyPage)**: ユーザー情報・設定管理

### 主要ドメイン（4つ）
- `health-consultation/` - 健康相談
- `goal-setting/` - 目標設定
- `workout-planning/` - トレーニング計画
- `workout-execution/` - トレーニング実行・記録

---

## Project Structure & Module Organization

### レイヤー構造（DDD + クリーンアーキテクチャ）
```
Interface Layer    → src/app/api/line/webhook/
Application Layer  → src/application/ (EventMediator, SessionManager)
Domain Layer       → src/domains/* (純粋なビジネスロジック)
Infrastructure     → src/infrastructure/ (LINE, OpenAI, Supabase)
```

### 仕様ドキュメント
- **必読**: 実装前に必ず `spec/` ディレクトリの該当ドキュメントを確認してください
  - `spec/00_requirements/requirements.md` - 要件定義
  - `spec/01_system_design/architecture.md` - アーキテクチャ設計
  - `spec/02_data_model/database_design.md` - データベース設計（15テーブル）
  - `spec/03_interface/api_spec.md` - API仕様
  - `spec/04_workflows/*.md` - 各機能のワークフロー詳細

### ドメインモジュール構成
各ドメインは以下のパターンで構成されます：
```
domains/<domain>/
├── index.ts              # 公開API
├── types.ts              # ドメイン型定義
├── models/               # Entity, ValueObject
├── services/             # ビジネスロジック
├── repositories/         # リポジトリインターフェース
├── handlers/             # イベントハンドラー
├── prompts/              # LLMプロンプトテンプレート
└── messages/             # LINEメッセージテンプレート
```

## Technology Stack

**重要**: 以下のバージョンは変更しないでください。変更が必要な場合は必ず承認を得てください。

### Core
- **Runtime**: Node.js 18.x, TypeScript 5.2.x
- **Package Manager**: pnpm 8.x
- **Framework**: Next.js 13.5.x (App Router)

### Database & ORM
- **Database**: Supabase (PostgreSQL 14+)
- **ORM**: Prisma
- **Security**: RLS (Row Level Security) で user_id ベースのアクセス制御

### External APIs
- **Messaging**: LINE Messaging API v2
- **AI/LLM**: OpenAI (gpt-4o-mini), Anthropic Claude, Google Gemini
- **Infrastructure**: Vercel (Hosting), Supabase (BaaS)

### Key Data Tables (15 tables)
`users`, `goals`, `training_plans`, `workout_sessions`, `workout_records`, `physical_stats`, `consultations`, `user_sessions`, `achievements`, `user_achievements`, `task_reminders`, `conversation_history`, `api_keys`, `llm_models`, `settings`, `system_logs`

詳細は `technologystack.md` と `spec/02_data_model/database_design.md` を参照。

---

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (Node 18+, pnpm 8+).
- `pnpm run dev` / `pnpm run build` / `pnpm run start` — Next.js dev server, production build, and production start.
- `pnpm run lint` / `pnpm run type-check` — ESLint (Airbnb + Prettier) and TypeScript type checks.
- `pnpm run test:unit` / `pnpm run test:integration` / `pnpm run test:e2e` — Jest unit/integration and Playwright E2E suites.
- `pnpm run db:migrate` / `pnpm run db:seed` — Prisma migrations and seed data (keep in sync with Supabase RLS policies).

## Coding Style & Naming Conventions
- TypeScript, Next.js 13 App Router; prefer functional components and server components where applicable.
- Formatting enforced by ESLint + Prettier; 2-space indentation, single quotes, and semicolons.
- Naming: files in kebab-case, classes in PascalCase, functions/variables in camelCase, constants in SCREAMING_SNAKE_CASE.
- Event-driven + DDD: Interface → Application → Domain → Infrastructure. Keep cross-layer imports one direction (downward) and avoid domain-to-domain coupling.

## Testing Guidelines
- Target 80%+ coverage on core logic. Mock LLM providers and external APIs in Jest; use fixtures for LINE payloads.
- Prefer co-located tests (`*.spec.ts` / `*.test.ts`) in the module or a nearby `__tests__/` directory; mirror domain structure.
- Playwright E2E: stub outbound calls (LINE, LLM, Supabase) and run against built assets when possible.

### テストファイル配置
- **ユニットテスト**: `tests/unit/` または対象ファイルと同ディレクトリ
- **インテグレーション**: `tests/integration/`
- **E2E**: `tests/e2e/`
- **フィクスチャ**: `tests/fixtures/` (LINE イベント例、LLM レスポンス例)

## Commit & Pull Request Guidelines
- Commits in imperative mood (e.g., "Add goal session handler"); keep scope focused and include rationale in the body when needed.
- PRs should include: summary of behavior change, linked issue/requirement, test results (`pnpm run test:*`, lint/type-check), and screenshots or sample payloads for UI/message changes.
- Update relevant specs in `spec/` and note architecture or workflow impacts.

## Security & Configuration Tips
- Store secrets (LINE tokens, LLM keys, Supabase keys) in `.env.local`; never commit them. Rotate keys after leaks or sandbox use.
- Respect Supabase RLS; enforce user scoping in repositories and avoid bypassing policies with service keys in app code.
- Validate and sanitize user inputs from LINE; log without storing PII where not required.

### 必須環境変数
```bash
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
OPENAI_API_KEY=
```

詳細は `spec/01_system_design/environment.md` を参照。

---

## Implementation Guidelines

### 重複実装の防止（必須）
**実装前に以下を必ず確認してください**:
1. **既存機能の確認**: `grep` や `codebase_search` で類似機能を検索
2. **同名チェック**: 同じ名前の関数・コンポーネントが存在しないか確認
3. **共通化検討**: 共通処理は `lib/` または `domains/shared/` に配置
4. **仕様確認**: `spec/` ディレクトリで要件と設計を確認

### 実装手順
1. **仕様確認**: 該当する `spec/` ドキュメントを読む
2. **既存コード調査**: 類似実装や再利用可能なコードを探す
3. **レイヤー判断**: どのレイヤーに実装すべきか判断
4. **テスト駆動**: 可能であればテストを先に書く
5. **実装**: コーディング規約に従って実装
6. **検証**: Lint、型チェック、テスト実行

### 実装判断フローチャート
```
新機能の実装が必要？
  ↓
  [1] spec/ でワークフローと要件を確認
  ↓
  [2] 既存コードに類似機能がないか検索
  ↓
  [3] どのレイヤーに属するか判断
      - Webhook処理 → Interface Layer
      - ビジネスロジック → Domain Layer
      - 外部API連携 → Infrastructure Layer
      - アプリケーション制御 → Application Layer
  ↓
  [4] 該当ドメインのディレクトリ構造に従って実装
  ↓
  [5] テスト作成・実行
```

## Architecture Reminders for Agents

### イベント駆動フロー
```
LINE Webhook 受信
  ↓
EventMediator (イベント振り分け)
  ↓
SessionManager (ユーザー状態取得: current_flow, current_step)
  ↓
Domain Handler (ビジネスロジック実行)
  ↓
AI Adapter (LLMによる応答生成)
  ↓
Repository (データ永続化)
  ↓
LINE Response (メッセージ返信)
```

### 重要な設計原則
1. **ステートレス**: 各リクエストでセッションをDBから復元し、処理後に保存
2. **イベント駆動**: すべてのユーザーアクションはイベントとして処理
3. **セッション管理**: `user_sessions` テーブルで会話状態を管理（フロー、ステップ、一時データ）
4. **ドメイン独立性**: ドメインロジックは外部技術（LINE, DB, LLM）に直接依存しない
5. **プロンプト管理**: 各ドメインの `prompts/` ディレクトリで管理、バージョニング
6. **エラーハンドリング**: LLM失敗時のフォールバック応答を必ず用意
7. **冪等性**: リトライに備え、ハンドラーは冪等に設計

### セッション状態の例
```json
{
  "user_id": "uuid",
  "current_flow": "goal_setting",
  "current_step": "collect_weight",
  "temp_data": {
    "age": 30,
    "gender": "female",
    "height_cm": 165
  },
  "last_active_at": "2025-11-23T10:00:00Z"
}
```

### 主要コンポーネントの責務
- **EventMediator**: Webhookイベントのルーティング、エラー時のフォールバック
- **SessionManager**: ユーザー状態の読み込み・保存・クリア
- **Domain Services**: 純粋なビジネスロジック（目標生成、プラン作成など）
- **AI Adapter**: LLMプロバイダーとのやり取りを抽象化、プロンプト実行
- **Repositories**: データアクセスの抽象化（インターフェース定義はDomain層）

### ワークフロー詳細
各機能の詳細なフローは `spec/04_workflows/` を参照：
- `goal-setting.md` - 目標設定の段階的プロセス
- `training-plan.md` - トレーニング計画作成フロー
- `record-progress.md` - 実績記録と進捗確認
- `health-consultation.md` - AI相談の対話フロー
- `todays-tasks.md` - 当日タスク表示とリマインド
- `mypage.md` - ユーザー設定管理

---

## Reference Documents

### 必読ドキュメント
- **`technologystack.md`**: 技術スタック詳細・プロジェクト概要
- **`directorystructure.md`**: ディレクトリ構成・命名規則・レイヤー構造

### 仕様ドキュメント (`spec/`)
- **要件定義**: `spec/00_requirements/requirements.md`
- **アーキテクチャ**: `spec/01_system_design/architecture.md`
- **ディレクトリ構造**: `spec/01_system_design/directory_structure.md`
- **環境設定**: `spec/01_system_design/environment.md`
- **エラーハンドリング**: `spec/01_system_design/error_handling.md`
- **テスト・CI**: `spec/01_system_design/test_ci.md`
- **データベース**: `spec/02_data_model/database_design.md`
- **API仕様**: `spec/03_interface/api_spec.md`
- **LINEメッセージ**: `spec/03_interface/line_message_spec.md`
- **ワークフロー**: `spec/04_workflows/*.md` (各機能の詳細フロー)

---

## 出力言語

**出力は日本語で。**

実装時のコメント、変数名、関数名は英語を使用しますが、ユーザーへの説明や報告は日本語で行ってください。