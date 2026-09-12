"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50 border-green-200",
    iconColor: "text-green-500",
    textColor: "text-green-800",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50 border-red-200",
    iconColor: "text-red-500",
    textColor: "text-red-800",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-500",
    textColor: "text-amber-800",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    textColor: "text-blue-800",
  },
};

export default function NotificationToast({
  message,
  type = "info",
  onClose,
  autoDismiss = true,
  duration = 5000,
}: NotificationToastProps) {
  const [visible, setVisible] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    setVisible(true);
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[100] flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-xl border shadow-lg transition-all duration-300",
        config.bg,
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <p className={cn("text-sm font-medium flex-1", config.textColor)}>
        {message}
      </p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className={cn(
          "p-1 rounded-lg hover:bg-black/5 shrink-0",
          config.textColor
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
