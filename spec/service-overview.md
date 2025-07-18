# サービス概要・目的定義

## サービス名
LINEフィットネスBOT

## サービスコンセプト
LINEプラットフォーム上で動作するパーソナルヘルスケアアシスタント。日常的に使う LINE を通じて、ユーザーの健康維持・増進とフィットネス目標達成を支援する。AI（LLM）による個別最適化されたアドバイスと、継続的なモチベーション管理を提供し、ユーザーのフィットネスジャーニーを総合的にサポートする。

## 提供価値（バリュープロポジション）
| 観点 | 詳細 |
| --- | --- |
| アクセシビリティ | 追加アプリ不要。LINE だけで簡単にフィットネス管理が可能 |
| パーソナライズ | LLM を活用した個別化された目標設定とトレーニング計画を提案 |
| 継続性 | 定期的なリマインドと達成度の可視化でモチベーションを維持 |
| 一貫性 | トレーニング記録の一元管理と進捗トラッキングを提供 |
| 専門性 | 科学的根拠に基づく健康・フィットネスアドバイスを提供 |

## ターゲットユーザー
- フィットネス習慣を身につけたいが、複雑なアプリやジム通いに抵抗がある人
- 忙しい社会人で日常的に手軽に健康管理をしたい人
- フィットネス初心者で始め方を迷っている人
- 既に運動習慣があるが、より効率的なトレーニング方法を求めている人
- 健康に関する悩みや質問に対して専門的アドバイスを求める人

## コア機能
| リッチメニュー項目 | 概要 |
| --- | --- |
| 目標設定 | SMART フレームワークを用いた対話型目標設定、進捗確認 |
| トレーニング計画 | 目標に基づくプラン自動生成・カスタマイズ、スケジュール管理 |
| 記録・進捗 | トレーニング実績・身体指標の記録、グラフ表示と分析 |
| 健康相談 | 運動・栄養・体調などの質問に LLM が回答 |
| 今日のタスク | 当日タスク提示、完了報告、リマインド通知 |
| マイページ | プロフィール・設定管理、データエクスポート等 |

## MVP 範囲
1. 目標設定（基本機能）
2. トレーニング計画（自動生成・カスタマイズ・スケジュール管理）
3. 記録（トレーニング実績・身体指標）
4. 健康相談（運動・栄養）
5. 今日のタスク（表示・完了確認）
6. プロフィール管理

## 成功指標（KPI 例）
- 月間アクティブユーザー (MAU)
- 週間タスク完了率
- 目標達成率
- 相談機能利用回数
- 継続率（N 日後リテンション）

## 競合優位性
- LINE という既存プラットフォーム活用による低い導入障壁
- LLM による高精度・個別最適化アドバイス
- リッチメニュー中心の直感的 UI

## ドキュメントリンク
- システム構成: [`architecture.md`](architecture.md)
- データモデル: [`data-model.md`](data-model.md)
- メッセージ設計: [`message-spec.md`](message-spec.md) 