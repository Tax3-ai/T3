import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, phone, agents, message } = body;
    if (!name || !email || !company) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const agentList = Array.isArray(agents) && agents.length > 0 ? agents.join(', ') : 'Not specified';
      const text = `🤖 *New Axon AI Demo Request*\n\n👤 *Name:* ${name}\n🏢 *Company:* ${company}\n📧 *Email:* ${email}\n📞 *Phone:* ${phone||'Not provided'}\n\n🧠 *Agents:* ${agentList}\n\n💬 *Message:* ${message||'None'}\n\n⏰ ${new Date().toLocaleString('en-GB',{timeZone:'Europe/London'})}`;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Demo booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
