"use client";

import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-xl border border-brand-gray-700 bg-brand-gray-900 p-4",
        hover && "cursor-pointer hover:border-brand-gray-600 hover:bg-brand-gray-800 transition-all duration-150",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  trend?: number;
  accentColor?: string;
}

export function StatCard({ label, value, subtext, icon, trend, accentColor }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-brand-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p
            className="text-2xl font-bold text-white"
            style={accentColor ? { color: accentColor } : {}}
          >
            {value}
          </p>
          {subtext && <p className="text-xs text-brand-gray-400 mt-1">{subtext}</p>}
          {trend !== undefined && (
            <p
              className={clsx(
                "text-xs mt-1 font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        {icon && (
          <span className="text-2xl ml-3 opacity-80">{icon}</span>
        )}
      </div>
    </Card>
  );
}
