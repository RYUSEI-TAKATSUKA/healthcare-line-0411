# achievements

達成可能な称号・バッジの定義を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| アチーブメントID | id | UUID | NO | gen_random_uuid() | PK | アチーブメント一意識別子 |
| コード | code | VARCHAR(50) | NO | | UK | アチーブメント識別コード |
| 名称 | name | VARCHAR(100) | NO | | | アチーブメント名称 |
| 説明 | description | TEXT | NO | | | アチーブメントの説明 |
| カテゴリ | category | VARCHAR(32) | NO | | | カテゴリ（streak/strength/cardio/nutrition等） |
| アイコンURL | icon_url | VARCHAR(255) | YES | NULL | | アイコン画像のURL |
| 獲得条件 | requirements | JSONB | NO | | | 獲得条件（JSONフォーマット） |
| 獲得XP | xp_reward | INTEGER | NO | 0 | | 獲得時の経験値ポイント |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_achievements_code (code)
- INDEX idx_achievements_category (category)

## アチーブメントカテゴリ

| カテゴリ | 説明 | 例 |
|---------|------|-----|
| streak | 継続記録 | 「7日間連続ログイン」 |
| milestone | マイルストーン | 「初めてのワークアウト」 |
| strength | 筋力トレーニング | 「ベンチプレス100kg達成」 |
| cardio | 有酸素運動 | 「月間走行距離100km達成」 |
| nutrition | 栄養管理 | 「7日間連続タンパク質目標達成」 |
| weight | 体重管理 | 「目標体重達成」 |

## JSONデータ構造例 (requirements)

```json
{
  "type": "streak",
  "criteria": {
    "action": "workout_completion",
    "consecutive_days": 7
  },
  "progress_tracking": {
    "count_method": "calendar_days",
    "reset_on_miss": true
  }
}
```

```json
{
  "type": "milestone",
  "criteria": {
    "action": "workout_count",
    "target_count": 50
  }
}
```

## 初期データの例

```json
[
  {
    "code": "first_workout",
    "name": "ファーストステップ",
    "description": "初めてのトレーニングを記録",
    "category": "milestone",
    "icon_url": "/icons/first_workout.png",
    "requirements": {
      "workout_count": 1
    },
    "xp_reward": 50
  },
  {
    "code": "streak_7days",
    "name": "7日間ストリーク",
    "description": "7日間連続でトレーニングを記録",
    "category": "streak",
    "icon_url": "/icons/streak_7.png",
    "requirements": {
      "consecutive_days": 7
    },
    "xp_reward": 100
  }
]
```

## 関連するワークフロー

複数のワークフローに関連します：
- トレーニング記録
- 目標達成
- 継続利用

## リレーションシップ

- `user_achievements` テーブルと1対多 (1つのアチーブメントを複数のユーザーが獲得可能)

---

> **更新履歴**
> - 2024-04-11: 初版作成 