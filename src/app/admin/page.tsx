"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { Shield, Users, Radio, AlertTriangle, Activity, Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "stations" | "alerts" | "logs">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch("/api/auth/me").then((r) => r.json()),
        fetch("/api/stations").then((r) => r.json()),
        fetch("/api/alerts").then((r) => r.json()),
      ]).then(([meData, stationsData, alertsData]) => {
        setStations(stationsData.stations || []);
        setAlerts(alertsData.alerts || []);
        setFetching(false);
      }).catch(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading admin panel..." className="py-20" />;
  if (!user) return null;

  const tabs = [
    { id: "users" as const, label: "Users", icon: Users },
    { id: "stations" as const, label: "Stations", icon: Radio },
    { id: "alerts" as const, label: "Alerts", icon: AlertTriangle },
    { id: "logs" as const, label: "Activity Logs", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Admin Panel</h2>
        <p className="text-sm text-stone-500 mt-1">System administration and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stations" value={stations.length} icon={Radio} color="blue" />
        <StatCard title="Online" value={stations.filter((s) => s.status === "online").length} icon={Activity} color="green" />
        <StatCard title="Total Alerts" value={alerts.length} icon={AlertTriangle} color="amber" />
        <StatCard title="Critical" value={alerts.filter((a) => a.severity === "critical").length} icon={Shield} color="red" />
      </div>

      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? "bg-green-600 text-white" : "text-stone-500 hover:bg-stone-100"}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        {tab === "users" && (
          <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Registered Users</h3>
            <p className="text-sm text-stone-500 mb-4">User management coming soon. Current users can be managed via the database.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["admin@agrisentinel.com", "farmer@demo.com", "fpo@demo.com"].map((email) => (
                <div key={email} className="flex items-center gap-3 p-4 rounded-xl bg-stone-50">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                    {email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">{email}</p>
                    <p className="text-xs text-stone-400">Active</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "stations" && (
          <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-4">All Stations</h3>
            <div className="space-y-3">
              {stations.map((station: any) => (
                <div key={station.id} className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-700">{station.stationId}</p>
                      <p className="text-xs text-stone-400">{station.name} | Battery: {Math.round(station.battery)}%</p>
                    </div>
                  </div>
                  <StatusBadge status={station.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-4">All Alerts</h3>
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl bg-stone-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${alert.severity === "critical" ? "bg-red-500" : alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <div>
                      <p className="text-sm font-medium text-stone-700">{alert.title}</p>
                      <p className="text-xs text-stone-400">{alert.station?.stationId} | {timeAgo(alert.createdAt)}</p>
                    </div>
                  </div>
                  <StatusBadge status={alert.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "logs" && (
          <div>
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Activity Logs</h3>
            <div className="space-y-3">
              {alerts.slice(0, 8).map((alert: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 text-sm">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="text-stone-500">{timeAgo(alert.createdAt)}</span>
                  <span className="text-stone-700">{alert.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
