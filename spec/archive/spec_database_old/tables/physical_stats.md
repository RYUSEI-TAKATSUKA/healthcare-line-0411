# physical_stats

体重・体脂肪率などの身体測定値を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 記録ID | id | UUID | NO | gen_random_uuid() | PK | 記録一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| 測定日 | record_date | DATE | NO | | | 測定日 |
| 体重(kg) | weight_kg | NUMERIC(5,2) | YES | NULL | | 体重 |
| 体脂肪率(%) | body_fat_percentage | NUMERIC(4,2) | YES | NULL | | 体脂肪率 |
| 筋肉量(kg) | muscle_mass_kg | NUMERIC(5,2) | YES | NULL | | 筋肉量 |
| その他測定値 | other_metrics | JSONB | YES | NULL | | その他の測定値（JSONフォーマット） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_physical_stats_user_id (user_id)
- INDEX idx_physical_stats_date (record_date)
- UNIQUE INDEX idx_physical_stats_user_date (user_id, record_date)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

## その他測定値のJSONB構造例

以下は、`other_metrics` カラムで保存可能なJSONデータの例です：

```json
{
  "blood_pressure": {
    "systolic": 120,
    "diastolic": 80,
    "unit": "mmHg"
  },
  "resting_heart_rate": {
    "value": 65,
    "unit": "bpm"
  },
  "waist_circumference": {
    "value": 82.5,
    "unit": "cm"
  },
  "sleep": {
    "duration": 7.5,
    "quality": 4,
    "unit": "hours"
  },
  "stress_level": {
    "value": 3,
    "scale": "1-5"
  }
}
```

## 健康指標の記録方法

### 身体指標の追跡
- ユーザーは LINEメッセージ を通じて手動で記録
- 将来的には Apple Health, Google Fit などの健康アプリと連携予定
- 複数の指標を同時に記録可能

### 主要指標別の計測頻度推奨
| 指標 | 推奨頻度 | 備考 |
|------|---------|------|
| 体重 | 毎日（同じ時間帯） | 朝起床後・着替え前が理想 |
| 体脂肪率 | 週1-2回 | 体組成計がある場合 |
| 筋肉量 | 週1-2回 | 体組成計がある場合 |
| 血圧 | 定期的（必要に応じて） | 高血圧の方は毎日 |
| 体囲測定 | 2週間〜1ヶ月ごと | 腹囲・胸囲など |

## 関連するワークフロー

- [記録・進捗フロー](../workflows/record-progress.md)
- [目標設定フロー](../workflows/goal-setting.md)

---

> **更新履歴**
> - 2024-04-11: 初版作成 