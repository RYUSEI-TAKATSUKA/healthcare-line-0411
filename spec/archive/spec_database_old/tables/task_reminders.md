# task_reminders

トレーニングリマインド設定を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| リマインダーID | id | UUID | NO | gen_random_uuid() | PK | リマインダー一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| セッションID | session_id | UUID | NO | | FK | 関連セッションID |
| リマインド日時 | reminder_time | TIMESTAMP WITH TIME ZONE | NO | | | リマインド予定日時 |
| リマインド種別 | reminder_type | VARCHAR(32) | NO | | | 種別（before_session/missed_session等） |
| 送信済みフラグ | is_sent | BOOLEAN | NO | FALSE | | 送信済みかどうか |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_task_reminders_user_id (user_id)
- INDEX idx_task_reminders_session_id (session_id)
- INDEX idx_task_reminders_time (reminder_time)
- INDEX idx_task_reminders_sent (is_sent)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE

## リマインド種別

| 種別 | 説明 | タイミング |
|------|------|-----------|
| before_session | セッション前リマインド | セッション予定時刻の1時間前など |
| day_before | 前日リマインド | セッション予定日の前日（設定時刻） |
| missed_session | 未実施リマインド | セッション予定時刻から3時間後など |
| weekly_summary | 週間サマリー | 毎週日曜日など定期的なタイミング |

## プッシュ通知メッセージ例

- before_session: 「1時間後にワークアウト『腕トレ30分』が予定されています」
- day_before: 「明日9:00から『有酸素運動45分』が予定されています」
- missed_session: 「今日予定されていた『体幹トレーニング』は実施済みですか？」
- weekly_summary: 「今週は3/4セッションを完了しました。素晴らしい進捗です！」

## 関連するワークフロー

- [今日のタスクフロー](../workflows/todays-tasks.md)
- [トレーニング計画フロー](../workflows/training-plan.md)

## リレーションシップ

- `users` テーブルと多対1 (1人のユーザーが複数のリマインダーを持つ)
- `workout_sessions` テーブルと多対1 (1つのセッションに対する複数のリマインダー)

---

> **更新履歴**
> - 2024-04-11: 初版作成 