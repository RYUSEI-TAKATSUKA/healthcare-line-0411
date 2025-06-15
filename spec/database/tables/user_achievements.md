# user_achievements

ユーザーが獲得した称号・バッジを管理するテーブル

| カラム論理名 | カラム物理名 | データ型 | NULL | 初期値 | 制約 | 説明 |
|------------|------------|---------|------|-------|------|------|
| 記録ID | id | UUID | NO | gen_random_uuid() | PK | 記録一意識別子 |
| ユーザーID | user_id | UUID | NO | | FK | users(id) を参照 |
| アチーブメントID | achievement_id | UUID | NO | | FK | アチーブメントID |
| 獲得日時 | earned_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | 獲得日時 |
| 進捗率 | progress_percentage | INTEGER | YES | NULL | | 獲得前の進捗率（0-100%） |
| 作成日時 | created_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP WITH TIME ZONE | NO | CURRENT_TIMESTAMP | | レコード更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX idx_user_achievements_user_id (user_id)
- INDEX idx_user_achievements_achievement_id (achievement_id)
- UNIQUE INDEX idx_user_achievements_user_achievement (user_id, achievement_id)

**外部キー制約**:
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE

## アチーブメント獲得フロー

1. バックグラウンドジョブがユーザーのアクティビティを監視
2. アチーブメント獲得条件を満たした場合、レコード作成
3. 次回ログイン時または設定された時間にユーザーへ通知
4. ユーザーがアチーブメントを確認

## 進捗管理

- 一部のアチーブメントは事前に進捗状況を記録（ストリークなど）
- `progress_percentage`は獲得前の進捗率を示し、100%で獲得
- 獲得後の`progress_percentage`は特定のアチーブメントで引き続き記録される場合がある（例：最長ストリーク）

## リレーションシップ

- `users` テーブルと多対1 (1人のユーザーが複数のアチーブメントを獲得)
- `achievements` テーブルと多対1 (1つのアチーブメントを複数のユーザーが獲得)

## 通知例

- 「新しいアチーブメント『7日間ストリーク』を獲得しました！」
- 「あと3日で『14日間ストリーク』アチーブメントが獲得できます！」

---

> **更新履歴**
> - 2024-04-11: 初版作成 