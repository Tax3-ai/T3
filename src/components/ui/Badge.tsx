"use client";

import { clsx } from "clsx";

type BadgeVariant =
  | "default"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "gray"
  | "instagram"
  | "tiktok";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-brand-gray-700 text-brand-gray-200",
  red: "bg-brand-red/20 text-brand-red border border-brand-red/30",
  green: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  gray: "bg-brand-gray-700 text-brand-gray-400",
  instagram: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 border border-pink-500/30",
  tiktok: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
};

export function Badge({ children, variant = "default", className, style }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
        variants[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <Badge variant={platform === "INSTAGRAM" ? "instagram" : "tiktok"}>
      {platform === "INSTAGRAM" ? "📸" : "🎵"} {platform}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    PUBLISHED: "green",
    APPROVED: "blue",
    PENDING_APPROVAL: "yellow",
    SCHEDULED: "blue",
    DRAFT: "gray",
    FAILED: "red",
  };
  return <Badge variant={map[status] ?? "gray"}>{status.replace("_", " ")}</Badge>;
}

export function ApprovalBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    APPROVED: "green",
    PENDING: "yellow",
    REJECTED: "red",
    AUTO_APPROVED: "blue",
  };
  return <Badge variant={map[status] ?? "gray"}>{status.replace("_", " ")}</Badge>;
}
