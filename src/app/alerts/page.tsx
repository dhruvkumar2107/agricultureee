"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertCard from "@/components/AlertCard";
import EmptyState from "@/components/EmptyState";
import { AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/alerts")
        .then((r) => r.json())
        .then((d) => { setAlerts(d.alerts || []); setFetching(false); })
        .catch(() => setFetching(false));
    }
  }, [user]);

  const handleAcknowledge = async (id: string) => {
    await fetch(`/api/alerts`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "acknowledged" }) });
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "acknowledged" } : a));
  };

  const handleResolve = async (id: string) => {
    await fetch(`/api/alerts`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "resolved" }) });
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "resolved" } : a));
  };

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading alerts..." className="py-20" />;
  if (!user) return null;

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.status === filter);
  const counts = { all: alerts.length, new: alerts.filter((a) => a.status === "new").length, acknowledged: alerts.filter((a) => a.status === "acknowledged").length, resolved: alerts.filter((a) => a.status === "resolved").length };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Alerts</h2>
        <p className="text-sm text-stone-500 mt-1">Monitor and manage system alerts</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "new", "acknowledged", "resolved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              filter === f ? "bg-green-600 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50")}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No alerts" description="All clear! No alerts to show." />
      ) : (
        <div className="space-y-3">
          {filtered.map((alert: any) => (
            <AlertCard key={alert.id} alert={{
              id: alert.id,
              type: alert.type,
              severity: alert.severity,
              title: alert.title,
              message: alert.message,
              status: alert.status === "new" ? "active" : alert.status,
              time: new Date(alert.createdAt).toLocaleString(),
              station: alert.station?.stationId,
              confidence: alert.confidence,
            }} onAcknowledge={handleAcknowledge} onResolve={handleResolve} />
          ))}
        </div>
      )}
    </div>
  );
}
