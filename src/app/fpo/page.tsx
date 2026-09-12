"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatCard from "@/components/StatCard";
import { Users, Sprout, Radio, TrendingUp, BarChart3 } from "lucide-react";
import { BarChartComponent } from "@/components/Charts";

export default function FPOPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch("/api/farms").then((r) => r.json()),
        fetch("/api/stations").then((r) => r.json()),
        fetch("/api/alerts").then((r) => r.json()),
      ]).then(([farms, stations, alerts]) => {
        const f = farms.farms || [];
        const s = stations.stations || [];
        const a = alerts.alerts || [];
        const totalAcreage = f.reduce((sum: number, farm: any) => sum + (farm.acreage || 0), 0);
        const totalFields = f.reduce((sum: number, farm: any) => sum + (farm.fields?.length || 0), 0);
        setData({ totalFarms: f.length, totalAcreage, totalFields, totalStations: s.length, onlineStations: s.filter((st: any) => st.status === "online").length, totalAlerts: a.length, criticalAlerts: a.filter((al: any) => al.severity === "critical").length });
        setFetching(false);
      }).catch(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading FPO dashboard..." className="py-20" />;
  if (!user) return null;

  const cropData = [
    { crop: "Tomato", acres: 45 },
    { crop: "Potato", acres: 32 },
    { crop: "Cotton", acres: 28 },
    { crop: "Rice", acres: 55 },
    { crop: "Wheat", acres: 40 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">FPO Dashboard</h2>
        <p className="text-sm text-stone-500 mt-1">Farmer Producer Organization overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Farms" value={data?.totalFarms || 0} icon={Sprout} color="green" />
        <StatCard title="Total Acreage" value={data?.totalAcreage || 0} icon={BarChart3} color="blue" unit="acres" />
        <StatCard title="Active Stations" value={data?.onlineStations || 0} icon={Radio} color="green" subtitle={`of ${data?.totalStations || 0} total`} />
        <StatCard title="Critical Alerts" value={data?.criticalAlerts || 0} icon={TrendingUp} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Crop Distribution</h3>
          <BarChartComponent data={cropData} xKey="crop" yKeys={[{ key: "acres", color: "#16a34a", name: "Acres" }]} height={250} />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">FPO Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
              <span className="text-sm text-stone-600">Member Farms</span>
              <span className="text-lg font-bold text-green-600">{data?.totalFarms || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
              <span className="text-sm text-stone-600">Total Fields</span>
              <span className="text-lg font-bold text-blue-600">{data?.totalFields || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
              <span className="text-sm text-stone-600">Total Acreage</span>
              <span className="text-lg font-bold text-amber-600">{data?.totalAcreage || 0} acres</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
              <span className="text-sm text-stone-600">IoT Stations</span>
              <span className="text-lg font-bold text-purple-600">{data?.totalStations || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
