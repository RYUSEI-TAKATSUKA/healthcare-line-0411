export interface LineUserSource {
  type: 'user' | 'group' | 'room';
  userId?: string;
  groupId?: string;
  roomId?: string;
}

export interface LineTextMessage {
  id?: string;
  type: 'text';
  text: string;
}

export interface LineMessageEvent {
  type: 'message';
  message: LineTextMessage | Record<string, unknown>;
  replyToken: string;
  source: LineUserSource;
  timestamp: number;
  mode?: 'active' | 'standby';
}

export type LineWebhookEvent = LineMessageEvent | Record<string, any>;

export interface LineWebhookBody {
  destination?: string;
  events: LineWebhookEvent[];
}

export interface LineReplyMessage {
  type: string;
  [key: string]: unknown;
}
