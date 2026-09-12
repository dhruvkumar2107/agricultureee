"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import SensorGauge from "@/components/SensorGauge";
import { LineChartComponent } from "@/components/Charts";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import { Radio, ArrowLeft, Battery, Wifi, WifiOff, Thermometer, Droplets, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StationDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [station, setStation] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("24h");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.id) {
      Promise.all([
        fetch(`/api/stations/${params.id}`).then((r) => r.json()),
        fetch(`/api/stations/${params.id}/readings`).then((r) => r.json()),
        fetch(`/api/stations/${params.id}/alerts`).then((r) => r.json()),
      ]).then(([stationData, readingsData, alertsData]) => {
        setStation(stationData.station);
        setReadings(readingsData.readings || []);
        setAlerts(alertsData.alerts || []);
        setFetching(false);
      }).catch(() => setFetching(false));
    }
  }, [user, params.id]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading station..." className="py-20" />;
  if (!user || !station) return null;

  const latestReading = readings[0] || {};
  const chartData = readings.slice(0, 50).reverse().map((r: any) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    moisture: r.moisture1,
    temperature: r.airTemp,
    humidity: r.humidity,
    nitrogen: r.nitrogen,
  }));

  return (
    <div className="space-y-6">
      <Link href="/stations" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft className="w-4 h-4" /> Back to Stations
      </Link>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center",
              station.status === "online" ? "bg-green-50" : station.status === "warning" ? "bg-amber-50" : "bg-red-50")}>
              <Radio className={cn("w-7 h-7",
                station.status === "online" ? "text-green-600" : station.status === "warning" ? "text-amber-600" : "text-red-600")} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">{station.stationId}</h2>
              <p className="text-sm text-stone-500">{station.name}</p>
            </div>
          </div>
          <StatusBadge status={station.status} size="lg" />
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm text-stone-500">
          <span>Firmware: {station.firmware}</span>
          <span className="flex items-center gap-1"><Battery className="w-4 h-4" />{Math.round(station.battery)}%</span>
          <span>Solar: {station.solarStatus}</span>
          {station.farm && <span>Farm: {station.farm.name}</span>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Current Readings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <SensorGauge label="Nitrogen" value={latestReading.nitrogen || 0} min={0} max={100} unit="mg/kg"
            status={latestReading.nitrogen > 60 ? "normal" : latestReading.nitrogen > 30 ? "warning" : "critical"} />
          <SensorGauge label="Phosphorus" value={latestReading.phosphorus || 0} min={0} max={80} unit="mg/kg"
            status={latestReading.phosphorus > 30 ? "normal" : "warning"} />
          <SensorGauge label="Potassium" value={latestReading.potassium || 0} min={0} max={200} unit="mg/kg"
            status={latestReading.potassium > 100 ? "normal" : "warning"} />
          <SensorGauge label="pH" value={latestReading.ph || 0} min={0} max={14} unit="pH"
            status={latestReading.ph >= 6 && latestReading.ph <= 7.5 ? "normal" : "warning"} />
          <SensorGauge label="Moisture" value={latestReading.moisture1 || 0} min={0} max={100} unit="%"
            status={latestReading.moisture1 > 30 ? "normal" : latestReading.moisture1 > 20 ? "warning" : "critical"} />
          <SensorGauge label="Temperature" value={latestReading.airTemp || 0} min={0} max={50} unit="°C"
            status={latestReading.airTemp > 35 ? "critical" : latestReading.airTemp > 28 ? "warning" : "normal"} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-stone-800">Sensor Trends</h3>
          <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
        </div>
        {chartData.length > 0 ? (
          <LineChartComponent data={chartData} xKey="time" yKeys={[
            { key: "moisture", color: "#2563eb", name: "Moisture %" },
            { key: "temperature", color: "#dc2626", name: "Temp °C" },
          ]} height={250} />
        ) : (
          <p className="text-sm text-stone-400 text-center py-12">No readings available</p>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Station Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert: any) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50">
                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0",
                  alert.severity === "critical" ? "bg-red-500" : alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700">{alert.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{alert.message}</p>
                </div>
                <StatusBadge status={alert.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
