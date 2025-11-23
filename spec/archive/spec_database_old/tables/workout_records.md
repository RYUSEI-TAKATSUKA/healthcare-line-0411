# workout_records

実施されたトレーニングの記録を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 記録ID | id | UUID | NO | gen_random_uuid() | PK | 記録一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| セッションID | session_id | UUID | YES | NULL | FK | 関連セッションID（予定に基づく場合） |
| 実施日 | record_date | DATE | NO | | | 実施日 |
| 実施時刻 | record_time | TIME | YES | NULL | | 実施時刻 |
| トレーニングタイプ | workout_type | VARCHAR(32) | NO | | | トレーニングタイプ |
| 実施時間（分） | duration_minutes | INTEGER | NO | | | 実施時間 |
| 実施内容 | exercises_completed | JSONB | NO | | | 完了したエクササイズ詳細（JSONフォーマット） |
| 強度レベル | intensity_level | INTEGER | YES | NULL | | 主観的強度レベル（1-10） |
| フィードバック | feedback | TEXT | YES | NULL | | フィードバック・感想 |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_workout_records_user_id (user_id)
- INDEX idx_workout_records_session_id (session_id)
- INDEX idx_workout_records_date (record_date)
- INDEX idx_workout_records_type (workout_type)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE SET NULL

## 記録の種類

| 記録パターン | 説明 |
|------------|------|
| セッション履行 | 予定されたセッション（セッションIDあり）を実施した記録 |
| 追加トレーニング | 予定になかった追加トレーニング（セッションIDなし）の記録 |
| 自動記録 | 外部デバイス・アプリと連携して自動的に記録されたトレーニング |

## JSONデータ構造例 (exercises_completed)

```json
[
  {
    "name": "プッシュアップ",
    "sets_completed": 3,
    "reps_completed": [12, 10, 9],
    "weight_used": null,
    "difficulty_level": 7
  },
  {
    "name": "ダンベルカール",
    "sets_completed": 3,
    "reps_completed": [15, 12, 10],
    "weight_used": 8,
    "weight_unit": "kg",
    "difficulty_level": 6
  }
]
```

## 関連するワークフロー

- [記録・進捗フロー](../workflows/record-progress.md)
- [今日のタスクフロー](../workflows/todays-tasks.md)

## リレーションシップ

- `users` テーブルと多対1 (1人のユーザーが複数の記録を持つ)
- `workout_sessions` テーブルと多対1 (1つのセッションに対する記録、任意)

---

> **更新履歴**
> - 2024-04-11: 初版作成 