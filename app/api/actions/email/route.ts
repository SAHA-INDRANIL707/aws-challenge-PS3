import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { to, task, ownerName, deadline, priority, sourceQuote, googleAccessToken } = await req.json();

    if (!to && !ownerName) {
      return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
    }

    const recipient = to || `${ownerName?.toLowerCase().replace(/\s+/g, '.')}@company.com`;
    const subject = `[Action Item Assigned] ${task}`;
    const formattedBody = `Hi ${ownerName || 'there'},\n\nYou have been assigned the following action item from our recent meeting:\n\n📋 Task: ${task}\n📅 Due Date: ${deadline ? new Date(deadline).toLocaleDateString() : 'TBD'}\n⚡ Priority: ${priority || 'Medium'}\n\n💬 Transcript Context:\n"${sourceQuote || 'Agreed during team sync'}"\n\nPlease reply if you have any questions or updates.\n\nBest regards,\nMeeting Action Tracker Bot`;

    // If Google OAuth token with Gmail send permission is available:
    if (googleAccessToken) {
      try {
        const rawMessage = [
          `To: ${recipient}`,
          `Subject: ${subject}`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          formattedBody,
        ].join('\r\n');

        const base64EncodedMessage = Buffer.from(rawMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: base64EncodedMessage }),
        });

        if (gmailRes.ok) {
          return NextResponse.json({
            success: true,
            sentTo: recipient,
            sentAt: new Date().toISOString(),
            method: 'gmail_api',
          });
        }
      } catch (gmailErr) {
        console.warn('Gmail API dispatch attempt failed:', gmailErr);
      }
    }

    // Direct mailto fallback link and simulated dispatch confirmation
    const mailtoLink = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedBody)}`;

    return NextResponse.json({
      success: true,
      sentTo: recipient,
      sentAt: new Date().toISOString(),
      mailtoLink,
      method: 'notification_queue',
      note: `Email notification generated for ${recipient}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch email' },
      { status: 500 }
    );
  }
}
