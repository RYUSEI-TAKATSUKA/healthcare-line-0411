import { OpenAiClient } from 'src/infrastructure/openai/openai-client';
import { buildGoalDraftPrompt } from '../prompts/goal-draft';

export class GoalDraftService {
  constructor(private readonly openAi: OpenAiClient) {}

  async generateDraft(baseline: string, desiredOutcome: string): Promise<string> {
    const prompt = buildGoalDraftPrompt({ baseline, desired: desiredOutcome });
    const response = await this.openAi.chat([
      { role: 'system', content: 'You are a concise Japanese fitness coach.' },
      { role: 'user', content: prompt },
    ]);
    return response.content;
  }
}
