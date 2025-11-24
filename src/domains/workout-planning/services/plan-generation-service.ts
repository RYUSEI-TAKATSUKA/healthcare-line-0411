import { OpenAiClient } from 'src/infrastructure/openai/openai-client';
import { buildPlanDraftPrompt } from '../prompts/plan-draft';

export class PlanGenerationService {
  constructor(private readonly openAi: OpenAiClient) {}

  async generatePlanDescription(input: {
    goalDescription: string;
    environment: string;
    weeklyFrequency: number | null;
    sessionDurationMinutes: number | null;
  }): Promise<string> {
    const prompt = buildPlanDraftPrompt(input);
    const res = await this.openAi.chat([
      { role: 'system', content: 'You are a concise Japanese fitness coach.' },
      { role: 'user', content: prompt },
    ]);
    return res.content;
  }
}
