import crypto from 'crypto';

import { LineReplyMessage, LineWebhookEvent } from '../../types/line';

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';

export class LineClient {
  constructor(
    private readonly channelAccessToken: string,
    private readonly channelSecret: string
  ) {}

  verifySignature(body: string, signature: string | null): boolean {
    if (!signature) return false;
    const hash = crypto
      .createHmac('sha256', this.channelSecret)
      .update(body)
      .digest('base64');
    return hash === signature;
  }

  async replyMessage(
    replyToken: string,
    messages: LineReplyMessage[]
  ): Promise<void> {
    await this.request(`${LINE_MESSAGING_API}/reply`, {
      replyToken,
      messages,
    });
  }

  async pushMessage(to: string, messages: LineReplyMessage[]): Promise<void> {
    await this.request(`${LINE_MESSAGING_API}/push`, { to, messages });
  }

  // eslint-disable-next-line class-methods-use-this
  extractUserId(event: LineWebhookEvent): string | null {
    if ('source' in event && event.source && 'userId' in event.source) {
      return event.source.userId ?? null;
    }
    return null;
  }

  private async request(url: string, body: Record<string, unknown>) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.channelAccessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `LINE API request failed: ${response.status} ${response.statusText} - ${text}`
      );
    }
  }
}
