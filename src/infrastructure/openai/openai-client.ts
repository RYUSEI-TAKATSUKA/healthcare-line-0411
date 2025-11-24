interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  temperature?: number;
  model?: string;
}

interface ChatResponse {
  content: string;
  raw: unknown;
}

export class OpenAiClient {
  constructor(
    private readonly apiKey: string,
    private readonly defaultModel = 'gpt-4o-mini'
  ) {}

  async chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model ?? this.defaultModel,
        messages,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const payload = await response.json();
    const content =
      payload?.choices?.[0]?.message?.content ??
      '一時的な問題が発生しました。時間をおいて再度お試しください。';

    return {
      content,
      raw: payload,
    };
  }
}
