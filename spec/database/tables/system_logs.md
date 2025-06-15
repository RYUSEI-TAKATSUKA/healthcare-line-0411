# system_logs

システムログ情報を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| ログID | id | UUID | NO | gen_random_uuid() | PK | ログ一意識別子 |
| ログレベル | log_level | VARCHAR(20) | NO | 'info' | | ログレベル（debug/info/warning/error/critical） |
| メッセージ | message | TEXT | NO | | | ログメッセージ |
| コンテキスト | context | JSONB | YES | NULL | | 関連コンテキスト情報（JSONフォーマット） |
| ユーザーID | user_id | UUID | YES | NULL | FK | 関連ユーザーID（ある場合） |
| IPアドレス | ip_address | VARCHAR(45) | YES | NULL | | クライアントIPアドレス |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | ログ記録日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_system_logs_level (log_level)
- INDEX idx_system_logs_user_id (user_id)
- INDEX idx_system_logs_created_at (created_at)
- UNIQUE INDEX idx_system_logs_created_level (created_at, log_level) WHERE log_level IN ('error', 'critical')

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL

## ログレベル分類

| レベル | 説明 | 例 |
|--------|------|-----|
| debug | 詳細デバッグ情報 | リクエスト詳細、詳細処理フロー |
| info | 通常の処理情報 | ユーザーログイン、セッション開始 |
| warning | 潜在的問題 | 一時的な処理失敗、通信エラー |
| error | エラー発生 | API呼び出し失敗、処理中断 |
| critical | 重大な障害 | システムクラッシュ、DB接続不能 |

## JSONデータ構造例 (context)

```json
{
  "component": "LLMClient",
  "operation": "chat_completion",
  "request_id": "req_1234abcd",
  "duration_ms": 2543,
  "status_code": 500,
  "error_details": {
    "type": "connection_error",
    "message": "API rate limit exceeded"
  },
  "request_summary": {
    "model": "gpt-4",
    "prompt_tokens": 356,
    "user_query_type": "health_consultation"
  }
}
```

## ログ保持期間

| ログレベル | オンライン保持期間 | アーカイブ期間 |
|-----------|-----------------|-------------|
| debug | 48時間 | 7日 |
| info | 7日 | 30日 |
| warning | 30日 | 90日 |
| error | 90日 | 180日 |
| critical | 180日 | 365日 |

## 行レベルセキュリティ (RLS)

```sql
-- system_logsテーブルのRLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only can access system logs" 
ON system_logs FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can see their own logs" 
ON system_logs FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);
```

---

> **更新履歴**
> - 2024-04-11: 初版作成 