export function generateJobNumber(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `JOB-${y}${m}${day}-${rand}`;
}

export function generateOrderNumber(): string {
  return `ORD-${Math.floor(Math.random() * 90000) + 10000}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
