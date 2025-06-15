# consultations

健康・フィットネスに関する質問と回答を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 相談ID | id | UUID | NO | gen_random_uuid() | PK | 相談一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| カテゴリ | category | VARCHAR(32) | NO | | | 相談カテゴリ（training/nutrition/health等） |
| 質問内容 | question | TEXT | NO | | | 質問内容 |
| 回答内容 | answer | TEXT | NO | | | 回答内容 |
| コンテキストデータ | context_data | JSONB | YES | NULL | | コンテキストデータ（JSONフォーマット） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_consultations_user_id (user_id)
- INDEX idx_consultations_category (category)
- INDEX idx_consultations_created_at (created_at)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

## 相談カテゴリ

| カテゴリ | 説明 | 例 |
|---------|------|-----|
| training | トレーニング方法 | 「初心者向けの筋トレメニューを教えて」 |
| nutrition | 栄養・食事 | 「筋肉増量に適した食事は？」 |
| health | 健康・体調管理 | 「運動中の筋肉痛の対処法は？」 |
| motivation | モチベーション | 「続けられるコツを教えて」 |
| equipment | 器具・ギア | 「初心者が買うべきダンベルは？」 |
| recovery | 回復・休養 | 「オーバートレーニングの兆候は？」 |

## JSONデータ構造例 (context_data)

```json
{
  "consultation_type": "nutrition",
  "user_stats": {
    "age": 35,
    "gender": "female",
    "height_cm": 165,
    "weight_kg": 62.5,
    "activity_level": "moderate"
  },
  "related_goals": ["weight_loss"],
  "dietary_restrictions": ["lactose_intolerant"],
  "llm_data": {
    "model": "claude-3-sonnet",
    "temperature": 0.5,
    "prompt_tokens": 487,
    "completion_tokens": 213
  },
  "follow_up_suggested": true
}
```

## 関連するワークフロー

- [健康相談フロー](../workflows/health-consultation.md)

## リレーションシップ

- `users` テーブルと多対1 (1人のユーザーが複数の相談を持つ)
- `conversation_history` テーブルと1対多 (1つの相談から複数の会話履歴が生成される)

---

> **更新履歴**
> - 2024-04-11: 初版作成 