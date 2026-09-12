"use client";

import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  BarChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface YKey {
  key: string;
  color: string;
  name?: string;
}

interface ChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: YKey[];
  height?: number;
}

const defaultColors = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-stone-200 text-sm">
      <p className="font-medium text-stone-600 mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-stone-800">
          <span
            className="inline-block w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
}

function ChartLegend({ payload }: any) {
  return (
    <div className="flex items-center justify-center gap-4 mt-2">
      {payload?.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-600">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

export function LineChartComponent({
  data,
  xKey,
  yKeys,
  height = 300,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "#78716c" }}
          axisLine={{ stroke: "#d6d3d1" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#78716c" }}
          axisLine={{ stroke: "#d6d3d1" }}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend content={<ChartLegend />} />
        {yKeys.map((yk, idx) => (
          <Line
            key={yk.key}
            type="monotone"
            dataKey={yk.key}
            name={yk.name || yk.key}
            stroke={yk.color || defaultColors[idx % defaultColors.length]}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaChartComponent({
  data,
  xKey,
  yKeys,
  height = 300,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          {yKeys.map((yk, idx) => (
            <linearGradient key={yk.key} id={`grad-${yk.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={yk.color || defaultColors[idx % defaultColors.length]}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={yk.color || defaultColors[idx % defaultColors.length]}
                stopOpacity={0.05}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "#78716c" }}
          axisLine={{ stroke: "#d6d3d1" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#78716c" }}
          axisLine={{ stroke: "#d6d3d1" }}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend content={<ChartLegend />} />
        {yKeys.map((yk, idx) => (
          <Area
            key={yk.key}
            type="monotone"
            dataKey={yk.key}
            name={yk.name || yk.key}
            stroke={yk.color || defaultColors[idx % defaultColors.length]}
            strokeWidth={2}
            fill={`url(#grad-${yk.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarChartComponent({
  data,
  xKey,
  yKeys,
  height = 300,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "#78716c" }}
          axisLine={{ stroke: "#d6d3d1" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#78716c" }}
          axisLine={{ stroke: "#d6d3d1" }}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend content={<ChartLegend />} />
        {yKeys.map((yk, idx) => (
          <Bar
            key={yk.key}
            dataKey={yk.key}
            name={yk.name || yk.key}
            fill={yk.color || defaultColors[idx % defaultColors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
