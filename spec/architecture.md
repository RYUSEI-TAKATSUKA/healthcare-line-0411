# システム構成・アーキテクチャ

本ドキュメントでは LINEフィットネスBOT のシステム構成、主要コンポーネントの責務、ならびにデータ／イベントフローを示します。

---

## 1. 俯瞰図（レイヤ構造）
以下はインターフェース層・アプリケーション層・ドメイン層・インフラ層に分割したレイヤ構造です。

```mermaid
graph TD
    classDef interface fill:#f9f,stroke:#333,stroke-width:2px,color:#333;
    classDef application fill:#bbf,stroke:#333,stroke-width:2px,color:#333;
    classDef domain fill:#bfb,stroke:#333,stroke-width:2px,color:#333;
    classDef infrastructure fill:#fdb,stroke:#333,stroke-width:2px,color:#333;
    classDef external fill:#ddd,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5,color:#333;

    subgraph "インターフェース層"
        LINE[LINE Platform]
        class LINE interface;
    end

    subgraph "アプリケーション層"
        LA[LINE Adapter]
        EM[Event Mediator]
        SM[Session Manager]
        UM[UI Manager]
        class LA application;
        class EM application;
        class SM application;
        class UM application;
    end

    subgraph "ドメイン層"
        GS[Goal Setting]
        WP[Workout Planning]
        WE[Workout Execution]
        HC[Health Consultation]
        PM[Prompt Manager]
        class GS domain;
        class WP domain;
        class WE domain;
        class HC domain;
        class PM domain;
    end

    subgraph "インフラ層"
        CC[ChatCompletion]
        DB[Supabase Connector]
        class CC infrastructure;
        class DB infrastructure;
    end

    subgraph "外部サービス"
        LineAPI[LINE Messaging API]
        LLMAPI[LLM API]
        Supabase[Supabase]
        class LineAPI external;
        class LLMAPI external;
        class Supabase external;
    end

    %% 接続
    LINE <--> LineAPI
    LineAPI <--> LA
    LA --> EM
    EM --> UM
    EM --> SM
    EM --> GS & WP & WE & HC
    GS & WP & HC --> CC
    CC <--> LLMAPI
    GS & WP & WE & HC & SM & PM --> DB
    DB <--> Supabase
    UM --> LA
```

---

## 2. コンポーネント責務
| レイヤ | コンポーネント | 主な責務 |
| --- | --- | --- |
| インターフェース | LINE Adapter | LINE Messaging API と Webhook イベントの変換／送受信 |
| アプリケーション | Event Mediator | 全イベント（メッセージ・ボタン・タイマー）のルーティング、オーケストレーション |
|  | Session Manager | ユーザーごとの現在ステート管理、タイムアウト処理、状態復元 |
|  | UI Manager | LINE メッセージ・リッチメニューなど UI コンポーネントの生成 |
| ドメイン | Goal Setting / Workout Planning / Workout Execution / Health Consultation | 各ドメインロジック実装（目標設定、プラン生成・進捗管理、相談回答など） |
|  | Prompt Manager | プロンプトテンプレート管理、会話履歴取得、LLM API 呼び出し前の整形 |
| インフラ | ChatCompletion | OpenAI 等 LLM API のラッパー、リトライ・レート制御 |
|  | Supabase Connector | DB アクセス、RLS 準拠、Edge Functions 呼び出し |

---

## 3. 会話処理シーケンス
LLM を伴う代表的なシーケンス（相談フロー）を示します。

```mermaid
sequenceDiagram
    participant LA as LINE Adapter
    participant EM as Event Mediator
    participant SM as Session Manager
    participant HC as Health Consultation (Domain)
    participant PM as Prompt Manager
    participant DB as Supabase Connector
    participant CC as ChatCompletion
    participant LLM as LLM API

    LA->>EM: ユーザーメッセージ (テキスト/ボタン)
    EM->>SM: セッション状態取得
    SM-->>EM: 現在状態
    EM->>HC: 相談フロー開始
    HC->>PM: プロンプト生成要求
    PM->>DB: ユーザープロフィール & 会話履歴取得
    DB-->>PM: データ返却
    PM-->>CC: 完成プロンプト
    CC->>LLM: ChatCompletion API
    LLM-->>CC: 応答
    CC-->>HC: 生成結果
    HC-->>EM: 表示用メッセージ
    EM->>DB: 新規会話履歴保存
    EM->>LA: LINE 応答送信
```

---

## 4. データフロー
1. **読み取り系**: Session Manager / Domain が Supabase からプロフィール・履歴をフェッチ
2. **書き込み系**: 会話履歴・トレーニング実績・身体指標を Supabase に保存
3. **LLM 呼び出し**: Prompt Manager が ChatCompletion 経由で外部 LLM API を呼び出し
4. **通知系**: Edge Functions が定期バッチをトリガーし LINE Push API 経由でリマインド送信

---

## 5. デプロイ構成（例）
```mermaid
graph LR
    subgraph Vercel
        FE[Next.js Serverless Functions]
    end
    subgraph Supabase
        DB[PostgreSQL]
        Edge[Edge Functions]
    end
    subgraph OpenAI
        GPT[ChatCompletion]
    end
    FE -->|HTTP Webhook| FE
    FE <-->|PostgREST & RPC| DB
    FE --> GPT
    Edge --> FE
```
※ 実際のインフラは Vercel/Cloudflare Workers/自社クラウド などに置き換え可。

---

## 6. 技術スタック
- **言語**: TypeScript (Node.js 18+)
- **フレームワーク**: Next.js / Fastify など（要件に応じて選択）
- **インフラ**: Supabase (DB・Edge Functions・Auth)、Vercel (Serverless)、OpenAI API
- **CI/CD**: GitHub Actions (テスト → Lint → デプロイ)

---

## 7. 可観測性 & セキュリティ
| 項目 | 方針 |
| --- | --- |
| ロギング | OpenTelemetry + Supabase Edge Functions Logs |
| トレーシング | X-Ray / Grafana Tempo など選択肢 |
| アラート | GitHub Actions, Slack 通知 |
| 認証 | LINE OAuth + Supabase Auth, RLS で Row Level Security |
| シークレット管理 | Vercel / GitHub Actions Secrets |

---

## 8. 拡張ポイント
- 他サービス連携（Apple HealthKit / Google Fit）
- AI モデル多様化（栄養推奨モデル、画像解析モデル）
- マルチプラットフォーム展開（WhatsApp, Telegram 等）

---

> **更新履歴**
> - 2024-04-11: 初版作成 