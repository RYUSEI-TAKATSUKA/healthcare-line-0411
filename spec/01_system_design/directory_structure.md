# ディレクトリ構成

本ドキュメントでは、アーキテクチャ設計書 (`ARCHITECTURE.md`) に基づくディレクトリ構成を定義します。

---

## 1. ルート構成

```
/
├─ src/                      # ソースコード
├─ prisma/                   # Prisma関連 (スキーマ・マイグレーション)
├─ spec/                     # 仕様ドキュメント
├─ tests/                    # テストコード
├─ .github/                  # GitHub Actions CI/CD設定
├─ .eslintrc.js              # ESLint設定
├─ .prettierrc               # Prettier設定
├─ .env.example              # 環境変数テンプレート
└─ package.json              # 依存関係・スクリプト定義
```

## 2. src ディレクトリ詳細 (レイヤー化アーキテクチャ)

`src/` 以下は、ドメイン駆動設計(DDD)とクリーンアーキテクチャの概念に基づいて階層化されています。

```
src/
├─ app/                        # [Interface Layer] Next.js App Router
│  ├─ api/                     # API Routes
│  │  └─ line/
│  │     └─ webhook/
│  │        └─ route.ts        # LINE Webhook エンドポイント
│  └─ admin/                   # 管理画面 (必要に応じて)
│
├─ application/                # [Application Layer] アプリケーションロジック
│  ├─ mediator/                # イベント調停 (EventMediator)
│  ├─ session/                 # セッション管理 (SessionManager)
│  ├─ usecases/                # ユースケース実装
│  └─ ui/                      # UI構築ロジック (Flex Message Builder等)
│
├─ domains/                    # [Domain Layer] 純粋なビジネスロジック
│  ├─ shared/                  # ドメイン共通定義 (ValueObjects等)
│  ├─ goal-setting/            # 目標設定ドメイン
│  ├─ workout-planning/        # トレーニング計画ドメイン
│  ├─ workout-execution/       # トレーニング実行・記録ドメイン
│  └─ health-consultation/     # 健康相談ドメイン
│
├─ infrastructure/             # [Infrastructure Layer] 外部アクセス実装
│  ├─ supabase/                # Supabase (DB) リポジトリ実装
│  ├─ line/                    # LINE Messaging API クライアント実装
│  └─ openai/                  # OpenAI/LLM クライアント実装
│
├─ types/                      # アプリケーション全体で共有する型定義
│  ├─ env.d.ts                 # 環境変数型
│  └─ ...
│
└─ lib/                        # 汎用ユーティリティ (外部依存を持たないヘルパー)
   ├─ date/                    # 日付操作
   └─ string/                  # 文字列操作
```

## 3. ドメインディレクトリ構造例

各ドメインは自己完結的なモジュールとして構成されます。

```
domains/goal-setting/
├─ index.ts                    # 公開インターフェース (Public API)
├─ models/                     # ドメインモデル (Entity, ValueObject)
│  ├─ goal.ts
│  └─ target-metrics.ts
├─ services/                   # ドメインサービス
│  └─ goal-generator.ts        # 目標生成ロジック
├─ repositories/               # リポジトリインターフェース
│  └─ goal-repository-interface.ts
└─ prompts/                    # LLMプロンプト定義
   └─ goal-setting-prompt.ts
```

## 4. Infrastructure ディレクトリ構造例

インフラ層は、ドメイン層で定義されたインターフェースの実装を提供します。

```
infrastructure/
├─ supabase/
│  ├─ client.ts                # Supabaseクライアント初期化
│  └─ repositories/
│     └─ supabase-goal-repository.ts # GoalRepositoryの実装
├─ line/
│  └─ adapter.ts               # LINE APIアダプター
└─ openai/
   └─ adapter.ts               # OpenAI APIアダプター
```

---

## 5. 命名規則

- **ディレクトリ**: ケバブケース (`goal-setting`)
- **ファイル名**: ケバブケース (`goal-service.ts`)
- **クラス名**: パスカルケース (`GoalService`)
- **インターフェース**: `I` プレフィックスは使用しない。実装クラスには `Impl` や `Supabase` 等の具体名を付与する。
  - 例: `GoalRepository` (Interface) -> `SupabaseGoalRepository` (Class)

---

## 更新履歴
- 2024-04-11: 初版作成
- 2025-11-22: アーキテクチャ刷新に伴いレイヤー構造を明確化 (Application, Infrastructure層の導入)
