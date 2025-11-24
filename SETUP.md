# LINEフィットネスBOT - セットアップガイド

## 1. 前提条件

- Node.js 18.x 以上
- npm または pnpm
- Supabaseアカウント
- LINE Developersアカウント
- OpenAI APIキー

## 2. Supabaseセットアップ（完了✅）

### 2.1 プロジェクト作成とリンク
```bash
# Supabaseにログイン
npx supabase login

# プロジェクトにリンク
npx supabase link
# → Healthcare-AI- 0411 (vdeduxscrgmimmlbitod) を選択済み
```

### 2.2 マイグレーション適用
```bash
# データベーススキーマ適用（完了）
npx supabase db push
```

適用済みマイグレーション：
- ✅ `20251124090757_initial_schema.sql` - 15テーブル定義
- ✅ `20251124090919_rls_policies.sql` - RLSポリシー設定

### 2.3 接続情報の取得

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクト **Healthcare-AI- 0411** を選択
3. **Settings > API** へ移動
4. 以下の情報をメモ：
   - **Project URL**: `https://vdeduxscrgmimmlbitod.supabase.co`
   - **anon / public key**: (公開用キー)
   - **service_role key**: (サーバー用キー - 秘密!)

## 3. 環境変数設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を記述：

```bash
# LINE Messaging API
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token

# Supabase
SUPABASE_URL=https://vdeduxscrgmimmlbitod.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# オプション: Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# オプション: Google Gemini
GOOGLE_API_KEY=your_google_api_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=info
LINE_VERIFY_SIGNATURE=true
```

## 4. 依存関係のインストール

```bash
npm install
# または
pnpm install
```

## 5. データベース確認

### 5.1 テーブル一覧確認
Supabase Dashboard > Table Editor で以下のテーブルが作成されていることを確認：

- ✅ users
- ✅ goals
- ✅ training_plans
- ✅ workout_sessions
- ✅ workout_records
- ✅ physical_stats
- ✅ consultations
- ✅ achievements
- ✅ user_achievements
- ✅ user_sessions
- ✅ task_reminders
- ✅ conversation_history
- ✅ api_keys
- ✅ llm_models
- ✅ settings
- ✅ system_logs

### 5.2 シードデータ確認
以下のテーブルにシードデータが投入されているか確認：

- **achievements**: 30件のアチーブメント定義
- **settings**: 28件のシステム設定
- **llm_models**: 7件のLLMモデル定義

シードデータ適用：
```bash
# Supabase Dashboard > SQL Editor で以下を実行
# supabase/seed.sql の内容を貼り付けて実行
```

## 6. 開発サーバー起動

```bash
npm run dev
# または
pnpm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 7. LINE Webhook設定

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. チャネルを選択
3. **Messaging API settings** へ移動
4. **Webhook URL** を設定：
   - ローカル開発: ngrok等でトンネルを作成 `https://your-ngrok-url.ngrok.io/api/line/webhook`
   - 本番環境: Vercelデプロイ後の URL `https://your-app.vercel.app/api/line/webhook`
5. **Webhook** を有効化
6. **Use webhook** を ON に設定

### ngrokでローカル開発する場合

```bash
# ngrokをインストール（未インストールの場合）
brew install ngrok

# トンネルを作成
ngrok http 3000

# 表示されたURLをLINE Webhook URLに設定
# 例: https://xxxx-xxxx-xxxx.ngrok-free.app/api/line/webhook
```

## 8. 動作確認

### 8.1 Webhook接続確認
LINEで友だち追加し、メッセージを送信して応答があることを確認。

### 8.2 データベース接続確認
```bash
# TypeScript型チェック
npm run type-check

# Lint実行
npm run lint

# テスト実行（テスト追加後）
npm run test:unit
```

## 9. トラブルシューティング

### エラー: "Cannot connect to Supabase"
- `.env.local` の `SUPABASE_URL` と `SUPABASE_ANON_KEY` が正しいか確認
- Supabaseプロジェクトが一時停止していないか確認（Dashboard > Settings > General）

### エラー: "LINE signature verification failed"
- `.env.local` の `LINE_CHANNEL_SECRET` が正しいか確認
- Webhook URLが正しく設定されているか確認

### エラー: "OpenAI API error"
- `.env.local` の `OPENAI_API_KEY` が正しいか確認
- OpenAI APIの使用量制限を確認

## 10. 次のステップ

✅ Supabase環境構築完了
⬜ Goal Setting ドメイン実装
⬜ Webhook経路のテスト整備
⬜ LINEメッセージテンプレート実装

詳細は `implementation-plan.md` を参照してください。

## 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [LINE Messaging API Reference](https://developers.line.biz/ja/reference/messaging-api/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

