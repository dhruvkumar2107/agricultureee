"use client";

import { useState } from "react";
import {
  Zap,
  X,
  Leaf,
  Bug,
  Droplets,
  AlertTriangle,
  WifiOff,
  BatteryLow,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const simulations = [
  {
    id: "healthy",
    label: "Simulate Healthy",
    icon: Leaf,
    color: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
  },
  {
    id: "disease",
    label: "Simulate Disease",
    icon: Bug,
    color: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
  },
  {
    id: "low_moisture",
    label: "Simulate Low Moisture",
    icon: Droplets,
    color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  },
  {
    id: "nutrient_deficiency",
    label: "Simulate Nutrient Deficiency",
    icon: AlertTriangle,
    color: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
  },
  {
    id: "station_offline",
    label: "Simulate Station Offline",
    icon: WifiOff,
    color: "bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200",
  },
  {
    id: "low_battery",
    label: "Simulate Low Battery",
    icon: BatteryLow,
    color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
  },
];

export default function SimulationPanel({ isOpen, onClose }: SimulationPanelProps) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const runSimulation = async (id: string) => {
    setLoading(id);
    setResult(null);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: id }),
      });
      const data = await res.json();
      setResult(data.message || `Simulation "${id}" completed`);
    } catch {
      setResult("Failed to run simulation");
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">
            Simulation Mode
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-amber-100 text-amber-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Simulation buttons */}
      <div className="p-3 space-y-2">
        {simulations.map((sim) => (
          <button
            key={sim.id}
            onClick={() => runSimulation(sim.id)}
            disabled={loading !== null}
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-xl border transition-colors",
              sim.color,
              loading !== null && "opacity-50 cursor-not-allowed"
            )}
          >
            <sim.icon className="w-4 h-4 shrink-0" />
            {sim.label}
            {loading === sim.id && (
              <span className="ml-auto animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200">
          <p className="text-xs text-stone-600">{result}</p>
        </div>
      )}
    </div>
  );
}
