import { LineClient } from '../../infrastructure/line/line-client';
import { SessionManager } from '../session/session-manager';
import { SessionState } from '../session/session-store';
import { LineWebhookEvent } from '../../types/line';
import { EventHandler, HandlerResult } from './handler';
import { UserRepository } from '../../domains/shared/repositories/user-repository';

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
    private readonly userRepository: UserRepository,
    handlers: EventHandler[] = []
  ) {
    this.handlers = handlers.length ? handlers : [defaultHandler];
  }

  async handle(event: LineWebhookEvent, lineClient: LineClient): Promise<void> {
    const externalUserId = lineClient.extractUserId(event);
    if (!externalUserId || !('replyToken' in event)) return;

    const userId = await this.userRepository.findOrCreateByExternalId(externalUserId);

    const eventWithInternalId: LineWebhookEvent = {
      ...event,
      source: {
        ...(event as any).source,
        userId,
      },
    };

    const session = await this.sessionManager.loadSession(userId);
    const result =
      (await this.executeHandlers(eventWithInternalId, session)) ??
      (await defaultHandler(eventWithInternalId, session));

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
