# メッセージ設計

本ドキュメントでは、LINEフィットネスBOT で使用するメッセージ形式・テンプレート、リッチメニューの構成、代表的なサンプル会話を定義します。

---

## 1. リッチメニュー設計
リッチメニューは常時表示される主要操作メニューです。6 つのボタンを配置します。

| 項番 | ラベル         | アクション           | 説明                               |
| ---- | -------------- | -------------------- | ---------------------------------- |
| 1    | 目標設定       | postback: action=goal_menu  | 目標設定フローを開始               |
| 2    | トレーニング計画 | postback: action=plan_menu  | プラン作成／確認／修正画面へ       |
| 3    | 記録・進捗      | postback: action=record_menu| トレーニング／身体指標記録画面へ   |
| 4    | 健康相談       | postback: action=consult_menu| カテゴリ選択→質問入力を開始       |
| 5    | 今日のタスク    | postback: action=today_task | 本日のタスク一覧を表示             |
| 6    | マイページ     | postback: action=mypage_menu| プロフィール・設定画面へ           |

※ postback データは `action=NAME&param=VALUE` のクエリパラメータ形式（URL Search Params準拠）で記述し、BOT 側でパースして対応フローに遷移します。これにより、将来的なパラメータ追加（例: `action=record_menu&type=weight`）に柔軟に対応します。

---

## 2. メッセージテンプレート
### 2.1 テキストメッセージ
- **ウェルカム**:
```
こんにちは！LINEフィットネスBOTへようこそ。
まずはプロフィールを登録しましょう。
性別・年齢・身長・体重を順に教えてください。
```

- **エラーフォールバック**:
```
申し訳ありません、処理中に問題が発生しました。
再度お試しください。
``` 

### 2.2 カルーセルメッセージ
#### トレーニングプラン選択例
```json
{
  "type": "template",
  "altText": "プラン一覧",
  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": "https://.../plan1.png",
        "title": "初心者向けプラン",
        "text": "週3回・30分/回",
        "actions": [{"type":"postback","label":"選択","data":"action=plan_select&id=1"}]
      },
      {
        "thumbnailImageUrl": "https://.../plan2.png",
        "title": "中級者向けプラン",
        "text": "週4回・45分/回",
        "actions": [{"type":"postback","label":"選択","data":"action=plan_select&id=2"}]
      }
    ]
  }
}
```

### 2.3 QuickReply
- **Yes/No 確認**:
```json
{
  "type": "text",
  "text": "このプランで進めますか？",
  "quickReply": {
    "items": [
      {"type":"action","action":{"type":"message","label":"はい","text":"はい"}},
      {"type":"action","action":{"type":"message","label":"いいえ","text":"いいえ"}}
    ]
  }
}
```

---

## 3. サンプル会話
### 3.1 初回利用フロー
```
ユーザー: BOT を友だち追加
BOT: こんにちは！LINEフィットネスBOTへようこそ。
     性別を教えてください。
ユーザー: 女性
BOT: 年齢を教えてください。
ユーザー: 30
BOT: 身長（cm）は？
ユーザー: 165
BOT: 体重（kg）は？
ユーザー: 60
BOT: ありがとうございます！目標設定ウィザードを開始します。
``` 

### 3.2 日常利用フロー
```
BOT: おはようございます！今日のタスクはこちらです。
BOT: [タスク1: 腕立て伏せ 3セット] [タスク2: ジョギング 20分]
ユーザー: タスク1完了
BOT: お疲れ様です！タスク1を記録しました。
BOT: 続けてタスク2を行いますか？ (QuickReply: はい / いいえ)
```

---

> **更新履歴**
> - 2024-04-11: 初版作成 