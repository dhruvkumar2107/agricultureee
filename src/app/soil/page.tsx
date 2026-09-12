"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import SensorGauge from "@/components/SensorGauge";
import { LineChartComponent } from "@/components/Charts";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import EmptyState from "@/components/EmptyState";
import { Droplets } from "lucide-react";

export default function SoilPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [readings, setReadings] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("24h");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/stations")
        .then((r) => r.json())
        .then((d) => {
          const s = d.stations || [];
          setStations(s);
          if (s.length > 0) setSelectedStation(s[0].id);
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [user]);

  useEffect(() => {
    if (selectedStation) {
      fetch(`/api/stations/${selectedStation}/readings`)
        .then((r) => r.json())
        .then((d) => setReadings(d.readings || []))
        .catch(() => {});
    }
  }, [selectedStation]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading soil data..." className="py-20" />;
  if (!user) return null;

  const latest = readings[0] || {};
  const chartData = readings.slice(0, 50).reverse().map((r: any) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    nitrogen: r.nitrogen,
    phosphorus: r.phosphorus,
    potassium: r.potassium,
    moisture: r.moisture1,
    ph: r.ph,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Soil Monitoring</h2>
          <p className="text-sm text-stone-500 mt-1">Real-time soil nutrient and moisture data</p>
        </div>
        <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}
          className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          {stations.map((s: any) => <option key={s.id} value={s.id}>{s.stationId} - {s.name}</option>)}
        </select>
      </div>

      {readings.length === 0 ? (
        <EmptyState icon={Droplets} title="No soil data" description="No readings available for this station" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <SensorGauge label="Nitrogen" value={latest.nitrogen || 0} min={0} max={100} unit="mg/kg"
              status={latest.nitrogen > 60 ? "normal" : latest.nitrogen > 30 ? "warning" : "critical"} />
            <SensorGauge label="Phosphorus" value={latest.phosphorus || 0} min={0} max={80} unit="mg/kg"
              status={latest.phosphorus > 30 ? "normal" : "warning"} />
            <SensorGauge label="Potassium" value={latest.potassium || 0} min={0} max={200} unit="mg/kg"
              status={latest.potassium > 100 ? "normal" : "warning"} />
            <SensorGauge label="Soil pH" value={latest.ph || 0} min={0} max={14} unit="pH"
              status={latest.ph >= 6 && latest.ph <= 7.5 ? "normal" : "warning"} />
            <SensorGauge label="Soil Moisture" value={latest.moisture1 || 0} min={0} max={100} unit="%"
              status={latest.moisture1 > 30 ? "normal" : latest.moisture1 > 20 ? "warning" : "critical"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">NPK Levels</h3>
              <LineChartComponent data={chartData} xKey="time" yKeys={[
                { key: "nitrogen", color: "#16a34a", name: "Nitrogen" },
                { key: "phosphorus", color: "#2563eb", name: "Phosphorus" },
                { key: "potassium", color: "#d97706", name: "Potassium" },
              ]} height={250} />
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Moisture & pH</h3>
              <LineChartComponent data={chartData} xKey="time" yKeys={[
                { key: "moisture", color: "#0ea5e9", name: "Moisture %" },
              ]} height={250} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
