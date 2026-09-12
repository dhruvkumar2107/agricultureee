import { cn } from "@/lib/utils";

interface SensorGaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  status?: "normal" | "warning" | "critical";
}

const statusColors = {
  normal: { stroke: "#16a34a", text: "text-green-600", bg: "text-green-600" },
  warning: { stroke: "#d97706", text: "text-amber-600", bg: "text-amber-600" },
  critical: { stroke: "#dc2626", text: "text-red-600", bg: "text-red-600" },
};

export default function SensorGauge({
  label,
  value,
  min,
  max,
  unit,
  status = "normal",
}: SensorGaugeProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const colors = statusColors[status];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-bold", colors.text)}>
            {Math.round(value)}
          </span>
          <span className="text-[10px] text-stone-400 font-medium">{unit}</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-stone-600">{label}</p>
    </div>
  );
}
