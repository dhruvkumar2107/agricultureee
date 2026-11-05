"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Wifi,
  Droplets,
  FlaskConical,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  Code2,
} from "lucide-react";
import { useFirebaseRealtimeSensor } from "@/lib/use-firebase-sensor";
import { cn } from "@/lib/utils";

interface FirebaseLiveSensorCardProps {
  deviceId?: string;
  className?: string;
  showLinkToSoil?: boolean;
}

export default function FirebaseLiveSensorCard({
  deviceId = "esp32_01",
  className,
  showLinkToSoil = true,
}: FirebaseLiveSensorCardProps) {
  const { data, isConnected, lastUpdated, loading, error } = useFirebaseRealtimeSensor(deviceId);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const handleSyncToDb = async () => {
    try {
      setSyncing(true);
      setSyncStatus(null);
      const res = await fetch("/api/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus("Saved to database!");
        setTimeout(() => setSyncStatus(null), 3000);
      } else {
        setSyncStatus(`Sync failed: ${json.error}`);
      }
    } catch (err: any) {
      setSyncStatus(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const getMoistureStatus = (val?: number) => {
    if (val === undefined) return { label: "Unknown", color: "text-stone-500", bg: "bg-stone-100" };
    if (val > 80) return { label: "High / Saturated", color: "text-blue-700", bg: "bg-blue-50" };
    if (val >= 35) return { label: "Optimal Moisture", color: "text-emerald-700", bg: "bg-emerald-50" };
    return { label: "Low / Dry", color: "text-amber-700", bg: "bg-amber-50" };
  };

  const getPhStatus = (ph?: number) => {
    if (ph === undefined || ph === null) return { label: "Unknown", color: "text-stone-500", bg: "bg-stone-100" };
    if (ph === 0) return { label: "Sensor Standby", color: "text-stone-600", bg: "bg-stone-100" };
    if (ph < 6) return { label: "Acidic Soil", color: "text-amber-700", bg: "bg-amber-50" };
    if (ph <= 7.5) return { label: "Neutral / Optimal", color: "text-emerald-700", bg: "bg-emerald-50" };
    return { label: "Alkaline Soil", color: "text-indigo-700", bg: "bg-indigo-50" };
  };

  const moistureInfo = getMoistureStatus(data?.moisture);
  const phInfo = getPhStatus(data?.ph);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-green-50/40 p-6 shadow-sm shadow-emerald-500/5",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-md shadow-emerald-700/20">
            <Radio className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-800">
                ESP32 IoT Node ({deviceId})
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Realtime
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
              <span>Path: <code className="font-mono text-emerald-700">devices/{deviceId}/latest</code></span>
              <span>•</span>
              <span className="text-stone-400">cultivation-raspberry</span>
            </p>
          </div>
        </div>

        {/* Live status indicators and action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Wifi className="h-3.5 w-3.5" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-500">
              <Clock className="h-3.5 w-3.5" />
              Connecting...
            </span>
          )}

          <button
            onClick={handleSyncToDb}
            disabled={syncing || !data}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-50"
            title="Snapshot this live reading to PostgreSQL database"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
            {syncing ? "Saving..." : "Snapshot"}
          </button>

          {showLinkToSoil && (
            <Link
              href="/soil"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              Soil Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {syncStatus && (
        <div className="mt-3 p-2 text-xs rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          {syncStatus}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Error reading Firebase RTDB: {error}</span>
        </div>
      )}

      {/* Main Sensor Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Soil Moisture */}
        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <Droplets className="h-4 w-4 text-blue-500" />
              Moisture
            </span>
            <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-medium", moistureInfo.bg, moistureInfo.color)}>
              {moistureInfo.label}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              {data?.moisture !== undefined ? data.moisture : "--"}
            </span>
            <span className="text-sm font-semibold text-stone-500">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100 pt-2">
            <span>Raw Signal:</span>
            <span className="font-mono font-medium text-stone-600">
              {data?.moistureRaw !== undefined ? data.moistureRaw : "--"}
            </span>
          </div>
        </div>

        {/* Soil pH */}
        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <FlaskConical className="h-4 w-4 text-purple-500" />
              Soil pH
            </span>
            <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-medium", phInfo.bg, phInfo.color)}>
              {phInfo.label}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              {data?.ph !== undefined ? data.ph : "--"}
            </span>
            <span className="text-sm font-semibold text-stone-500">pH</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100 pt-2">
            <span>Electrode:</span>
            <span className="font-mono font-medium text-stone-600">
              {data?.phVoltage !== undefined ? `${data.phVoltage.toFixed(3)} V` : "-- V"}
            </span>
          </div>
        </div>

        {/* Nitrogen */}
        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <Zap className="h-4 w-4 text-emerald-600" />
              Nitrogen (N)
            </span>
            <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
              Primary
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              {data?.nitrogen !== undefined ? data.nitrogen : "--"}
            </span>
            <span className="text-xs font-semibold text-stone-500">mg/kg</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100 pt-2">
            <span>Target:</span>
            <span className="font-medium text-stone-600">80 - 160</span>
          </div>
        </div>

        {/* Phosphorus */}
        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <Activity className="h-4 w-4 text-amber-600" />
              Phosphorus (P)
            </span>
            <span className="font-mono text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
              Rooting
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              {data?.phosphorus !== undefined ? data.phosphorus : "--"}
            </span>
            <span className="text-xs font-semibold text-stone-500">mg/kg</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100 pt-2">
            <span>Target:</span>
            <span className="font-medium text-stone-600">30 - 70</span>
          </div>
        </div>

        {/* Potassium */}
        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <Zap className="h-4 w-4 text-orange-600" />
              Potassium (K)
            </span>
            <span className="font-mono text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-semibold">
              Immunity
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              {data?.potassium !== undefined ? data.potassium : "--"}
            </span>
            <span className="text-xs font-semibold text-stone-500">mg/kg</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100 pt-2">
            <span>Target:</span>
            <span className="font-medium text-stone-600">100 - 180</span>
          </div>
        </div>
      </div>

      {/* Footer Info & NPK Health Status */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500 border-t border-stone-100 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {data?.npkValid ? (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                NPK Bus Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                NPK Offline / Standby
              </span>
            )}
          </div>
          <span>•</span>
          <span>
            Hardware Epoch:{" "}
            <code className="font-mono text-stone-600">
              {data?.timestamp || "--"}
            </code>
          </span>
          {lastUpdated && (
            <>
              <span>•</span>
              <span className="text-stone-400">
                Client synced: {lastUpdated.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => setShowRaw(!showRaw)}
          className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600"
        >
          <Code2 className="h-3.5 w-3.5" />
          {showRaw ? "Hide Telemetry JSON" : "Inspect Raw JSON"}
        </button>
      </div>

      {/* Raw Payload Inspector */}
      {showRaw && (
        <div className="mt-3 rounded-xl bg-stone-900 p-3.5 text-xs text-emerald-400 font-mono overflow-x-auto shadow-inner">
          <div className="text-stone-400 text-[10px] mb-1">
            // Firebase Realtime Database: /devices/{deviceId}/latest
          </div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
