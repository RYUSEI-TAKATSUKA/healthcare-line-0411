import { LineClient } from '../../infrastructure/line/line-client';
import { SessionManager } from '../session/session-manager';
import { SessionState } from '../session/session-store';
import { LineWebhookEvent } from '../../types/line';
import { EventHandler, HandlerResult } from './handler';

const defaultHandler: EventHandler = async () => ({
  messages: [
    {
      type: 'text',
      text: 'フィットネスBOTは準備中です。まもなく目標設定フローを開始します。',
    },
  ],
});

export class EventMediator {
  private readonly handlers: EventHandler[];

  constructor(
    private readonly sessionManager: SessionManager,
    handlers: EventHandler[] = []
  ) {
    this.handlers = handlers.length ? handlers : [defaultHandler];
  }

  async handle(event: LineWebhookEvent, lineClient: LineClient): Promise<void> {
    const userId = lineClient.extractUserId(event);
    if (!userId || !('replyToken' in event)) return;

    const session = await this.sessionManager.loadSession(userId);
    const result =
      (await this.executeHandlers(event, session)) ??
      (await defaultHandler(event, session));

    if (!result) return;

    await lineClient.replyMessage(event.replyToken, result.messages);
    await this.sessionManager.saveSession(userId, result.nextState ?? session);
  }

  private async executeHandlers(
    event: LineWebhookEvent,
    session: SessionState
  ): Promise<HandlerResult | null> {
    for (const handler of this.handlers) {
      const result = await handler(event, session);
      if (result) return result;
    }
    return null;
  }
}
