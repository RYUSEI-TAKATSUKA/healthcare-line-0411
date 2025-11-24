export const buildGoalDraftPrompt = (params: {
  baseline: string;
  desired: string;
}): string => `
あなたはフィットネスの専門トレーナーです。以下のユーザー情報をもとに、SMARTなフィットネス目標を日本語で1つ提案してください。

【現在の状態】
${params.baseline}

【目指す状態】
${params.desired}

以下の形式で簡潔に出力してください：
1) 目標概要（1文）
2) 期間と数値目標（例: 12週間で体重 60kg → 55kg）
3) 週あたりの運動頻度と種目の例（3-4行程度）
4) 食事・リカバリーの簡易指針（2-3行）
`.trim();
