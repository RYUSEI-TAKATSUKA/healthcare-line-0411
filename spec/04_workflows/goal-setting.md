# 目標設定フロー

本ドキュメントでは、LINEフィットネスBOT における目標設定機能のユーザーフローと実装の詳細を定義します。

---

## 1. 機能概要
目標設定機能は、ユーザーの健康・フィットネス目標を LLM を活用した対話形式で設定し、SMART（Specific, Measurable, Achievable, Relevant, Time-bound）な形に変換します。

---

## 2. ユーザーフロー図

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Bot as LINEフィットネスBOT
    participant LLM as LLMサービス
    participant DB as データベース

    User->>Bot: 「目標設定」リッチメニュー選択
    Bot->>DB: ユーザー情報確認 (users.id, users.display_name)
    DB->>Bot: ユーザーデータ返却
    Bot->>User: 目標設定ウィザード開始案内
    
    alt 初回設定
        Bot->>User: 現在の健康状態確認質問
        User->>Bot: 回答（運動頻度・既往症など）
        Bot->>DB: ユーザー情報更新 (usersテーブル & physical_statsテーブル)
        note right of Bot: 体重などの身体データは履歴管理のため<br>physical_statsにも初期レコードを作成推奨
    end
    
    Bot->>User: 達成したい目標の質問
    User->>Bot: 目標の希望伝達（例: 「体重を減らしたい」）
    Bot->>DB: 会話履歴保存 (conversation_history.user_message, conversation_history.context_data)
    
    Bot->>LLM: 目標分析リクエスト
    LLM->>Bot: 追加質問推奨
    
    Bot->>User: 詳細質問（期間・目標数値など）
    User->>Bot: 詳細回答
    Bot->>DB: 会話履歴保存 (conversation_history.user_message, conversation_history.context_data)
    
    Bot->>LLM: SMART目標生成リクエスト
    LLM->>Bot: 具体的なSMART目標案
    
    Bot->>User: 目標案提示と確認
    User->>Bot: 目標の承認または修正要求
    
    alt 修正要求
        User->>Bot: 修正点指摘
        Bot->>DB: 会話履歴保存 (conversation_history.user_message)
        Bot->>LLM: 目標修正リクエスト
        LLM->>Bot: 修正済み目標
        Bot->>User: 修正版提示と再確認
        User->>Bot: 最終承認
    end
    
    Bot->>DB: 目標情報保存 (goals.goal_type, goals.description, goals.target_metrics, goals.start_date, goals.target_date)
    DB->>Bot: 保存確認
    
    Bot->>User: 目標設定完了・トレーニング計画提案
    Bot->>DB: 会話履歴最終保存 (conversation_history.bot_message, conversation_history.context_data)

    note over DB: 操作テーブル一覧:
    note over DB: - users: ユーザー基本情報
    note over DB: - goals: ユーザーの健康・フィットネス目標
    note over DB: - conversation_history: LLMとの対話履歴
```

---

## 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> 初期状態
    初期状態 --> 健康状態確認: 初回のみ
    初期状態 --> 目標希望ヒアリング: 2回目以降
    健康状態確認 --> 目標希望ヒアリング: 回答受領
    目標希望ヒアリング --> 詳細質問: 回答受領
    詳細質問 --> SMART目標提案: 回答受領
    SMART目標提案 --> 修正ヒアリング: 修正要求
    SMART目標提案 --> 目標確定: 承認
    修正ヒアリング --> SMART目標提案: 修正済み目標生成
    目標確定 --> トレーニング計画提案: 保存完了
    トレーニング計画提案 --> [*]
```

---

## 4. 実装詳細

### 4.1 目標タイプ分類
| コード | 分類 | 例 |
| --- | --- | --- |
| weight_loss | 減量 | 体重減少、体脂肪率減少 |
| muscle_gain | 筋肉増強 | 筋肉量増加、筋力向上 |
| endurance | 持久力向上 | 走行距離/時間向上 |
| flexibility | 柔軟性向上 | 柔軟性数値向上 |
| health_recovery | 健康回復 | 特定症状の改善 |
| habit_formation | 習慣形成 | 運動習慣の定着 |

### 4.2 メッセージテンプレート

#### 開始メッセージ
```
フィットネス目標を一緒に設定しましょう！
具体的で達成可能な目標を立てることが成功への第一歩です。
まずはどのような目標をお持ちですか？
（例: 体重を減らしたい、筋肉をつけたい、マラソン完走など）
```

#### 詳細質問（体重減少例）
```
体重減少が目標なのですね。
より具体的な計画を立てるために、以下の情報を教えていただけますか？

1. 現在の体重は？（kg）
2. 目標体重は？（kg）
3. どのくらいの期間で達成したいですか？（〇ヶ月）
4. 週に何回くらい運動できそうですか？
```

#### SMART目標提案
```
あなたの情報を基に、以下の目標はいかがでしょうか？

【目標】
3ヶ月で体重を60kgから55kgに減らす（-5kg）

【スケジュール】
- 1ヶ月目: -2kg（58kg）
- 2ヶ月目: -1.5kg（56.5kg）
- 3ヶ月目: -1.5kg（55kg）

【アプローチ】
- 週3回、30分の有酸素運動
- 週2回の筋力トレーニング
- 1日の摂取カロリー約1,800kcalを目安に

この目標でよろしいですか？
```

### 4.3 LLMプロンプト例

#### 目標分析プロンプト
```
あなたはフィットネス専門トレーナーです。ユーザーが示した目標「{{user_goal}}」を分析し、SMART（Specific, Measurable, Achievable, Relevant, Time-bound）な目標に変換するための追加情報を収集するための質問を3つ考えてください。ユーザープロフィール:
- 性別: {{gender}}
- 年齢: {{age}}
- 身長: {{height}}cm
- 体重: {{weight}}kg
- 運動頻度: {{exercise_frequency}}
```

#### SMART目標生成プロンプト
```
ユーザーの情報と希望を基に、フィットネス目標をSMART形式で具体化してください。
- 目標タイプ: {{goal_type}}
- ユーザー情報: {{user_profile}}
- 希望: {{user_wish}}
- 期間: {{timeframe}}
- 制約条件: {{constraints}}

以下の形式で回答してください：
1. 具体的な数値目標
2. 月単位の小目標
3. 週間トレーニング計画の概要
4. 食事に関する一般的アドバイス
```

### 4.4 主要データモデル

#### 4.4.1 目標の基本構造
 - 詳細は data-model.md 参照

```typescript
interface Goal {
  id: string;
  user_id: string;
  goal_type: GoalType; // 'weight_loss' | 'muscle_gain' | 'endurance' | ...
  description: string;
  motivation?: string; // ユーザーの目標達成動機
  target_metrics: {
    start_value: number;
    target_value: number;
    unit: string;
  };
  start_date: Date;
  target_date: Date;
  progress_percentage: number; // 0-100%
  status: 'active' | 'achieved' | 'abandoned';
  created_at: Date;
  updated_at: Date;
}
```

### 4.5 テーブル別 DB 操作一覧（クロス表）

凡例: C = Create (INSERT) | R = Read (SELECT) | U = Update (UPDATE) | D = Delete (DELETE)

イベントは時系列順。ループする操作は「※繰返」と表記。

##### 1. users テーブル

| いつ発生するか | 操作 | 主な列 / 補足 |
|--------------|-----|-------------|
| ウィザード開始 | R | id, age, height_cm, initial_weight_kg, ... — プロフィール取得 |
| 初回プロフィール入力 | U | 欠損していた age, height_cm, initial_weight_kg を更新 |
| 既存目標の再設定判定 | R | id, preferences などを読み、前回目標を持つか確認 |

##### 2. goals テーブル

| いつ発生するか | 操作 | 主な列 / 補足 |
|--------------|-----|-------------|
| 目標確定（BEGIN...COMMIT 内） | C | id(ULID), user_id, goal_type, description, target_metrics, start_date, target_date など |
| 目標再設定チェック | R | user_id, status — 最新のアクティブ目標を取得 |
| 進捗更新バッチ（別機能） | U | progress_percentage／status を更新 |

##### 3. conversation_history テーブル

| いつ発生するか | 操作 | 主な列 / 補足 |
|--------------|-----|-------------|
| 各 Q&A 後 ※繰返 | C | id(ULID), user_id, message_type='user'/'bot', payload, created_at |
| SMART 草案生成直後 | C | message_type='draft' |
| ユーザーが承認 | U | status='confirmed' |
| 目標確定トランザクション | C | message_type='system', payload='goal_committed' |
| ロールバック発生時 | – | トランザクション全体を ROLLBACK—直前の 2 INSERT が取消 |

---

## 5. バリデーション & 制約

- 目標減量速度: 健康的な減量は週0.5-1kgまで、それ以上は警告
- 目標期間: 最短2週間～最長1年の範囲内
- 体重増加目標: 健康的な筋肉増加は月1-2kgまで
- 不健康な目標の拒否: 危険な減量目標などは設定不可・代替提案

---

## 6. 関連ドキュメント
- データモデル: [`database_design.md`](../02_data_model/database_design.md)

---

> **更新履歴**
> - 2024-04-11: 初版作成 