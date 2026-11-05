"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import SensorGauge from "@/components/SensorGauge";
import { LineChartComponent } from "@/components/Charts";
import EmptyState from "@/components/EmptyState";
import { Droplets, Wifi, Radio, Zap, FlaskConical } from "lucide-react";
import { useFirebaseRealtimeSensor } from "@/lib/use-firebase-sensor";
import FirebaseLiveSensorCard from "@/components/FirebaseLiveSensorCard";

export default function SoilPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("firebase_esp32_01");
  const [readings, setReadings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Realtime hook for Firebase ESP32
  const firebase = useFirebaseRealtimeSensor("esp32_01");

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
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [user]);

  const isFirebaseSelected =
    selectedStation === "firebase_esp32_01" ||
    stations.find((s) => s.id === selectedStation)?.stationId === "esp32_01";

  useEffect(() => {
    if (selectedStation && !isFirebaseSelected) {
      fetch(`/api/stations/${selectedStation}/readings`)
        .then((r) => r.json())
        .then((d) => setReadings(d.readings || []))
        .catch(() => {});
    }
  }, [selectedStation, isFirebaseSelected]);

  if (loading || fetching) return <LoadingSpinner size="lg" text="Loading soil data..." className="py-20" />;
  if (!user) return null;

  // Compute active reading values
  let currentNitrogen = 0;
  let currentPhosphorus = 0;
  let currentPotassium = 0;
  let currentPh = 0;
  let currentMoisture = 0;
  let currentPhVoltage: number | undefined;
  let currentMoistureRaw: number | undefined;
  let isNpkValid: boolean | undefined;

  let chartData: any[] = [];

  if (isFirebaseSelected) {
    currentNitrogen = firebase.data?.nitrogen ?? 0;
    currentPhosphorus = firebase.data?.phosphorus ?? 0;
    currentPotassium = firebase.data?.potassium ?? 0;
    currentPh = firebase.data?.ph ?? 0;
    currentMoisture = firebase.data?.moisture ?? 0;
    currentPhVoltage = firebase.data?.phVoltage;
    currentMoistureRaw = firebase.data?.moistureRaw;
    isNpkValid = firebase.data?.npkValid;

    // Use Firebase history if available
    if (firebase.history && firebase.history.length > 0) {
      chartData = firebase.history.map((h, i) => {
        let timeStr = `Point ${i + 1}`;
        if (h.timestamp && h.timestamp > 10000000) {
          const d = new Date(h.timestamp > 10000000000 ? h.timestamp : h.timestamp * 1000);
          if (!isNaN(d.getTime())) {
            timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          }
        }
        return {
          time: timeStr,
          nitrogen: h.nitrogen ?? 0,
          phosphorus: h.phosphorus ?? 0,
          potassium: h.potassium ?? 0,
          moisture: h.moisture ?? 0,
          ph: h.ph ?? 0,
        };
      });
    } else {
      // Default single point or live reading
      chartData = [
        {
          time: "Live Now",
          nitrogen: currentNitrogen,
          phosphorus: currentPhosphorus,
          potassium: currentPotassium,
          moisture: currentMoisture,
          ph: currentPh,
        },
      ];
    }
  } else {
    const latest = readings[0] || {};
    currentNitrogen = latest.nitrogen || 0;
    currentPhosphorus = latest.phosphorus || 0;
    currentPotassium = latest.potassium || 0;
    currentPh = latest.ph || 0;
    currentMoisture = latest.moisture1 || 0;

    chartData = readings
      .slice(0, 50)
      .reverse()
      .map((r: any) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        nitrogen: r.nitrogen,
        phosphorus: r.phosphorus,
        potassium: r.potassium,
        moisture: r.moisture1,
        ph: r.ph,
      }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-stone-800">Soil Monitoring</h2>
            {isFirebaseSelected && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Firebase Realtime Live
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Real-time soil nutrient and moisture data stream
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            aria-label="Select monitoring station"
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="firebase_esp32_01">
              ⚡ ESP32-01 (Live Firebase Realtime)
            </option>
            {stations
              .filter((s) => s.stationId !== "esp32_01")
              .map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.stationId} - {s.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {isFirebaseSelected && (
        <FirebaseLiveSensorCard deviceId="esp32_01" showLinkToSoil={false} />
      )}

      {!isFirebaseSelected && readings.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title="No soil data"
          description="No readings available for this station"
        />
      ) : (
        <>
          <div>
            <h3 className="text-base font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <span>Sensor Gauges</span>
              {isFirebaseSelected && (
                <span className="text-xs font-normal text-stone-400">
                  (updating in real-time from device: esp32_01)
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <SensorGauge
                label="Nitrogen"
                value={currentNitrogen}
                min={0}
                max={150}
                unit="mg/kg"
                status={currentNitrogen > 60 ? "normal" : currentNitrogen > 30 ? "warning" : "critical"}
              />
              <SensorGauge
                label="Phosphorus"
                value={currentPhosphorus}
                min={0}
                max={100}
                unit="mg/kg"
                status={currentPhosphorus > 30 ? "normal" : "warning"}
              />
              <SensorGauge
                label="Potassium"
                value={currentPotassium}
                min={0}
                max={200}
                unit="mg/kg"
                status={currentPotassium > 100 ? "normal" : "warning"}
              />
              <SensorGauge
                label="Soil pH"
                value={Number(currentPh.toFixed(1))}
                min={0}
                max={14}
                unit="pH"
                status={currentPh >= 6 && currentPh <= 7.5 ? "normal" : "warning"}
              />
              <SensorGauge
                label="Soil Moisture"
                value={currentMoisture}
                min={0}
                max={100}
                unit="%"
                status={currentMoisture > 30 ? "normal" : currentMoisture > 20 ? "warning" : "critical"}
              />
            </div>
          </div>

          {/* Additional Raw Telemetry row for ESP32 */}
          {isFirebaseSelected && (currentPhVoltage !== undefined || currentMoistureRaw !== undefined) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                  <FlaskConical className="h-4 w-4 text-purple-500" />
                  pH Electrode Voltage
                </span>
                <p className="mt-2 text-2xl font-bold text-stone-800">
                  {currentPhVoltage?.toFixed(4) || "0.0000"} <span className="text-sm font-normal text-stone-400">Volts</span>
                </p>
                <p className="text-[11px] text-stone-400 mt-1">Raw analog input voltage from probe</p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Moisture ADC Signal
                </span>
                <p className="mt-2 text-2xl font-bold text-stone-800">
                  {currentMoistureRaw ?? 0} <span className="text-sm font-normal text-stone-400">Raw</span>
                </p>
                <p className="text-[11px] text-stone-400 mt-1">Capacitive sensor ADC raw integer value</p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  NPK Sensor Bus Status
                </span>
                <p className="mt-2 text-xl font-bold text-stone-800 flex items-center gap-2">
                  <span className={`inline-block h-3 w-3 rounded-full ${isNpkValid ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {isNpkValid ? "Valid Signal" : "No Signal / Calibrating"}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">RS485 Modbus / UART NPK probe check</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">NPK Levels Trend</h3>
              <LineChartComponent
                data={chartData}
                xKey="time"
                yKeys={[
                  { key: "nitrogen", color: "#16a34a", name: "Nitrogen (N)" },
                  { key: "phosphorus", color: "#2563eb", name: "Phosphorus (P)" },
                  { key: "potassium", color: "#d97706", name: "Potassium (K)" },
                ]}
                height={250}
              />
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Moisture & pH Trend</h3>
              <LineChartComponent
                data={chartData}
                xKey="time"
                yKeys={[
                  { key: "moisture", color: "#0ea5e9", name: "Moisture %" },
                  { key: "ph", color: "#8b5cf6", name: "Soil pH" },
                ]}
                height={250}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
