"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { LineChartComponent } from "@/components/Charts";
import { Leaf, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIAnalysisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/stations")
        .then((r) => r.json())
        .then(async (d) => {
          const stations = d.stations || [];
          const allAnalyses: any[] = [];
          for (const s of stations.slice(0, 3)) {
            try {
              const res = await fetch(`/api/stations/${s.id}/readings`);
              const data = await res.json();
              if (data.readings?.length) allAnalyses.push({ station: s, latestReading: data.readings[0] });
            } catch {}
          }
          setAnalyses(allAnalyses);
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading AI analysis..." className="py-20" />;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">AI Crop Health Analysis</h2>
        <p className="text-sm text-stone-500 mt-1">AI-powered crop health monitoring and disease prediction</p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState icon={Leaf} title="No analysis data" description="Add stations with sensors to enable AI analysis" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyses.map((item: any) => {
            const r = item.latestReading;
            const health = r.nitrogen > 50 && r.moisture1 > 30 ? 85 : r.nitrogen > 30 ? 65 : 40;
            const diseaseRisk = r.humidity > 80 ? 60 : r.humidity > 60 ? 35 : 15;
            const stressLevel = health > 75 ? "low" : health > 50 ? "medium" : "high";

            return (
              <div key={item.station.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">{item.station.stationId}</h3>
                      <p className="text-xs text-stone-400">{item.station.name}</p>
                    </div>
                  </div>
                  <StatusBadge status={stressLevel === "low" ? "healthy" : stressLevel === "medium" ? "warning" : "critical"} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-xl bg-green-50">
                    <p className="text-2xl font-bold text-green-600">{health}%</p>
                    <p className="text-xs text-stone-500 mt-1">Crop Health</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-50">
                    <p className="text-2xl font-bold text-amber-600">{diseaseRisk}%</p>
                    <p className="text-xs text-stone-500 mt-1">Disease Risk</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">{Math.round(r.moisture1 || 0)}%</p>
                    <p className="text-xs text-stone-500 mt-1">Moisture</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="text-stone-500">Nitrogen Level</span>
                    <span className="font-medium text-stone-700">{r.nitrogen?.toFixed(1)} mg/kg</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="text-stone-500">Soil pH</span>
                    <span className="font-medium text-stone-700">{r.ph?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="text-stone-500">Temperature</span>
                    <span className="font-medium text-stone-700">{r.airTemp?.toFixed(1)}°C</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
