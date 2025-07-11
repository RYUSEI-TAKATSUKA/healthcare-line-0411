# エラーハンドリング & フォールバック戦略

本ドキュメントでは LINEフィットネスBOT におけるエラーハンドリングの全般的な方針と各コンポーネントのフォールバック戦略をまとめます。

---

## 1. 全般的な方針

### 1.1 エラー種別
| エラー種別 | 説明 | 影響範囲 |
| --- | --- | --- |
| 入力検証エラー | ユーザー入力の形式・範囲誤り | ユーザー単位 |
| API連携エラー | LINE/Supabase/LLM との通信失敗 | 機能単位〜全体 |
| システムエラー | サーバー内部・インフラ障害 | 機能単位〜全体 |
| 状態不整合 | セッション状態と実際の処理の不整合 | ユーザー単位 |

### 1.2 エラーの記録と監視
- **ロギング**: 構造化ログを Supabase Storage または CloudWatch に保存
- **監視**: エラー頻度 / API 応答時間 / DB 接続状態 / LLM 呼出状態
- **アラート**: Slack 通知 (5分間に10件以上のエラー発生時、重大エラー即時)

---

## 2. コンポーネント別エラーハンドリング

### 2.1 LINE Messaging API 連携
| エラー | 対応 | フォールバック |
| --- | --- | --- |
| 署名検証失敗 | 400応答・ログ記録 | なし（セキュリティリスク回避） |
| Webhook受信エラー | 再試行 (1回) | ユーザーに再操作案内 |
| Reply/Push失敗 | 再試行 (最大3回) | 内部状態は維持、ユーザー再開時に対応 |

### 2.2 Supabase DB 連携
| エラー | 対応 | フォールバック |
| --- | --- | --- |
| 接続エラー | 再試行 (Exponential Backoff) | インメモリキャッシュ利用 |
| クエリエラー | パラメータ見直しで再試行 | 代替クエリまたはデフォルト値返却 |
| RLS違反 | セキュリティログ記録 | 適切な権限要求メッセージ表示 |

### 2.3 LLM API 連携
| エラー | 対応 | フォールバック |
| --- | --- | --- |
| API接続エラー | 別プロバイダ試行 (OpenAI→Claude→Gemini) | 事前定義済み応答 |
| レート制限 | キュー追加＆遅延実行 | 簡易応答＆後ほど通知 |
| モデル応答不正 | プロンプト調整で再試行 | ルールベース処理に切替 |

---

## 3. ユーザーフロー別フォールバック戦略

### 3.1 目標設定フロー
- LLM 生成エラー: 目標テンプレートから選択肢提示
- DB保存エラー: ローカルストレージ一時保存＆後続フロー継続

### 3.2 トレーニング計画フロー
- プラン生成エラー: 基本プランを提案
- スケジュール保存エラー: ユーザーのタイムゾーン取得失敗時はデフォルトJST

### 3.3 記録・進捗フロー
- 記録保存エラー: クライアント側キャッシュ＆再送
- グラフ表示エラー: テキストサマリー表示

### 3.4 健康相談フロー
- LLM 応答エラー: 「現在この質問には回答できません。別の質問をどうぞ」
- 相談カテゴリ不明: 一般カテゴリとして扱い、汎用回答

---

## 4. 状態リカバリー

### 4.1 会話コンテキスト復元
- ユーザーとの会話が中断した場合：
  1. 最終状態からの再開ガイド表示
  2. 「続きから」「最初から」の選択肢提示

### 4.2 データ不整合対応
- プラン存在するが実績がない場合：
  1. 「記録忘れ」と「未実施」の確認
  2. バルク記録インターフェース提供

---

## 5. ヘルスチェック

### 5.1 システム健全性確認
- 60秒ごとに主要コンポーネント疎通確認
- LINE API / Supabase / LLM API 接続性チェック

### 5.2 自動復旧
- Webhook エンドポイント障害時: Cloud Run インスタンス再起動
- Supabase 接続エラー: 接続プール再初期化

---

> **更新履歴**
> - 2024-04-11: 初版作成 