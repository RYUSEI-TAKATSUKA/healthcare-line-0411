# goals

ユーザーの健康・フィットネス目標を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 目標ID | id | UUID | NO | gen_random_uuid() | PK | 目標一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| 目標タイプ | goal_type | VARCHAR(32) | NO | | | 目標タイプ（weight_loss/muscle_gain/endurance等） |
| 詳細説明 | description | TEXT | NO | | | 目標の詳細説明 |
| 動機 | motivation | TEXT | YES | NULL | | ユーザーの目標達成動機 |
| 目標指標 | target_metrics | JSONB | NO | | | 目標の測定指標（JSONフォーマット） |
| 開始日 | start_date | DATE | NO | | | 目標開始日 |
| 目標日 | target_date | DATE | NO | | | 目標達成予定日 |
| 進捗率 | progress_percentage | NUMERIC(5,2) | NO | 0 | | 進捗率（0-100%） |
| 状態 | status | VARCHAR(16) | NO | 'active' | | 状態（active/achieved/abandoned） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_goals_user_id (user_id)
- INDEX idx_goals_status (status)
- INDEX idx_goals_target_date (target_date)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

## 目標管理アプローチ

### 目標タイプ分類
| コード | 分類 | 例 |
| --- | --- | --- |
| weight_loss | 減量 | 体重減少、体脂肪率減少 |
| muscle_gain | 筋肉増強 | 筋肉量増加、筋力向上 |
| endurance | 持久力向上 | 走行距離/時間向上 |
| flexibility | 柔軟性向上 | 柔軟性数値向上 |
| health_recovery | 健康回復 | 特定症状の改善 |
| habit_formation | 習慣形成 | 運動習慣の定着 |

### バリデーション & 制約

- 目標減量速度: 健康的な減量は週0.5-1kgまで、それ以上は警告
- 目標期間: 最短2週間～最長1年の範囲内
- 体重増加目標: 健康的な筋肉増加は月1-2kgまで
- 不健康な目標の拒否: 危険な減量目標などは設定不可・代替提案

### JSONデータ構造例 (target_metrics)

```json
{
  "start_value": 70.5,
  "target_value": 65.0,
  "unit": "kg",
  "checkpoints": [
    {"value": 69.0, "date": "2024-05-01"},
    {"value": 67.5, "date": "2024-06-01"},
    {"value": 65.0, "date": "2024-07-01"}
  ]
}
```

## 関連するワークフロー

- [目標設定フロー](../workflows/goal-setting.md)
- [トレーニング計画フロー](../workflows/training-plan.md)
- [記録・進捗フロー](../workflows/record-progress.md)

## リレーションシップ

- `users` テーブルと1対多 (1人のユーザーが複数の目標を持つ可能性)
- `training_plans` テーブルと1対多 (1つの目標に対して複数のトレーニング計画)

---

> **更新履歴**
> - 2024-04-11: 初版作成 