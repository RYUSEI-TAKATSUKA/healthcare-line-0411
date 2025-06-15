# ディレクトリ構成

本ドキュメントではLINEフィットネスBOTのディレクトリ構成と、各ディレクトリの役割を説明します。

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

## 2. src ディレクトリ詳細
```
src/
├─ app/                      # Next.js App Router
│  ├─ api/                   # API Routes
│  │  └─ line/
│  │     └─ webhook/
│  │        └─ route.ts      # LINE Webhook エンドポイント
│  └─ admin/                 # 管理画面 (必要に応じて)
├─ components/               # 共有UIコンポーネント
├─ domains/                  # ドメインロジック
│  ├─ goal-setting/          # 目標設定ドメイン
│  ├─ workout-planning/      # トレーニング計画ドメイン
│  ├─ workout-execution/     # トレーニング実行・記録ドメイン
│  └─ health-consultation/   # 健康相談ドメイン
├─ lib/                      # ユーティリティ
│  ├─ supabase/              # Supabase連携
│  ├─ line/                  # LINE Messaging API 連携
│  └─ llm/                   # LLM連携 (OpenAI/Claude/Gemini)
├─ server/                   # サーバーサイドロジック
│  ├─ event-mediator/        # イベント調停者
│  ├─ session-manager/       # セッション管理
│  ├─ prompt-manager/        # プロンプト管理
│  └─ ui-manager/            # UI管理
├─ types/                    # 型定義
│  ├─ line.ts                # LINE関連型定義
│  ├─ supabase.ts            # DB型定義
│  └─ domain.ts              # ドメインモデル型定義
└─ utils/                    # 汎用ユーティリティ関数
```

## 3. prisma ディレクトリ
```
prisma/
├─ schema.prisma            # Prismaスキーマ定義
└─ migrations/              # マイグレーションファイル
```

## 4. tests ディレクトリ
```
tests/
├─ unit/                    # ユニットテスト
├─ integration/             # 統合テスト
└─ e2e/                     # E2Eテスト
```

## 5. ドメインディレクトリ構造例
ドメインディレクトリ（例：goal-setting）の詳細構造例:
```
domains/goal-setting/
├─ index.ts                # 公開インターフェース
├─ types.ts                # ドメイン固有型定義
├─ service.ts              # サービスレイヤー
├─ repository.ts           # データアクセスレイヤー
├─ handlers/               # イベントハンドラー
│  ├─ goal-create.ts       # 目標作成ハンドラ
│  └─ goal-update.ts       # 目標更新ハンドラ
├─ prompts/                # LLMプロンプトテンプレート
│  ├─ goal-suggestion.ts   # 目標提案プロンプト
│  └─ goal-validation.ts   # 目標検証プロンプト
└─ messages/               # メッセージテンプレート
   ├─ goal-created.ts      # 目標作成完了メッセージ
   └─ goal-progress.ts     # 目標進捗メッセージ
```

---

## 6. 命名規則
- **ファイル名**: ケバブケース (`goal-setting.ts`)
- **クラス名**: パスカルケース (`GoalSettingService`)
- **関数/変数名**: キャメルケース (`createGoal`)
- **定数**: スネークケース大文字 (`MAX_GOALS_PER_USER`)
- **コンポーネント**: パスカルケース (`GoalProgress.tsx`)

---

> **更新履歴**
> - 2024-04-11: 初版作成 