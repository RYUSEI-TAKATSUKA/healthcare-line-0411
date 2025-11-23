# api_keys

外部API連携用のキー情報を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| APIキーID | id | UUID | NO | gen_random_uuid() | PK | APIキー一意識別子 |
| サービス名 | service | VARCHAR(50) | NO | | | サービス名（LINE/OpenAI/Azure等） |
| キー名 | key_name | VARCHAR(100) | NO | | | APIキーの名称 |
| キー値 | key_value | VARCHAR(255) | NO | | | 暗号化されたAPIキー値 |
| 説明 | description | TEXT | YES | NULL | | APIキーの説明 |
| 状態 | status | VARCHAR(20) | NO | 'active' | | 状態（active/inactive/revoked） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード更新日時 |
| 有効期限 | expires_at | TIMESTAMP WITH TIME ZONE | YES | NULL | | キーの有効期限 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_api_keys_service_name (service, key_name)
- INDEX idx_api_keys_status (status)
- INDEX idx_api_keys_expires_at (expires_at)

## 主要サービス一覧

| サービス名 | 説明 | APIキータイプ |
|----------|------|--------------|
| LINE | LINE Messaging API | チャネルアクセストークン |
| OpenAI | OpenAI API | APIキー |
| Azure | Azure OpenAI Service | APIキー・エンドポイント |
| Anthropic | Anthropic Claude API | APIキー |
| Google | Google API | OAuth2トークン |

## セキュリティ対策

- キー値は保存前に暗号化
- 取得時に復号化（アプリケーションレベル）
- アクセス制限（管理者のみアクセス可）
- 定期的なローテーション
- 有効期限管理

## リレーションシップ

- `llm_models` テーブルと1対多 (1つのAPIキーを複数のLLMモデルで利用可能)

## 行レベルセキュリティ (RLS)

```sql
-- api_keysテーブルのRLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only can manage API keys" 
ON api_keys FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');
```

---

> **更新履歴**
> - 2024-04-11: 初版作成 