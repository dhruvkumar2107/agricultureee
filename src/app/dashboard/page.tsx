"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Wifi, AlertTriangle, WifiOff, Bell, AlertCircle, Clock, Sprout, Leaf, Droplets, Calculator } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn, timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." className="py-20" />;
  if (!user) return null;

  return <DashboardContent />;
}

function DashboardContent() {
  const [stats, setStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stations").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
    ]).then(([stationsData, alertsData]) => {
      const stations = stationsData.stations || [];
      const alerts = alertsData.alerts || [];
      setStats({
        totalStations: stations.length,
        onlineStations: stations.filter((s: any) => s.status === "online").length,
        warningStations: stations.filter((s: any) => s.status === "warning").length,
        offlineStations: stations.filter((s: any) => s.status === "offline").length,
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter((a: any) => a.severity === "critical").length,
        newAlerts: alerts.filter((a: any) => a.status === "new").length,
      });
      setRecentAlerts(alerts.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stations" value={stats?.totalStations || 0} icon={Radio} color="green" />
        <StatCard title="Online" value={stats?.onlineStations || 0} icon={Wifi} color="green" trend="up" trendValue="Active" />
        <StatCard title="Warnings" value={stats?.warningStations || 0} icon={AlertTriangle} color="amber" />
        <StatCard title="Offline" value={stats?.offlineStations || 0} icon={WifiOff} color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Alerts" value={stats?.totalAlerts || 0} icon={Bell} color="blue" />
        <StatCard title="Critical Alerts" value={stats?.criticalAlerts || 0} icon={AlertCircle} color="red" />
        <StatCard title="New Alerts" value={stats?.newAlerts || 0} icon={Clock} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-8">No alerts yet</p>
            ) : (
              recentAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                  <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", alert.severity === "critical" ? "bg-red-500" : alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">{alert.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{timeAgo(alert.createdAt)}</p>
                  </div>
                  <StatusBadge status={alert.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "View Farms", href: "/farms", icon: Sprout, color: "bg-green-50 text-green-700" },
              { label: "View Stations", href: "/stations", icon: Radio, color: "bg-blue-50 text-blue-700" },
              { label: "Crop Health", href: "/ai-analysis", icon: Leaf, color: "bg-emerald-50 text-emerald-700" },
              { label: "Soil Data", href: "/soil", icon: Droplets, color: "bg-cyan-50 text-cyan-700" },
              { label: "Alerts", href: "/alerts", icon: Bell, color: "bg-amber-50 text-amber-700" },
              { label: "ROI Calculator", href: "/roi", icon: Calculator, color: "bg-purple-50 text-purple-700" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={cn("flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:shadow-md transition-all", item.color.split(" ")[0])}>
                <item.icon className={cn("w-5 h-5", item.color.split(" ")[1])} />
                <span className={cn("text-sm font-medium", item.color.split(" ")[1])}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
