# training_plans

目標達成のためのトレーニングプランを管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 計画ID | id | UUID | NO | gen_random_uuid() | PK | 計画一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| 目標ID | goal_id | UUID | YES | NULL | FK | 関連目標ID |
| 計画名 | name | VARCHAR(255) | NO | | | 計画の名称 |
| 詳細説明 | description | TEXT | YES | NULL | | 計画の詳細説明 |
| 計画タイプ | plan_type | VARCHAR(32) | NO | | | 計画タイプ（strength/weight_loss/endurance等） |
| 開始日 | start_date | DATE | NO | | | 計画開始日 |
| 終了予定日 | end_date | DATE | NO | | | 計画終了予定日 |
| 状態 | status | VARCHAR(16) | NO | 'active' | | 状態（active/completed/abandoned） |
| スケジュール設定 | schedule_settings | JSONB | NO | | | スケジュール設定（JSONフォーマット） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_training_plans_user_id (user_id)
- INDEX idx_training_plans_goal_id (goal_id)
- INDEX idx_training_plans_status (status)
- INDEX idx_training_plans_date_range (start_date, end_date)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL

## トレーニング計画タイプ

| コード | 分類 | 説明 | 例 |
| --- | --- | --- | --- |
| strength | 筋力トレーニング | 筋肉の強化と成長を促進 | ダンベルカール、ベンチプレス |
| cardio | 有酸素運動 | 心肺機能向上とカロリー消費 | ジョギング、サイクリング |
| flexibility | 柔軟性向上 | 可動域の拡大と怪我予防 | ストレッチ、ヨガ |
| balance | バランス強化 | 姿勢と安定性の向上 | バランスボード、片足立ち |
| hiit | 高強度インターバル | 短時間で効率的な脂肪燃焼 | タバタ式トレーニング |
| functional | 機能的トレーニング | 日常動作の改善と総合的強化 | スクワット、ランジ |

## スケジュール設定JSONデータ構造例

```json
{
  "frequency_per_week": 4,
  "preferred_days": ["monday", "wednesday", "friday", "saturday"],
  "preferred_time": "evening",
  "duration_minutes": 60,
  "environment": "home_basic",
  "equipment": ["dumbbells", "resistance_bands", "yoga_mat"],
  "rest_days": 1
}
```

## 関連するワークフロー

- [トレーニング計画フロー](../workflows/training-plan.md)
- [目標設定フロー](../workflows/goal-setting.md)

## リレーションシップ

- `users` テーブルと1対多 (1人のユーザーが複数のプランを持つ)
- `goals` テーブルと多対1 (1つの目標に対して1つのプラン)
- `workout_sessions` テーブルと1対多 (1つのプランに複数のセッション)

---

> **更新履歴**
> - 2024-04-11: 初版作成 