"use client";

import { cn } from "@/lib/utils";

interface TimeRangeSelectorProps {
  selected: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
}

const defaultOptions = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "3m", value: "3m" },
];

export default function TimeRangeSelector({
  selected,
  onChange,
  options = defaultOptions,
}: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150",
            selected === option.value
              ? "bg-white text-green-700 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
