import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "green" | "blue" | "amber" | "red" | "purple" | "slate";
  subtitle?: string;
}

const colorMap = {
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    trend_up: "text-green-600 bg-green-50",
    trend_down: "text-red-600 bg-red-50",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    trend_up: "text-green-600 bg-green-50",
    trend_down: "text-red-600 bg-red-50",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    trend_up: "text-green-600 bg-green-50",
    trend_down: "text-red-600 bg-red-50",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    trend_up: "text-green-600 bg-green-50",
    trend_down: "text-red-600 bg-red-50",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    trend_up: "text-green-600 bg-green-50",
    trend_down: "text-red-600 bg-red-50",
  },
  slate: {
    bg: "bg-stone-100",
    icon: "text-stone-600",
    trend_up: "text-green-600 bg-green-50",
    trend_down: "text-red-600 bg-red-50",
  },
};

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend = "neutral",
  trendValue,
  color = "green",
  subtitle,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-500 truncate">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-bold text-stone-800 tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-stone-400">{unit}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
          )}
          {trendValue && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium",
                trend === "up" && colors.trend_up,
                trend === "down" && colors.trend_down,
                trend === "neutral" && "text-stone-500 bg-stone-50"
              )}
            >
              {trend === "up" && <TrendingUp className="w-3 h-3" />}
              {trend === "down" && <TrendingDown className="w-3 h-3" />}
              {trend === "neutral" && <Minus className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-2xl shrink-0",
            colors.bg
          )}
        >
          <Icon className={cn("w-6 h-6", colors.icon)} />
        </div>
      </div>
    </div>
  );
}
