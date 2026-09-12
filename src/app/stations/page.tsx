"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { Radio, ArrowRight, Battery, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stations, setStations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/stations")
        .then((r) => r.json())
        .then((d) => { setStations(d.stations || []); setFetching(false); })
        .catch(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading stations..." className="py-20" />;
  if (!user) return null;

  const online = stations.filter((s) => s.status === "online").length;
  const warning = stations.filter((s) => s.status === "warning").length;
  const offline = stations.filter((s) => s.status === "offline").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">Stations</h2>
        <p className="text-sm text-stone-500 mt-1">Monitor your IoT sensor stations</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{online}</p>
          <p className="text-xs text-stone-500 mt-1">Online</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{warning}</p>
          <p className="text-xs text-stone-500 mt-1">Warning</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{offline}</p>
          <p className="text-xs text-stone-500 mt-1">Offline</p>
        </div>
      </div>

      {stations.length === 0 ? (
        <EmptyState icon={Radio} title="No stations" description="No stations registered yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station: any) => (
            <Link key={station.id} href={`/stations/${station.id}`}
              className="group bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center",
                    station.status === "online" ? "bg-green-50" : station.status === "warning" ? "bg-amber-50" : "bg-red-50")}>
                    <Radio className={cn("w-6 h-6",
                      station.status === "online" ? "text-green-600" : station.status === "warning" ? "text-amber-600" : "text-red-600")} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">{station.stationId}</h3>
                    <p className="text-xs text-stone-400">{station.name}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-green-600 transition-colors" />
              </div>

              <div className="flex items-center gap-4 mt-4">
                <StatusBadge status={station.status} size="sm" />
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <Battery className="w-3.5 h-3.5" />
                  {Math.round(station.battery)}%
                </div>
              </div>

              {station.farm && (
                <p className="text-xs text-stone-400 mt-3">Farm: {station.farm.name}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
