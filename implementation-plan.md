# 開発実装TODOリスト

本ドキュメントは `spec/` で定義された要件と、`AGENTS.md` / `technologystack.md` / `directorystructure.md` を前提とした開発手順書です。フェーズごとに大項目を設け、各タスクをTODO形式で列挙しています。完了時はチェックボックスに✅を付け、対応する仕様書の更新も忘れずに行ってください。

---

## ✅ ドキュメント参照ルール（常に実行）
- [x] `spec/00_requirements/requirements.md` を参照して機能優先度を再確認
- [x] ドメイン毎の実装前に該当 `spec/04_workflows/*.md` を精読
- [x] コード変更時に `AGENTS.md` / `technologystack.md` / `directorystructure.md` との整合性を再チェック

---

## フェーズ0: 仕様・体制の確定
- [ ] 主要ドメイン担当者の割り当て（goal-setting / workout-planning / workout-execution / health-consultation）
- [ ] `spec/01_system_design/architecture.md` をもとに全体アーキテクチャのレビュー会を実施
- [ ] コーディング規約・命名規則の共有会（`directorystructure.md` 参照）
- [ ] ユーザーフロー優先順位を `spec/04_workflows/` から抽出してロードマップを更新

### 成果物
- 担当表
- 更新済みロードマップ

---

## フェーズ1: 基盤整備（インフラ & 共通コンポーネント）
1. **環境・設定**
   - [x] `.env.local` のテンプレート整備（`spec/01_system_design/environment.md`）
   - [ ] Supabase プロジェクト作成 & RLSポリシー反映（`spec/02_data_model/database_design.md`）
2. **Application/Interface 骨組み**
   - [x] `src/app/api/line/webhook/route.ts` のWebhooks受入口実装
   - [x] `application/mediator/` に EventMediator の初期クラスを配置
   - [x] `application/session/` に SessionManager とストア抽象化を配置
3. **Infrastructure アダプター**
   - [x] `infrastructure/line/`：署名検証・Reply/Push送信ヘルパー
   - [x] `infrastructure/supabase/`：共通SupabaseClientと基本Repository実装
   - [x] `infrastructure/openai/`：LLMクライアント＋プロンプト実行ユーティリティ
4. **UIビルダー**
   - [x] Flex Message Builder (`application/ui/flex-message-builder.ts`)
   - [x] Quick Reply Factory (`application/ui/quick-reply-factory.ts`)
   - [x] Rich Menu Manager (`application/ui/rich-menu-manager.ts`)

### 成果物
- 共通アダプターのユニットテスト
- Dev環境でWebhook→Mediator→Sessionまでの疎通確認

---

## フェーズ2: コアドメイン反復実装
各ドメインで以下の手順テンプレートを実行：
1. データモデル確認（`spec/02_data_model/database_design.md`）
2. Repositoryインターフェース定義 → Supabase実装
3. Domain Service・Value Object・Handler実装
4. LLMプロンプト作成（`domains/<domain>/prompts/`）
5. LINEメッセージテンプレート構築（`domains/<domain>/messages/`）
6. Jestユニットテスト

### 2.1 目標設定 (Goal Setting) — 仕様: `spec/04_workflows/goal-setting.md`
- [ ] `goals`, `user_sessions` リポジトリ整備
- [ ] SMART目標生成ロジック & ヒアリングハンドラー実装
- [ ] LLMプロンプト（目標抽出/提案）とQuick Reply
- [ ] Flex確認メッセージ

### 2.2 トレーニング計画 (Workout Planning) — `spec/04_workflows/training-plan.md`
- [ ] `training_plans`, `workout_sessions` リポジトリ
- [ ] 週間プラン自動生成 + カスタマイズロジック
- [ ] カルーセル表示メッセージ

### 2.3 記録・進捗 (Workout Execution / Record Progress) — `spec/04_workflows/record-progress.md`
- [ ] `workout_records`, `physical_stats`, `achievements`, `user_achievements`
- [ ] 記録入力フォーム、進捗可視化Flex
- [ ] アチーブメント付与ロジック

### 2.4 健康相談 (Health Consultation) — `spec/04_workflows/health-consultation.md`
- [ ] `consultations`, `conversation_history`
- [ ] カテゴリ選択→相談開始ハンドラー
- [ ] LLMフォールバック応答実装

### 2.5 今日のタスク / マイページ — `spec/04_workflows/todays-tasks.md`, `mypage.md`
- [ ] 当日タスク計算ロジック + Flex一覧
- [ ] 完了報告→`workout_records` 連携
- [ ] プロフィール・通知設定更新フォーム

---

## フェーズ3: セッション制御とフロー統合
- [ ] EventMediator でメッセージ種別・postback種別ごとのルーティング定義
- [ ] SessionManager で `current_flow` / `current_step` / `temp_data` の永続化
- [ ] `task_reminders` 連携（Edge Function / Supabase Scheduler）
- [ ] 共通エラーハンドリング＆フォールバック（`spec/01_system_design/error_handling.md`）
- [ ] ワークフロー横断テスト（Goal→Plan→Task→Record）

---

## フェーズ4: テスト & CI/CD
- [ ] ユニットテスト：ドメインサービス、LLMモック
- [ ] インテグレーションテスト：Webhook→Mediator→ドメイン
- [ ] Playwright E2E：代表的なユーザーフロー3本（goal, plan, task）
- [ ] `pnpm run lint` / `pnpm run type-check` のCI組込み
- [ ] Supabase SchemaとPrismaマイグレーション同期検証

---

## フェーズ5: 運用準備
- [ ] `.env.example` 更新 & Secrets共有手順書化
- [ ] Supabaseバックアップ/監視設定（`database_design.md` 参照）
- [ ] エラー監視（Sentry等）設定
- [ ] ドキュメント更新：`spec/`・`AGENTS.md` の差分反映
- [ ] 運用Playbook（LLM障害時対応、RLS違反検知）作成

---

## チェックリスト管理の推奨手順
1. このファイルをプルリク/Issueにリンクし、完了時にコミットメッセージへ反映。
2. 各フェーズ完了時に retrospection を実施し、必要な場合 `spec/` 更新。
3. 新たなドメインや機能が追加された場合は、本ドキュメントの該当フェーズにTODOを追記。
