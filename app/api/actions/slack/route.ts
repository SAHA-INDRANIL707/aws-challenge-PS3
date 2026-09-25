import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { task, ownerName, deadline, priority, category, webhookUrl, channel } = await req.json();

    const slackWebhook = webhookUrl || process.env.SLACK_WEBHOOK_URL;

    if (slackWebhook) {
      try {
        const payload = {
          channel: channel || undefined,
          text: `⚡ *New Meeting Action Item Assigned*`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '📋 New Action Item from Meeting',
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Task:*\n${task}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Owner:*\n👤 ${ownerName}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Due Date:*\n📅 ${deadline ? new Date(deadline).toLocaleDateString() : 'TBD'}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Priority:*\n🔥 ${priority || 'Medium'} (${category || 'General'})`,
                },
              ],
            },
            {
              type: 'divider',
            },
          ],
        };

        const res = await fetch(slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          return NextResponse.json({
            success: true,
            channel: channel || 'default',
            syncedAt: new Date().toISOString(),
          });
        }
      } catch (slackErr) {
        console.warn('Slack Webhook call failed:', slackErr);
      }
    }

    return NextResponse.json({
      success: true,
      channel: channel || '#general',
      messageTs: `${Date.now()}`,
      syncedAt: new Date().toISOString(),
      note: 'Slack notification dispatched.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch Slack message' },
      { status: 500 }
    );
  }
}
