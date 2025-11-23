# ドキュメント体系

本プロジェクトの仕様書・設計書は以下のディレクトリ構成で管理されています。

## 📂 00_requirements (要件定義)
プロジェクトの目的、ターゲットユーザー、機能要件などを定義します。
- [requirements.md](./00_requirements/requirements.md): 要件定義書 (旧: LINEフィットネスBOT要件定義書)

## 📂 01_system_design (システム設計)
アーキテクチャ、インフラ、共通の技術的決定事項を記述します。
- [architecture.md](./01_system_design/architecture.md): 全体アーキテクチャ設計
- [directory_structure.md](./01_system_design/directory_structure.md): ディレクトリ構成と責務
- [environment.md](./01_system_design/environment.md): 環境変数とインフラ設定
- [error_handling.md](./01_system_design/error_handling.md): エラーハンドリング方針
- [test_ci.md](./01_system_design/test_ci.md): テスト戦略とCI/CD

## 📂 02_data_model (データ設計)
データベース設計、スキーマ定義、ER図を含みます。
- [database_design.md](./02_data_model/database_design.md): データベース設計書

## 📂 03_interface (インターフェース設計)
API定義やLINEメッセージ形式などのインターフェース仕様です。
- [api_spec.md](./03_interface/api_spec.md): 内部/外部 API仕様
- [line_message_spec.md](./03_interface/line_message_spec.md): LINE Flex Message等のUI仕様

## 📂 04_workflows (ワークフロー詳細)
主要なユーザー体験ごとの詳細フロー定義です。
- [goal-setting.md](./04_workflows/goal-setting.md): 目標設定フロー
- [training-plan.md](./04_workflows/training-plan.md): トレーニング計画作成フロー
- [record-progress.md](./04_workflows/record-progress.md): 記録・進捗管理フロー
- [health-consultation.md](./04_workflows/health-consultation.md): 健康相談フロー
- [todays-tasks.md](./04_workflows/todays-tasks.md): 今日のタスクフロー
- [mypage.md](./04_workflows/mypage.md): マイページ・設定フロー

## 📂 archive (アーカイブ)
古いドキュメントや参考資料を保管しています。
