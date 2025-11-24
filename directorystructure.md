# ディレクトリ構成

本ドキュメントでは、LINEフィットネスBOTプロジェクトのディレクトリ構成とその責務を定義します。

---

## 1. 基本方針

本プロジェクトは**レイヤードアーキテクチャ**と**ドメイン駆動設計 (DDD)** を採用しています。

### レイヤー構造
```
Interface Layer (外部との入出力)
    ↓
Application Layer (アプリケーション制御)
    ↓
Domain Layer (純粋なビジネスロジック)
    ↓
Infrastructure Layer (外部サービスとの接続)
```

### 依存の方向
- **下向き依存のみ**: 上位レイヤーは下位レイヤーに依存可能、逆は不可
- **ドメイン層の独立性**: 外部技術（LINE API、DB等）に依存しない
- **ドメイン間の疎結合**: ドメイン同士の直接依存を避け、共有ロジックは`domains/shared/`へ

---

## 2. ルートディレクトリ構成

```
/
├── src/                        # ソースコード（メイン実装）
├── spec/                       # 仕様ドキュメント
├── tests/                      # テストコード
├── prisma/                     # Prismaスキーマ・マイグレーション
├── .github/                    # GitHub Actions CI/CD設定
├── .env.local                  # 環境変数（Gitignore対象）
├── .env.example                # 環境変数テンプレート
├── .eslintrc.js                # ESLint設定
├── .prettierrc                 # Prettier設定
├── package.json                # 依存関係・スクリプト
├── tsconfig.json               # TypeScript設定
├── AGENTS.md                   # AIエージェント向けガイドライン
├── technologystack.md          # 技術スタック詳細
├── directorystructure.md       # 本ドキュメント
└── README.md                   # プロジェクト概要
```

---

## 3. `src/` ディレクトリ詳細

### 3.1 全体構成

```
src/
├── app/                        # [Interface Layer] Next.js App Router
│   ├── api/                    # API Routes
│   │   └── line/
│   │       └── webhook/
│   │           └── route.ts    # LINE Webhook エントリーポイント
│   └── admin/                  # 管理画面（オプション）
│
├── application/                # [Application Layer] アプリケーション制御
│   ├── mediator/               # イベント調停
│   │   ├── event-mediator.ts  # EventMediator実装
│   │   └── event-router.ts    # イベントルーティングロジック
│   ├── session/                # セッション管理
│   │   ├── session-manager.ts # SessionManager実装
│   │   └── session-store.ts   # セッションストアインターフェース
│   ├── usecases/               # ユースケース実装
│   │   ├── goal-setting-usecase.ts
│   │   ├── workout-planning-usecase.ts
│   │   └── ...
│   └── ui/                     # UI構築ロジック
│       ├── flex-message-builder.ts  # Flex Message構築
│       ├── quick-reply-factory.ts   # Quick Reply生成
│       └── rich-menu-manager.ts     # Rich Menu管理
│
├── domains/                    # [Domain Layer] ビジネスロジック
│   ├── shared/                 # ドメイン共通
│   │   ├── value-objects/      # 共通値オブジェクト
│   │   └── types.ts            # 共通型定義
│   ├── health-consultation/    # 健康相談ドメイン
│   ├── goal-setting/           # 目標設定ドメイン
│   ├── workout-planning/       # トレーニング計画ドメイン
│   └── workout-execution/      # トレーニング実行ドメイン
│
├── infrastructure/             # [Infrastructure Layer] 外部接続
│   ├── supabase/               # Supabase (DB)
│   │   ├── client.ts           # Supabaseクライアント初期化
│   │   └── repositories/       # リポジトリ実装
│   │       ├── user-repository.ts
│   │       ├── goal-repository.ts
│   │       └── ...
│   ├── line/                   # LINE API
│   │   ├── client.ts           # LINE Messaging APIクライアント
│   │   ├── webhook-validator.ts # Webhook署名検証
│   │   └── message-sender.ts   # メッセージ送信ヘルパー
│   └── openai/                 # OpenAI (LLM)
│       ├── client.ts           # OpenAIクライアント
│       ├── prompt-executor.ts  # プロンプト実行
│       └── function-calling.ts # Function Calling実装
│
├── types/                      # アプリケーション全体の型定義
│   ├── env.d.ts                # 環境変数型
│   ├── line.d.ts               # LINE関連型
│   └── domain.d.ts             # ドメイン横断型
│
└── lib/                        # 汎用ユーティリティ
    ├── date/                   # 日付操作
    ├── string/                 # 文字列操作
    ├── validation/             # バリデーション
    └── logger.ts               # ロガー
```

---

## 4. ドメインディレクトリ構造（詳細）

各ドメインは自己完結的なモジュールとして、以下のパターンで構成されます。

### 4.1 テンプレート構造

```
domains/<domain-name>/
├── index.ts                    # 公開API（外部に公開する関数・型のみエクスポート）
├── types.ts                    # ドメイン固有の型定義
├── models/                     # ドメインモデル（Entity, ValueObject）
│   ├── <entity>.ts
│   └── <value-object>.ts
├── services/                   # ドメインサービス（ビジネスロジック）
│   └── <domain>-service.ts
├── repositories/               # リポジトリインターフェース
│   └── <domain>-repository-interface.ts
├── handlers/                   # イベントハンドラー（Application層から呼ばれる）
│   ├── <action>-handler.ts
│   └── ...
├── prompts/                    # LLMプロンプトテンプレート
│   ├── <prompt-name>.ts
│   └── ...
└── messages/                   # LINE メッセージテンプレート
    ├── <message-name>.ts
    └── ...
```

### 4.2 実例: `goal-setting/`

```
domains/goal-setting/
├── index.ts                    # startGoalSetting, validateGoal等をエクスポート
├── types.ts                    # Goal, GoalType, GoalStatus等の型定義
├── models/
│   ├── goal.ts                 # Goalエンティティ
│   └── target-metrics.ts       # TargetMetrics値オブジェクト
├── services/
│   └── goal-generator.ts       # 目標生成ロジック（LLMとの連携）
├── repositories/
│   └── goal-repository-interface.ts  # GoalRepositoryインターフェース
├── handlers/
│   ├── start-goal-setting-handler.ts  # 目標設定開始
│   ├── collect-info-handler.ts        # 情報収集
│   └── confirm-goal-handler.ts        # 目標確認・保存
├── prompts/
│   ├── goal-extraction-prompt.ts      # 目標抽出プロンプト
│   └── goal-suggestion-prompt.ts      # 目標提案プロンプト
└── messages/
    ├── welcome-message.ts             # ウェルカムメッセージ
    └── confirmation-message.ts        # 確認メッセージ
```

### 4.3 主要ドメイン一覧

| ドメイン | 責務 | 主要エンティティ |
|---------|------|-----------------|
| **health-consultation** | 健康相談の処理、アドバイス生成 | `Consultation` |
| **goal-setting** | 目標設定プロセスの管理 | `Goal`, `TargetMetrics` |
| **workout-planning** | トレーニング計画の作成・管理 | `TrainingPlan`, `WorkoutSession` |
| **workout-execution** | トレーニング実行・記録 | `WorkoutRecord`, `PhysicalStats` |
| **shared** | ドメイン共通のロジック・型 | 各種ValueObject |

---

## 5. `infrastructure/` レイヤー詳細

インフラ層は、ドメイン層で定義されたインターフェースの具体的な実装を提供します。

### 5.1 Supabase（データベース）

```
infrastructure/supabase/
├── client.ts                   # Supabaseクライアント初期化
├── repositories/
│   ├── supabase-user-repository.ts        # UserRepository実装
│   ├── supabase-goal-repository.ts        # GoalRepository実装
│   ├── supabase-training-plan-repository.ts
│   ├── supabase-workout-record-repository.ts
│   └── ...
└── migrations/                 # Prismaマイグレーションファイルへの参照
```

**命名規則**: `Supabase<Entity>Repository` - インターフェースと実装を区別

### 5.2 LINE（メッセージング）

```
infrastructure/line/
├── client.ts                   # LINE Messaging APIクライアント
├── webhook-validator.ts        # Webhook署名検証
├── message-sender.ts           # メッセージ送信（Reply/Push）
└── rich-menu-client.ts         # Rich Menu操作
```

### 5.3 OpenAI（LLM）

```
infrastructure/openai/
├── client.ts                   # OpenAIクライアント初期化
├── prompt-executor.ts          # プロンプト実行・レスポンス取得
├── function-calling.ts         # Function Calling実装
└── stream-handler.ts           # ストリーミングレスポンス処理
```

---

## 6. `application/` レイヤー詳細

### 6.1 EventMediator（イベント調停者）

```
application/mediator/
├── event-mediator.ts           # メインのイベント調停クラス
├── event-router.ts             # イベントタイプに応じたルーティング
└── event-logger.ts             # イベントログ記録
```

**責務**:
- Webhookイベントを受け取り、現在のセッション状態を確認
- 適切なドメインハンドラーに処理を委譲
- エラー時のフォールバック処理

### 6.2 SessionManager（セッション管理）

```
application/session/
├── session-manager.ts          # セッション管理メインクラス
├── session-store.ts            # セッションストアインターフェース
└── session-serializer.ts       # セッションのシリアライズ/デシリアライズ
```

**責務**:
- ユーザーの会話状態（フロー、ステップ、一時データ）を管理
- `loadSession(userId)`: DBから状態を復元
- `saveSession(userId, state)`: 状態を永続化
- `clearSession(userId)`: フロー完了時の状態リセット

### 6.3 UI Builders

```
application/ui/
├── flex-message-builder.ts     # Flex Message構築
├── quick-reply-factory.ts      # Quick Reply生成
├── rich-menu-manager.ts        # Rich Menu管理
└── carousel-builder.ts         # カルーセル構築
```

---

## 7. `spec/` ディレクトリ（仕様ドキュメント）

```
spec/
├── 00_requirements/            # 要件定義
│   └── requirements.md
├── 01_system_design/           # システム設計
│   ├── architecture.md
│   ├── directory_structure.md
│   ├── environment.md
│   ├── error_handling.md
│   └── test_ci.md
├── 02_data_model/              # データモデル
│   └── database_design.md
├── 03_interface/               # インターフェース設計
│   ├── api_spec.md
│   └── line_message_spec.md
├── 04_workflows/               # ワークフロー詳細
│   ├── goal-setting.md
│   ├── training-plan.md
│   ├── record-progress.md
│   ├── health-consultation.md
│   ├── todays-tasks.md
│   └── mypage.md
├── archive/                    # 旧ドキュメント
└── README.md                   # ドキュメント体系説明
```

**重要**: コード実装の前に、必ず該当する`spec/`ドキュメントを確認してください。

---

## 8. `tests/` ディレクトリ

```
tests/
├── unit/                       # ユニットテスト
│   ├── domains/                # ドメインロジックテスト
│   │   ├── goal-setting/
│   │   ├── workout-planning/
│   │   └── ...
│   └── lib/                    # ユーティリティテスト
├── integration/                # インテグレーションテスト
│   ├── api/                    # API Routesテスト
│   └── repositories/           # リポジトリテスト
├── e2e/                        # E2Eテスト
│   ├── goal-setting.spec.ts
│   ├── training-plan.spec.ts
│   └── ...
├── fixtures/                   # テストデータ
│   ├── line-events.json        # LINE Webhookイベント例
│   ├── llm-responses.json      # LLMレスポンス例
│   └── ...
└── helpers/                    # テストヘルパー
    ├── setup.ts
    └── mock-factories.ts
```

---

## 9. `prisma/` ディレクトリ

```
prisma/
├── schema.prisma               # Prismaスキーマ定義
├── migrations/                 # マイグレーションファイル
│   ├── 20240411_init/
│   ├── 20240412_add_achievements/
│   └── ...
└── seed.ts                     # シードデータ投入スクリプト
```

---

## 10. 命名規則まとめ

| 対象 | 規則 | 例 |
|------|------|-----|
| **ディレクトリ** | kebab-case | `goal-setting/`, `workout-planning/` |
| **ファイル名** | kebab-case | `goal-service.ts`, `event-mediator.ts` |
| **クラス名** | PascalCase | `GoalService`, `EventMediator` |
| **関数・変数** | camelCase | `getUserGoals`, `currentSession` |
| **定数** | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| **インターフェース** | PascalCase（`I`プレフィックス不要） | `GoalRepository` |
| **実装クラス** | PascalCase（実装を示す接頭辞） | `SupabaseGoalRepository` |
| **型エイリアス** | PascalCase | `Goal`, `WorkoutSession` |

---

## 11. ファイル作成時の注意点

### 11.1 新規ドメイン作成時
1. `domains/<domain-name>/`ディレクトリを作成
2. 必須ファイル: `index.ts`, `types.ts`
3. 必要に応じて: `models/`, `services/`, `handlers/`, `prompts/`, `messages/`
4. `index.ts`で公開APIのみエクスポート（内部実装は隠蔽）

### 11.2 新規インフラ実装時
1. `infrastructure/<service-name>/`ディレクトリを作成
2. `client.ts`でクライアント初期化
3. ドメインのインターフェースを実装（例: `GoalRepository`を実装）

### 11.3 重複実装の防止
**実装前に必ず確認**:
- 類似機能が既に存在しないか（`grep`, `codebase_search`を活用）
- 同名または類似名の関数やコンポーネントがないか
- 共通化可能な処理は`lib/`または`domains/shared/`へ

---

## 12. レイヤー間のインポートルール

### ✅ 許可されるインポート

```typescript
// Interface → Application
import { EventMediator } from '@/application/mediator/event-mediator';

// Application → Domain
import { startGoalSetting } from '@/domains/goal-setting';

// Domain → なし（外部技術に依存しない）

// Infrastructure → Domain（インターフェースのみ）
import type { GoalRepository } from '@/domains/goal-setting/repositories/goal-repository-interface';
```

### ❌ 禁止されるインポート

```typescript
// Domain → Infrastructure（NG）
import { SupabaseClient } from '@/infrastructure/supabase/client';

// Domain → Application（NG）
import { SessionManager } from '@/application/session/session-manager';

// ドメイン間直接依存（NG）
// domains/goal-setting → domains/workout-planning
import { createPlan } from '@/domains/workout-planning';
```

**共有が必要な場合**: `domains/shared/`を経由

---

## 13. パス エイリアス設定

`tsconfig.json`で以下のエイリアスを設定済み:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/domains/*": ["./src/domains/*"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/types/*": ["./src/types/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

**使用例**:
```typescript
import { EventMediator } from '@/application/mediator/event-mediator';
import { Goal } from '@/domains/goal-setting/types';
```

---

## 14. よくある質問

### Q1: 新機能を追加する際、どこに実装すべき？
**A**: フローチャート
```
新機能はLINEからのWebhook処理？
  Yes → Interface Layer (src/app/api/line/webhook/route.ts)
  No ↓
  
新機能は純粋なビジネスロジック？
  Yes → Domain Layer (src/domains/<domain>/)
  No ↓
  
新機能は外部サービスとの連携？
  Yes → Infrastructure Layer (src/infrastructure/<service>/)
  No ↓
  
新機能はアプリケーション制御・調整？
  Yes → Application Layer (src/application/)
```

### Q2: ドメイン間で共通処理を使いたい場合は？
**A**: `domains/shared/`に配置し、各ドメインからインポート

### Q3: テストファイルはどこに配置？
**A**: 基本は`tests/`ディレクトリ。小規模なユニットテストは対象ファイルと同じディレクトリに`*.spec.ts`または`*.test.ts`として配置可能

---

> **更新履歴**
> - 2025-11-23: 初版作成（AIエージェント向けディレクトリ構成定義）

