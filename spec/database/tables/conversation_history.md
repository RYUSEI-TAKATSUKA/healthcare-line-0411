# conversation_history

LLMとの対話履歴を保存するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 会話ID | id | UUID | NO | gen_random_uuid() | PK | 会話一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| メッセージ種別 | message_type | VARCHAR(20) | NO | | | メッセージ種別（user/bot/system/draft） |
| ユーザーメッセージ | user_message | TEXT | YES | NULL | | ユーザーからのメッセージ内容 |
| ボットメッセージ | bot_message | TEXT | YES | NULL | | ボットからのメッセージ内容 |
| コンテキストデータ | context_data | JSONB | YES | NULL | | コンテキストデータ（JSONフォーマット） |
| 状態 | status | VARCHAR(20) | YES | NULL | | 状態（draft/confirmed/canceled等） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_conversation_history_user_id (user_id)
- INDEX idx_conversation_history_created_at (created_at)
- INDEX idx_conversation_history_message_type (message_type)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

## メッセージ種別の使い分け
- `user`: ユーザーからのメッセージ
- `bot`: システムからの応答
- `system`: システム内部イベント（目標確定など）
- `draft`: 確定前の下書き状態（目標案など）

## 状態管理
- `draft`: 提案段階（未確定）
- `confirmed`: ユーザーにより承認済み
- `canceled`: 拒否・キャンセル
- `archived`: アーカイブ済み

## JSONデータ構造例 (context_data)

```json
{
  "workflow": "goal_setting",
  "step": "initial_inquiry",
  "llm": {
    "model": "gpt-4",
    "temperature": 0.7,
    "prompt_tokens": 342,
    "completion_tokens": 128
  },
  "session_data": {
    "session_id": "1234abcd-5678-efgh-9012-ijklmnopqrst",
    "start_time": "2024-04-11T13:45:22+09:00",
    "steps_completed": 2
  },
  "user_context": {
    "goal_type": "weight_loss",
    "current_weight": 70.5,
    "target_weight": 65.0,
    "timeframe_weeks": 12
  }
}
```

## 会話データの保持期間
- アクティブな会話データ: 6ヶ月
- アーカイブデータ: 最大12ヶ月（匿名化）
- センシティブなデータは明示的な同意なく長期保存しない

## 関連するワークフロー

- [健康相談フロー](../workflows/health-consultation.md)
- [目標設定フロー](../workflows/goal-setting.md)

## リレーションシップ

- `users` テーブルと多対1 (1人のユーザーが複数の会話履歴を持つ)

---

> **更新履歴**
> - 2024-04-11: 初版作成 