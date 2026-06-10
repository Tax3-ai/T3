import { REPAIR_STATUSES } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const s = REPAIR_STATUSES.find((r) => r.value === status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${s?.color ?? "bg-gray-600"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
      {s?.label ?? status}
    </span>
  );
}
