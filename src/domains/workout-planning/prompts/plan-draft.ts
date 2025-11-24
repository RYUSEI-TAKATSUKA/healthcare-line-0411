export const buildPlanDraftPrompt = (params: {
  goalDescription: string;
  environment: string;
  weeklyFrequency: number | null;
  sessionDurationMinutes: number | null;
}): string => `
あなたは日本語のフィットネストレーナーです。以下の条件で8週間のトレーニングプラン概要を短く作ってください。

【目標】
${params.goalDescription}

【環境】
${params.environment}

【週あたり回数】
${params.weeklyFrequency ?? '未指定'} 回

【1回の時間】
${params.sessionDurationMinutes ?? '未指定'} 分

出力形式（3-5行程度で簡潔に）:
- プラン概要（1行）
- 週のメニュー例（種目と回数/時間）
- 推奨頻度と所要時間
- リカバリー/栄養の簡易アドバイス
`.trim();
