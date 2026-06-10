import { RepairStatus } from "@prisma/client";

export async function sendSMS(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    console.warn("Twilio not configured — SMS skipped");
    return false;
  }
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function statusSMS(
  status: RepairStatus,
  jobNumber: string,
  firstName: string,
  device: string,
  extra?: { price?: number }
): string {
  const name = firstName.split(" ")[0];
  switch (status) {
    case "RECEIVED":
      return `Hi ${name}! We've received your ${device} (Ref: ${jobNumber}). We'll be in touch once we've assessed it. — FixIt Repairs`;
    case "DIAGNOSED":
      return `Hi ${name}, we've diagnosed your ${device}.${extra?.price ? ` Repair cost: £${extra.price}.` : ""} Reply YES to approve or call us to discuss. Ref: ${jobNumber} — FixIt Repairs`;
    case "AWAITING_PARTS":
      return `Hi ${name}, we're waiting on a part for your ${device} (${jobNumber}). We'll update you as soon as it arrives. — FixIt Repairs`;
    case "IN_REPAIR":
      return `Hi ${name}, great news — your ${device} is now being repaired (${jobNumber}). We'll let you know when it's ready! — FixIt Repairs`;
    case "READY":
      return `Hi ${name}, your ${device} is READY for collection! 🎉 Ref: ${jobNumber}. Pop in anytime during opening hours. — FixIt Repairs`;
    case "COLLECTED":
      return `Hi ${name}, thanks for collecting your ${device}. Hope it's working perfectly! We'll check in with you in a few days. — FixIt Repairs`;
    default:
      return `Hi ${name}, your repair job ${jobNumber} has been updated. Please contact us for details.`;
  }
}
