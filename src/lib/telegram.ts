export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("Telegram not configured — skipping alert");
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function telegramMsg(type: string, d: Record<string, string>): string {
  switch (type) {
    case "NEW_LEAD":
      return `🔔 <b>New Lead</b>\n👤 ${d.name} · ${d.phone}\n📱 ${d.device}\n🔧 ${d.fault}\n💷 Estimate: ${d.estimate}`;
    case "JOB_CREATED":
      return `✅ <b>New Job</b> · ${d.jobNumber}\n👤 ${d.name} · ${d.phone}\n📱 ${d.device}\n🔧 ${d.fault}`;
    case "STATUS_CHANGED":
      return `🔄 <b>Status Update</b> · ${d.jobNumber}\n${d.old} → <b>${d.new}</b>\n👤 ${d.name}`;
    case "NEGATIVE_FEEDBACK":
      return `⚠️ <b>Unhappy Customer</b> · ${d.jobNumber}\n👤 ${d.name} · ${d.phone}\n💬 "${d.feedback}"`;
    case "NEW_ORDER":
      return `🛒 <b>New Order</b> · ${d.orderNumber}\n👤 ${d.name}\n💷 £${d.total}`;
    default:
      return `📣 ${type}`;
  }
}
