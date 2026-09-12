"use client";

import {
  AlertTriangle,
  Thermometer,
  Droplets,
  Bug,
  Battery,
  WifiOff,
  CheckCircle,
  Clock,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  action?: string;
  status: "active" | "acknowledged" | "resolved";
  time: string;
  station?: string;
  confidence?: number;
}

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

const severityConfig = {
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-50/50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  critical: {
    border: "border-l-red-500",
    bg: "bg-red-50/50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
};

const typeIcons: Record<string, LucideIcon> = {
  temperature: Thermometer,
  moisture: Droplets,
  pest: Bug,
  battery: Battery,
  offline: WifiOff,
  disease: AlertTriangle,
  crop_health: Sprout,
};

export default function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
}: AlertCardProps) {
  const severity = severityConfig[alert.severity] || severityConfig.info;
  const Icon = typeIcons[alert.type] || AlertTriangle;

  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200 border-l-4 p-4 shadow-sm",
        severity.border,
        severity.bg
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
            severity.iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", severity.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-stone-800">{alert.title}</h4>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 shrink-0">
              <Clock className="w-3 h-3" />
              {alert.time}
            </div>
          </div>
          <p className="text-sm text-stone-600 mt-1 leading-relaxed">
            {alert.message}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
            {alert.station && <span>Station: {alert.station}</span>}
            {alert.confidence !== undefined && (
              <span className="font-medium text-stone-500">
                Confidence: {alert.confidence}%
              </span>
            )}
          </div>

          {/* Actions */}
          {alert.status === "active" && (
            <div className="flex items-center gap-2 mt-3">
              {onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Acknowledge
                </button>
              )}
              {onResolve && (
                <button
                  onClick={() => onResolve(alert.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolve
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
