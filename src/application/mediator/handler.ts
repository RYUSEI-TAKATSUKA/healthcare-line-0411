import { LineReplyMessage, LineWebhookEvent } from 'src/types/line';
import { SessionState } from '../session/session-store';

export type HandlerResult = {
  messages: LineReplyMessage[];
  nextState?: SessionState;
};

export type EventHandler = (
  event: LineWebhookEvent,
  session: SessionState
) => Promise<HandlerResult | null>;
