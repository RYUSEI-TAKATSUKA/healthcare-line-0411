# llm_models

利用可能なLLMモデル情報を管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| モデルID | id | UUID | NO | gen_random_uuid() | PK | モデル一意識別子 |
| モデル名 | model_name | VARCHAR(100) | NO | | UK | モデルの名称 |
| プロバイダー | provider | VARCHAR(50) | NO | | | モデルプロバイダー（OpenAI/Azure/Anthropic等） |
| APIキーID | api_key_id | UUID | YES | NULL | FK | api_keysテーブルの外部キー |
| 最大トークン | max_tokens | INTEGER | NO | 4096 | | 最大トークン数 |
| コンテキスト長 | context_window | INTEGER | NO | 8000 | | モデルのコンテキストウィンドウサイズ |
| 設定パラメータ | parameters | JSONB | YES | NULL | | モデル設定パラメータ（JSONフォーマット） |
| 状態 | status | VARCHAR(20) | NO | 'active' | | モデルの状態（active/inactive/deprecated） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_llm_models_name (model_name)
- INDEX idx_llm_models_provider (provider)
- INDEX idx_llm_models_status (status)

**外部キー制約**:
- FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL

## 主要プロバイダーとモデル

| プロバイダー | モデル例 | 特徴 |
|------------|---------|------|
| OpenAI | gpt-4, gpt-3.5-turbo | 汎用LLM、高性能 |
| Anthropic | claude-3-opus, claude-3-sonnet | 長いコンテキスト、倫理的配慮 |
| Azure | azure-gpt-4 | Azure版OpenAIモデル |
| Google | gemini-pro | Google提供モデル |

## JSONデータ構造例 (parameters)

```json
{
  "temperature": 0.7,
  "top_p": 1,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.2,
  "stop_sequences": ["\n\n"],
  "max_response_tokens": 1024,
  "use_stream": true,
  "endpoint_url": "https://api.openai.com/v1/chat/completions"
}
```

## モデル選択ロジック

システムは以下の条件に基づいて最適なモデルを選択します：
- 機能要件（必要なコンテキスト長など）
- コスト効率（低コストなワークフローには低コストモデル）
- 性能要件（複雑な目標設定には高性能モデル）
- 可用性（障害時のフォールバック）

## 行レベルセキュリティ (RLS)

```sql
-- llm_modelsテーブルのRLS
ALTER TABLE llm_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only can manage LLM models" 
ON llm_models FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "All users can read active models" 
ON llm_models FOR SELECT 
USING (status = 'active');
```

---

> **更新履歴**
> - 2024-04-11: 初版作成 