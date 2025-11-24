import { NextRequest, NextResponse } from 'next/server';

import { EventMediator } from 'src/application/mediator/event-mediator';
import { textHandler } from 'src/application/mediator/handlers/text-handler';
import { goalStartHandler } from 'src/domains/goal-setting/handlers/goal-start-handler';
import { goalBaselineHandler } from 'src/domains/goal-setting/handlers/goal-baseline-handler';
import { goalDetailHandler } from 'src/domains/goal-setting/handlers/goal-detail-handler';
import { goalConfirmHandler } from 'src/domains/goal-setting/handlers/goal-confirm-handler';
import { SessionManager } from 'src/application/session/session-manager';
import { LineClient } from 'src/infrastructure/line/line-client';
import { createSupabaseClient } from 'src/infrastructure/supabase/client';
import { SupabaseSessionStore } from 'src/infrastructure/supabase/session-store';
import { LineWebhookBody } from 'src/types/line';

export const runtime = 'nodejs';

let cachedMediator: EventMediator | null = null;
let cachedLineClient: LineClient | null = null;

const getLineClient = (): LineClient => {
  if (cachedLineClient) return cachedLineClient;

  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelAccessToken || !channelSecret) {
    throw new Error('LINE credentials are not configured');
  }

  cachedLineClient = new LineClient(channelAccessToken, channelSecret);
  return cachedLineClient;
};

const getMediator = (): EventMediator => {
  if (cachedMediator) return cachedMediator;
  const supabaseClient = createSupabaseClient();
  const sessionStore = new SupabaseSessionStore(supabaseClient);
  const sessionManager = new SessionManager(sessionStore);

  cachedMediator = new EventMediator(sessionManager, [
    goalStartHandler,
    goalBaselineHandler,
    goalDetailHandler,
    goalConfirmHandler,
    textHandler,
  ]);
  return cachedMediator;
};

export async function POST(req: NextRequest) {
  const lineClient = getLineClient();
  const mediator = getMediator();

  const signature = req.headers.get('x-line-signature');
  const bodyText = await req.text();

  if (!lineClient.verifySignature(bodyText, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(bodyText) as LineWebhookBody;
  } catch (error) {
    return NextResponse.json(
      { error: 'invalid payload', details: String(error) },
      { status: 400 }
    );
  }

  if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json({ status: 'ok' });
  }

  try {
    await Promise.all(
      body.events.map(async (event) => mediator.handle(event, lineClient))
    );
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[webhook] failed to handle event', error);
    return NextResponse.json(
      { error: 'internal error', details: 'failed to process event' },
      { status: 500 }
    );
  }
}
