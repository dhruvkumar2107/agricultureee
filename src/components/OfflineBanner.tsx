"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineBannerProps {
  pendingSyncCount?: number;
  onSync?: () => void;
}

export default function OfflineBanner({
  pendingSyncCount = 0,
  onSync,
}: OfflineBannerProps) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800">
      <div className="flex items-center gap-2 text-sm font-medium">
        <WifiOff className="w-4 h-4" />
        <span>You are offline. Data will sync when connection is restored.</span>
        {pendingSyncCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold bg-amber-200 text-amber-900 rounded-full">
            {pendingSyncCount} pending
          </span>
        )}
      </div>
      {onSync && pendingSyncCount > 0 && (
        <button
          onClick={onSync}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry Sync
        </button>
      )}
    </div>
  );
}
