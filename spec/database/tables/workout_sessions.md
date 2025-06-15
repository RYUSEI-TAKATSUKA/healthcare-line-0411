# workout_sessions

計画された個別トレーニングセッションを管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| セッションID | id | UUID | NO | gen_random_uuid() | PK | セッション一意識別子 |
| 計画ID | plan_id | UUID | NO | | FK | 関連計画ID |
| セッション名 | name | VARCHAR(255) | NO | | | セッション名称 |
| 詳細説明 | description | TEXT | YES | NULL | | セッションの詳細説明 |
| 予定日 | scheduled_date | DATE | NO | | | 予定日 |
| 予定時間帯 | scheduled_time | VARCHAR(16) | YES | NULL | | 予定時間帯（morning/afternoon/evening等） |
| 予定所要時間（分） | duration_minutes | INTEGER | NO | | | 予定所要時間 |
| セッションタイプ | session_type | VARCHAR(32) | NO | | | セッションタイプ（strength/cardio/flexibility等） |
| エクササイズ内容 | exercises | JSONB | NO | | | エクササイズ詳細（JSONフォーマット） |
| 状態 | status | VARCHAR(16) | NO | 'scheduled' | | 状態（scheduled/completed/skipped/cancelled） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_workout_sessions_plan_id (plan_id)
- INDEX idx_workout_sessions_date (scheduled_date)
- INDEX idx_workout_sessions_status (status)

**外部キー制約**:
- FOREIGN KEY (plan_id) REFERENCES training_plans(id) ON DELETE CASCADE

## JSONデータ構造例 (exercises)

```json
[
  {
    "name": "プッシュアップ",
    "description": "肩幅より少し広めに手を置いて行う基本的な腕立て伏せ",
    "muscle_groups": ["chest", "triceps", "shoulders"],
    "sets": 3,
    "reps": 10,
    "rest_seconds": 60,
    "video_url": "https://example.com/videos/pushup.mp4",
    "modifications": [
      {
        "name": "膝つきプッシュアップ",
        "difficulty": "easy"
      },
      {
        "name": "ダイヤモンドプッシュアップ",
        "difficulty": "hard"
      }
    ]
  },
  {
    "name": "ボディウェイトスクワット",
    "description": "肩幅に足を開いて行う基本的なスクワット",
    "muscle_groups": ["quadriceps", "glutes", "hamstrings"],
    "sets": 3,
    "reps": 15,
    "rest_seconds": 60
  }
]
```

## セッション状態遷移

| 状態 | 説明 | 遷移可能な次の状態 |
|------|------|------------------|
| scheduled | 予定済み | completed, skipped, cancelled |
| completed | 完了 | - |
| skipped | スキップ | scheduled (再スケジュール時) |
| cancelled | キャンセル | scheduled (再スケジュール時) |

## 関連するワークフロー

- [トレーニング計画フロー](../workflows/training-plan.md)
- [今日のタスクフロー](../workflows/todays-tasks.md)

## リレーションシップ

- `training_plans` テーブルと多対1 (1つのプランに複数のセッション)
- `workout_records` テーブルと1対多 (1つのセッションに対する実施記録)
- `task_reminders` テーブルと1対多 (1つのセッションに対する複数のリマインダー)

---

> **更新履歴**
> - 2024-04-11: 初版作成 