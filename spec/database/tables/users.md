# users

ユーザーの基本情報を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| ユーザーID | id | UUID | NO | gen_random_uuid() | PK | 内部ユーザー識別子（主キー） |
| LINEユーザーID | external_line_user_id | VARCHAR(64) | NO | | UK | LINE Platform提供のユーザーID |
| 表示名 | display_name | VARCHAR(255) | NO | | | LINEの表示名 |
| 年齢 | age | INTEGER | YES | NULL | | ユーザーの年齢 |
| 性別 | gender | VARCHAR(16) | YES | NULL | | 性別（male/female/other） |
| 身長(cm) | height_cm | NUMERIC(5,2) | YES | NULL | | ユーザーの身長 |
| 初期体重(kg) | initial_weight_kg | NUMERIC(5,2) | YES | NULL | | 登録時の体重 |
| メールアドレス | email | VARCHAR(255) | YES | NULL | | 連絡先メールアドレス（通知用・オプション） |
| 通知有効フラグ | notifications_enabled | BOOLEAN | NO | TRUE | | 通知の有効/無効 |
| ユーザー設定 | preferences | JSONB | YES | NULL | | ユーザー設定情報（通知時間帯、UI設定など） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 最終アクティブ日時 | last_active | TIMESTAMP WITH TIME ZONE | YES | NULL | | 最後にアクティブだった日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_users_external_line_user_id (external_line_user_id)
- INDEX idx_users_last_active (last_active)
- INDEX idx_users_email (email) WHERE email IS NOT NULL

## ユーザー管理アプローチ

### 認証・識別
- LINEユーザーIDを外部識別子として使用
- 内部的にはUUIDで一意識別
- LINE Messaging APIと連携した認証フロー

### プロフィール情報
- 基本的な身体情報（年齢・性別・身長・体重）をオプションで保存
- トレーニングプラン生成や健康アドバイスのパーソナライズに活用

### ユーザー設定 JSONフォーマット例
```json
{
  "notifications": {
    "preferred_time": "19:00",
    "days": ["monday", "wednesday", "friday"],
    "channels": ["line"]
  },
  "ui_preferences": {
    "language": "ja",
    "theme": "default",
    "workout_view": "calendar"
  },
  "privacy": {
    "data_sharing": false,
    "anonymous_stats": true
  }
}
```

## 関連するワークフロー

- [マイページフロー](../workflows/mypage.md)
- [目標設定フロー](../workflows/goal-setting.md)

## リレーションシップ

- `goals` テーブルと1対多 (1人のユーザーが複数の目標を持つ)
- `training_plans` テーブルと1対多
- `physical_stats` テーブルと1対多
- `consultations` テーブルと1対多
- `user_achievements` テーブルと1対多

## 行レベルセキュリティ (RLS)

```sql
-- usersテーブルのRLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit their own data" 
ON users FOR ALL 
USING (id = auth.uid());

CREATE POLICY "Admins can view all users" 
ON users FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');
```

---

> **更新履歴**
> - 2024-04-11: 初版作成 