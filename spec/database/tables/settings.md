# settings

システム設定情報を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 設定ID | id | UUID | NO | gen_random_uuid() | PK | 設定一意識別子 |
| 設定キー | setting_key | VARCHAR(100) | NO | | UK | 設定項目のキー |
| 設定値 | setting_value | TEXT | YES | NULL | | 設定値 |
| データ型 | data_type | VARCHAR(20) | NO | 'string' | | 設定値のデータ型（string/integer/boolean/json） |
| 説明 | description | TEXT | YES | NULL | | 設定項目の説明 |
| グループ | group_name | VARCHAR(50) | NO | 'general' | | 設定グループ名 |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_settings_key (setting_key)
- INDEX idx_settings_group (group_name)

## 設定グループ

| グループ | 説明 | 例 |
|---------|------|-----|
| general | 一般設定 | サービス名、バージョン等 |
| notification | 通知設定 | 通知頻度、送信時間等 |
| workflow | ワークフロー設定 | フロー制御パラメータ等 |
| feature_flags | 機能フラグ | 各機能の有効/無効状態 |
| llm | LLM関連設定 | デフォルトモデル、パラメータ等 |
| security | セキュリティ設定 | セッションタイムアウト等 |

## 代表的な設定項目例

| キー | データ型 | 説明 | デフォルト値 |
|-----|---------|------|------------|
| service.name | string | サービス名称 | "LINEフィットネスBOT" |
| service.version | string | サービスバージョン | "1.0.0" |
| notification.reminder_hour | integer | リマインド通知時間 | 19 |
| notification.max_per_day | integer | 1日の最大通知数 | 3 |
| feature.beta_enabled | boolean | ベータ機能有効フラグ | false |
| llm.default_model | string | デフォルトモデル | "gpt-4" |
| llm.default_temperature | json | モデル別温度設定 | {"gpt-4": 0.7, "claude": 0.8} |

## 行レベルセキュリティ (RLS)

```sql
-- settingsテーブルのRLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only can manage settings" 
ON settings FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "All can read public settings" 
ON settings FOR SELECT 
USING (group_name NOT IN ('security', 'internal'));
```

---

> **更新履歴**
> - 2024-04-11: 初版作成 