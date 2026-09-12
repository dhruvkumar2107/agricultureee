import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<string, { color: string; label: string }> = {
  online: { color: "bg-green-100 text-green-700 ring-green-600/20", label: "Online" },
  offline: { color: "bg-red-100 text-red-700 ring-red-600/20", label: "Offline" },
  warning: { color: "bg-amber-100 text-amber-700 ring-amber-600/20", label: "Warning" },
  critical: { color: "bg-red-100 text-red-700 ring-red-600/20", label: "Critical" },
  healthy: { color: "bg-green-100 text-green-700 ring-green-600/20", label: "Healthy" },
  diseased: { color: "bg-red-100 text-red-700 ring-red-600/20", label: "Diseased" },
  info: { color: "bg-blue-100 text-blue-700 ring-blue-600/20", label: "Info" },
  low_battery: { color: "bg-amber-100 text-amber-700 ring-amber-600/20", label: "Low Battery" },
  active: { color: "bg-green-100 text-green-700 ring-green-600/20", label: "Active" },
  inactive: { color: "bg-stone-100 text-stone-600 ring-stone-500/20", label: "Inactive" },
  pending: { color: "bg-blue-100 text-blue-700 ring-blue-600/20", label: "Pending" },
  resolved: { color: "bg-green-100 text-green-700 ring-green-600/20", label: "Resolved" },
  acknowledged: { color: "bg-blue-100 text-blue-700 ring-blue-600/20", label: "Acknowledged" },
};

const dotConfig: Record<string, string> = {
  online: "bg-green-500",
  healthy: "bg-green-500",
  active: "bg-green-500",
  offline: "bg-red-500",
  critical: "bg-red-500",
  diseased: "bg-red-500",
  warning: "bg-amber-500",
  low_battery: "bg-amber-500",
  info: "bg-blue-500",
  pending: "bg-blue-500",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const dotSizes = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  const config = statusConfig[normalizedStatus] || {
    color: "bg-stone-100 text-stone-600 ring-stone-500/20",
    label: status,
  };
  const dotColor = dotConfig[normalizedStatus] || "bg-stone-400";
  const isPulsing = normalizedStatus === "online";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
        sizeClasses[size],
        config.color
      )}
    >
      <span className="relative flex shrink-0">
        {isPulsing && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              dotColor
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full",
            dotSizes[size],
            dotColor
          )}
        />
      </span>
      {config.label}
    </span>
  );
}
