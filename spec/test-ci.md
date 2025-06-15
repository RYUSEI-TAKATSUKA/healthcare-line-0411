# テスト戦略 & CI/CD ワークフロー

本ドキュメントでは LINEフィットネスBOT のテスト戦略、主要テストケース、CI/CD ワークフローをまとめます。

---

## 1. テスト戦略

### 1.1 テストレベル
| レベル | 内容 | 実装方法 |
| --- | --- | --- |
| ユニットテスト | 単一コンポーネント・関数のテスト | Jest / Vitest |
| 統合テスト | 複数コンポーネント間の連携テスト | Jest + Supertest |
| E2Eテスト | 外部依存含む全体フロー検証 | Playwright |

### 1.2 テストカバレッジ目標
- ユニットテスト: 80%以上
- 統合テスト: 主要APIフロー100%、その他60%以上
- E2Eテスト: 主要ユーザーフロー100%

### 1.3 モック戦略
- 外部API（LINE, LLM）は必ずモック化
- DB操作はイン・メモリDBで実施または完全モック化
- サードパーティライブラリはモック可

---

## 2. 主要テストケース

### 2.1 ユニットテスト例
#### Session Manager
- セッション作成・取得・更新・削除
- タイムアウト処理
- 状態遷移の正常系・異常系

#### Prompt Manager
- テンプレート読込・変数置換
- コンテキスト整形（会話履歴取得・フォーマット）
- 過去履歴の適切な切り詰め

#### ドメインロジック
- ユーザー目標からトレーニングプラン生成
- プラン実施状況の進捗計算
- 身体指標の変化率計算

### 2.2 統合テスト例
#### LINE Webhook処理
- メッセージ受信→イベント発行→ハンドラー呼び出し
- リッチメニュー操作→状態遷移
- 複数ターン会話のコンテキスト維持

#### LLM連携
- 目標設定時のプロンプト構築→API呼び出し→結果解析
- エラー時リトライ処理・フォールバック

### 2.3 E2Eテスト例
#### ユーザーフローシナリオ
- 初回登録→目標設定→プラン生成
- タスク記録→進捗確認→目標調整
- 健康相談→関連機能提案

---

## 3. CI/CD パイプライン
GitHub Actions を利用したCI/CD パイプラインを構築します。

### 3.1 ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- 機能開発: `feature/XXX`
- バグ修正: `bugfix/XXX`

### 3.2 CI ワークフロー
```yaml
# .github/workflows/ci.yml (概略)
name: CI

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: pnpm install
      - name: Lint
        run: pnpm lint
      - name: Type check
        run: pnpm type-check
      - name: Unit tests
        run: pnpm test:unit
      - name: Integration tests
        run: pnpm test:integration
      - name: Build
        run: pnpm build
```

### 3.3 CD ワークフロー
```yaml
# .github/workflows/deploy.yml (概略)
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
```

---

## 4. 品質ゲート

下記条件をすべて満たす場合のみ、マージ・デプロイを許可します：

1. 全テスト（ユニット・統合）合格
2. コードカバレッジ基準達成（80%以上）
3. Lint エラーなし
4. 型チェック合格
5. コードレビュー承認 (最低1名)

---

> **更新履歴**
> - 2024-04-11: 初版作成 