# 本番環境デプロイチェックリスト

## 現在の状態（2024-11-24）

### ✅ 完了済み
- [x] Supabaseプロジェクト作成（vdeduxscrgmimmlbitod）
- [x] データベーススキーマ適用（16テーブル）
- [x] RLSポリシー適用
- [x] 開発環境の `.env.local` 設定
- [x] 接続テスト成功

### ❌ 未完了（本番実行に必須）
- [ ] **シードデータ投入**（最優先）
- [ ] Vercelプロジェクト作成
- [ ] Vercel環境変数設定
- [ ] LINE Webhook URL設定
- [ ] 本番動作確認

---

## 📋 詳細TODO

### 1. シードデータ投入 🔴 最優先

#### 方法A: Supabase Dashboard（推奨）
```
URL: https://supabase.com/dashboard/project/vdeduxscrgmimmlbitod
手順:
1. 左メニュー > SQL Editor
2. New query
3. supabase/seed.sql の内容をコピー&ペースト
4. Run（右上の緑ボタン）をクリック
5. 成功メッセージ確認
```

#### 方法B: CLI（Docker必要）
```bash
# Dockerを起動してから実行
npx supabase db seed --project-ref vdeduxscrgmimmlbitod
```

#### 検証コマンド
```bash
# シードデータ投入後に実行
node -r dotenv/config -r ts-node/register scripts/test-supabase-connection.ts dotenv_config_path=.env.local

# 期待結果:
# - achievements: 30件
# - settings: 28件
# - llm_models: 7件
```

---

### 2. Vercelデプロイ設定 🟡

#### 2-1. Vercelプロジェクト作成
```bash
# Vercel CLIインストール（未インストールの場合）
npm install -g vercel

# Vercelにログイン
vercel login

# プロジェクトをリンク
vercel link

# または Vercel Dashboard から手動作成
# https://vercel.com/new
```

#### 2-2. Vercel環境変数設定
Vercel Dashboard > Settings > Environment Variables に以下を設定：

**必須環境変数**:
```bash
# LINE Messaging API
LINE_CHANNEL_ID=<your_value>
LINE_CHANNEL_SECRET=<your_value>
LINE_CHANNEL_ACCESS_TOKEN=<your_value>

# Supabase
SUPABASE_URL=https://vdeduxscrgmimmlbitod.supabase.co
SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_KEY=<your_service_role_key>

# OpenAI
OPENAI_API_KEY=<your_openai_key>

# Optional: Anthropic
ANTHROPIC_API_KEY=<your_anthropic_key>

# Optional: Google
GOOGLE_API_KEY=<your_google_key>

# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**重要**: 以下の環境で設定
- ✅ Production
- ✅ Preview
- ⬜ Development（ローカルは .env.local を使用）

---

### 3. LINE Webhook設定 🟡

#### 3-1. Webhook URL設定
1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. チャネルを選択
3. Messaging API settings
4. Webhook URL を設定:
   ```
   https://your-app.vercel.app/api/line/webhook
   ```
5. **Use webhook** を ON
6. **Verify** ボタンで疎通確認

#### 3-2. LINE Bot設定確認
- [ ] Auto-reply messages: OFF（オフにしないと二重返信）
- [ ] Greeting messages: ON（任意）
- [ ] Webhook: ON
- [ ] Bot information: 公開設定

---

### 4. デプロイ実行 🟢

#### 4-1. ビルド確認（ローカル）
```bash
# 型チェック
npm run type-check

# Lint
npm run lint

# ビルドテスト
npm run build
```

#### 4-2. Vercelデプロイ
```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

#### 4-3. デプロイ後の確認
- [ ] Vercel Dashboard でビルドログ確認
- [ ] `https://your-app.vercel.app` にアクセスして200応答確認
- [ ] Webhook URL `https://your-app.vercel.app/api/line/webhook` が応答することを確認

---

### 5. 本番動作確認 🟢

#### 5-1. LINE Bot動作確認
1. LINE で Bot を友だち追加
2. メッセージ送信テスト
3. 期待動作:
   - [ ] メッセージが届く
   - [ ] Bot が返信する
   - [ ] エラーが発生しない

#### 5-2. データベース動作確認
Supabase Dashboard > Table Editor で確認:
- [ ] `users` テーブルにユーザーが作成される
- [ ] `user_sessions` にセッションが作成される
- [ ] `conversation_history` に会話が記録される

#### 5-3. ログ確認
- [ ] Vercel Dashboard > Logs でエラーがないか確認
- [ ] Supabase Dashboard > Logs API でクエリログ確認
- [ ] `system_logs` テーブルにログが記録されているか確認

---

## 🔧 トラブルシューティング

### エラー: "Cannot connect to Supabase"
**原因**: 環境変数が設定されていない  
**対処**:
1. Vercel Dashboard > Settings > Environment Variables を確認
2. 再デプロイ: `vercel --prod`

### エラー: "LINE signature verification failed"
**原因**: `LINE_CHANNEL_SECRET` が間違っている  
**対処**:
1. LINE Developers Console で Channel secret を再確認
2. Vercel環境変数を修正
3. 再デプロイ

### エラー: "Row Level Security policy violation"
**原因**: RLSポリシーが厳しすぎる  
**対処**:
1. LINE Bot からのリクエストは `SUPABASE_SERVICE_KEY` を使用
2. `src/infrastructure/supabase/client.ts` でサービスロールクライアント使用を確認

### Webhook が反応しない
**チェック項目**:
- [ ] LINE Webhook URL が正しいか
- [ ] Webhook が ON になっているか
- [ ] Vercel でデプロイが成功しているか
- [ ] Vercel Functions のタイムアウト設定（デフォルト10秒）

---

## 📊 環境別設定まとめ

| 環境 | 設定場所 | 用途 |
|------|----------|------|
| ローカル開発 | `.env.local` | 開発・テスト |
| Vercel Preview | Vercel Env Vars (Preview) | PRレビュー |
| Vercel Production | Vercel Env Vars (Production) | 本番環境 |

---

## 🚀 デプロイフロー（推奨）

1. **ローカルで開発**
   ```bash
   npm run dev
   ```

2. **ブランチ作成 & Push**
   ```bash
   git checkout -b feature/your-feature
   git add .
   git commit -m "Add: your feature"
   git push origin feature/your-feature
   ```

3. **PRを作成**
   - GitHub で Pull Request を作成
   - Vercel が自動的に Preview デプロイ
   - Preview URL で動作確認

4. **main にマージ**
   - PR を merge
   - Vercel が自動的に Production デプロイ

5. **本番確認**
   - LINE Bot で動作確認
   - ログ確認

---

## 📝 次の作業優先順位

### 🔴 今すぐ（本番実行の前提）
1. **シードデータ投入**
   - Supabase Dashboard から seed.sql 実行
   - または Docker起動後 `npx supabase db seed`

### 🟡 本番デプロイ前（今週中）
2. **Vercelプロジェクト作成 & 環境変数設定**
3. **初回デプロイ（Preview環境）**
4. **LINE Webhook URL設定（Preview用）**
5. **Preview環境で動作確認**

### 🟢 本番デプロイ（動作確認後）
6. **本番デプロイ実行**
7. **LINE Webhook URL変更（本番用）**
8. **本番動作確認**
9. **監視・ログ設定**

---

## 🔐 セキュリティチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] `SUPABASE_SERVICE_KEY` は Vercel 環境変数のみに設定（リポジトリにコミットしない）
- [ ] RLSポリシーが有効（全16テーブル）
- [ ] LINE署名検証が有効（`LINE_VERIFY_SIGNATURE=true`）
- [ ] OpenAI API Key の使用量制限設定
- [ ] Supabase Database のバックアップ設定確認

---

## 📞 サポート情報

**Supabase Dashboard**: https://supabase.com/dashboard/project/vdeduxscrgmimmlbitod  
**Vercel Dashboard**: https://vercel.com/dashboard  
**LINE Developers Console**: https://developers.line.biz/console/

---

**最終更新**: 2024-11-24  
**ステータス**: シードデータ投入待ち → Vercel デプロイ待ち

