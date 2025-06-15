# LINEフィットネスBOT - データベース設計

## 1. 概要

このディレクトリには、LLMを活用したLINEフィットネスBOTシステムのデータベース設計に関するドキュメントが含まれています。データベーススキーマをテーブルごとに分割管理し、開発・保守性を高めることを目的としています。本システムはユーザーの健康・フィットネス目標設定、トレーニング計画管理、進捗記録、健康相談などの機能をサポートします。

## 2. データベース基本情報

| 項目 | 内容 |
|------|------|
| データベース名 | line_fitness_bot_db |
| RDBMS | PostgreSQL 14+ |
| 文字セット | UTF-8 |
| 照合順序 | ja_JP.utf8 |
| タイムゾーン | Asia/Tokyo |
| 接続方式 | Supabase / pgBouncer |
| バックアップ頻度 | 日次（フル）、時間単位（増分） |
| スキーマ名 | public |

## 3. テーブル一覧

| テーブル論理名 | テーブル物理名 | 概要 | 詳細リンク |
|--------------|--------------|------|--------------------|
| ユーザー | users | ユーザー基本情報 | [users.md](tables/users.md) |
| 目標 | goals | ユーザーの健康・フィットネス目標 | [goals.md](tables/goals.md) |
| トレーニング計画 | training_plans | 目標達成のためのトレーニングプラン | [training.md](tables/training.md) |
| トレーニングセッション | workout_sessions | 計画された個別セッション | [training.md](tables/training.md) |
| トレーニング記録 | workout_records | 実施されたトレーニングの記録 | [training.md](tables/training.md) |
| 身体指標 | physical_stats | 体重・体脂肪率などの身体測定値 | [health.md](tables/health.md) |
| 健康相談 | consultations | 健康・フィットネスに関する質問と回答 | [communication.md](tables/communication.md) |
| アチーブメント | achievements | 達成可能な称号・バッジの定義 | [achievements.md](tables/achievements.md) |
| ユーザーアチーブメント | user_achievements | ユーザーが獲得した称号・バッジ | [achievements.md](tables/achievements.md) |
| タスクリマインダー | task_reminders | トレーニングリマインド設定 | [training.md](tables/training.md) |
| 会話履歴 | conversation_history | LLMとの対話履歴保存 | [communication.md](tables/communication.md) |
| APIキー | api_keys | 外部API連携用のキー情報 | [system.md](tables/system.md) |
| LLMモデル | llm_models | 利用可能なLLMモデル情報 | [system.md](tables/system.md) |
| システム設定 | settings | システム設定情報 | [system.md](tables/system.md) |
| システムログ | system_logs | システムログ情報 | [system.md](tables/system.md) |

## 4. 機能グループとテーブルの関連性

| 機能グループ | 関連テーブル | ワークフロー |
|------------|------------|------------|
| ユーザー管理 | users | [マイページ](../workflows/mypage.md) |
| 目標設定 | goals | [目標設定](../workflows/goal-setting.md) |
| トレーニング管理 | training_plans, workout_sessions, workout_records, task_reminders | [トレーニング計画](../workflows/training-plan.md) |
| 健康記録 | physical_stats | [記録・進捗](../workflows/record-progress.md) |
| 会話・相談 | consultations, conversation_history | [健康相談](../workflows/health-consultation.md) |
| タスク管理 | task_reminders | [今日のタスク](../workflows/todays-tasks.md) |
| 達成報酬 | achievements, user_achievements | 複数ワークフロー |
| システム管理 | api_keys, llm_models, settings, system_logs | - |

## 5. 関連ドキュメント

- [テーブル間リレーション図](relations.md)
- [セキュリティ設計・RLS](security.md)
- [パフォーマンス最適化](optimization.md)

## 6. テーブル変更ガイドライン

1. **変更手順**:
   - 変更が必要なテーブル定義ファイルを特定
   - 変更内容をMarkdownで更新
   - 対応するワークフローファイルへの参照を確認・更新
   - 必要に応じてrelations.mdのER図も更新

2. **命名規則**:
   - テーブル名: スネークケース・複数形 (例: `workout_sessions`)
   - カラム名: スネークケース (例: `user_id`, `created_at`)
   - インデックス名: `idx_テーブル名_カラム名` (例: `idx_goals_user_id`)
   - 外部キー制約: `fk_テーブル名_参照テーブル名` (例: `fk_goals_users`)

3. **更新履歴**:
   - 各テーブル定義ファイルの末尾に更新履歴を記録
   - 日付、変更者、変更内容を簡潔に記載

---

> **更新履歴**
> - 2024-04-11: データベース設計ドキュメント初版作成 