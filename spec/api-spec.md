# API 仕様

本ドキュメントでは LINEフィットネスBOT が外部と通信する主要 API の仕様をまとめる。

| 区分 | API | 用途 |
| --- | --- | --- |
| Messaging | LINE Messaging API | Webhook 受信・返信／プッシュメッセージ送信 |
| Data | Supabase REST (PostgREST) / RPC | DB CRUD / サーバー側プロシージャ呼び出し |
| AI | ChatCompletion API (OpenAI) | LLM による自然言語処理・テキスト生成 |

---

## 1. LINE Messaging API
公式: <https://developers.line.biz/en/reference/messaging-api/>

### 1.1 Webhook
| 項目 | 値 |
| --- | --- |
| パス | `/api/line/webhook` (Vercel Function) |
| 認証 | `X-Line-Signature` ヘッダ (HMAC-SHA256) |
| 受信形式 | JSON (events 配列) |

```jsonc
{
  "destination": "Uxxxxxxxxxx...",
  "events": [
    {
      "type": "message",
      "message": { "type": "text", "text": "Hello" },
      "timestamp": 1700000000000,
      "source": { "type": "user", "userId": "Uabc..." },
      "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
      "mode": "active"
    }
  ]
}
```

#### 1.1.1 エラー
| ステータス | 例 | 意味 |
| --- | --- | --- |
| 400 | signature invalid | 署名検証失敗 |
| 500 | internal error | ハンドラー内例外 |

### 1.2 Reply API
```
POST https://api.line.me/v2/bot/message/reply
Authorization: Bearer {CHANNEL_ACCESS_TOKEN}
Content-Type: application/json
```
リクエスト例:
```json
{
  "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
  "messages": [
    { "type": "text", "text": "こんにちは！" }
  ]
}
```
成功時: HTTP 200 空ボディ。失敗時: 400/401/429/500。

### 1.3 Push API (リマインド通知)
```
POST https://api.line.me/v2/bot/message/push
```
ボディは `to` + `messages`。リクエスト制限: 60 リクエスト/分。

---

## 2. Supabase REST / RPC

### 2.1 認証
- ヘッダ: `apikey: ${SUPABASE_SERVICE_KEY}` (サーバー側) / `Authorization: Bearer ${userAccessToken}` (クライアント)

### 2.2 CRUD 例
```
GET  https://<project>.supabase.co/rest/v1/users?select=*
POST https://<project>.supabase.co/rest/v1/goals
Content-Type: application/json
apikey: ${SERVICE_KEY}
{
  "user_id": "Uabc...",
  "goal_type": "weight_loss",
  "description": "-5kg in 3 months"
}
```
レスポンス: 作成された JSON レコード / エラー JSON `{ "message": "...", "code": "..." }`。

### 2.3 RPC (Edge Function 例)
```
POST https://<project>.supabase.co/functions/v1/notify_task_reminder
Content-Type: application/json
apikey: ${SERVICE_KEY}
{
  "user_id": "Uabc...",
  "task_id": "123"
}
```
成功: `{ "status": "ok" }`。

---

## 3. LLM API
以下はサポートする各 LLM プロバイダーのチャットAPI仕様です。

### 3.1 OpenAI ChatCompletion
**エンドポイント**
```
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer ${OPENAI_API_KEY}
```
**パラメータ** (共通)
| 名前 | 型 | 必須 | 例 | 説明 |
| --- | --- | --- | --- | --- |
| model | string | ✔︎ | `gpt-4o-mini` | 使用モデル |
| messages | array | ✔︎ | `[ {"role":"system"...}, ... ]` | 会話履歴 |
| temperature | number | - | 0.7 | 生成温度 |
| stream | boolean | - | false | ストリーム出力 |
**ドメイン別テンプレート (抜粋)**
```jsonc
{
  "model": "gpt-4o-mini",
  "messages": [ {"role":"system","content":"..."}, ... ],
  "functions": [ ... ]
}
```
**レートリミット & エラー**
| HTTP | name | 説明 | リトライ |
| --- | --- | --- | --- |
| 401 | invalid_api_key | APIキー不正 | 不再試行 |
| 429 | rate_limit_exceeded | レート超過 | バックオフ |
| 500 | server_error | サーバー障害 | リトライ |

### 3.2 Anthropic Claude
**エンドポイント**
```
POST https://api.anthropic.com/v1/chat/completions
Authorization: Bearer ${ANTHROPIC_API_KEY}
Content-Type: application/json
```
**パラメータ**
| 名前 | 型 | 必須 | 例 | 説明 |
| --- | --- | --- | --- | --- |
| model | string | ✔︎ | `claude-v1` | モデル名 |
| messages | array | ✔︎ | `[ {"role":"user","content":"..."} ]` | 会話履歴 |
| temperature | number | - | 0.7 | 生成温度 |
| max_tokens_to_sample | integer | - | 1000 | 最大トークン数 |
**エラーコード**
| HTTP | name | 説明 | リトライ |
| --- | --- | --- | --- |
| 401 | unauthorized | APIキー無効 | 不再試行 |
| 429 | rate_limit | レート超過 | バックオフ |
| 500 | server_error | サーバー障害 | リトライ |

### 3.3 Google Gemini
**エンドポイント**
```
POST https://gemini.googleapis.com/v1/gemini/chat/completions
Authorization: Bearer ${GOOGLE_OAUTH_TOKEN}
Content-Type: application/json
```
**パラメータ**
| 名前 | 型 | 必須 | 例 | 説明 |
| --- | --- | --- | --- | --- |
| model | string | ✔︎ | `gemini-ultra-1.0` | モデル名 |
| prompt | string | ✔︎ | `Hello, world!` | 入力プロンプト |
| temperature | number | - | 0.8 | 生成温度 |
| max_output_tokens | integer | - | 512 | 最大出力トークン数 |
**エラーコード**
| HTTP | name | 説明 | リトライ |
| --- | --- | --- | --- |
| 401 | unauthorized | 認証失敗 | 不再試行 |
| 429 | rate_limit_exceeded | レート超過 | バックオフ |
| 500 | internal_error | サーバー障害 | リトライ |

---

## 4. 共通エラー応答フォーマット
バックエンド API では以下の JSON を返す。
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

---

> **更新履歴**
> - 2024-04-11: 初版作成 