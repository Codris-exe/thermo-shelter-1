"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SimulationPoint {
  timestamp: string;
  indoor_temperature_c: number;
  outdoor_temperature_c: number;
  solar_gain_w: number;
  total_heat_loss_w: number;
}

interface ThermalResultsChartProps {
  points: SimulationPoint[];
}

function formatTime(timestamp: string) {
  if (timestamp.includes("T")) {
    return timestamp.split("T")[1].slice(0, 5);
  }
  return timestamp;
}

function formatValue(value: number, digits = 1) {
  return value.toFixed(digits);
}

export default function ThermalResultsChart({
  points,
}: ThermalResultsChartProps) {
  if (!points.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm text-slate-400">
        Run the thermal simulation to view results.
      </div>
    );
  }

  const chartData = points.map((point) => ({
    time: formatTime(point.timestamp),
    indoor: Number(point.indoor_temperature_c.toFixed(2)),
    outdoor: Number(point.outdoor_temperature_c.toFixed(2)),
    solar: Number(point.solar_gain_w.toFixed(2)),
    heatLoss: Number(point.total_heat_loss_w.toFixed(2)),
  }));

  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-3 font-mono">
      {/* Temperature chart */}
      <div className="min-h-0 border border-white/15 bg-[#090e1b] p-3 corner-bracket">
        <div className="mb-2">
          <div className="text-xs font-semibold text-white uppercase tracking-wider">
            Thermal Temperature Profile
          </div>
          <div className="text-[10px] text-slate-400">
            Indoor core (Amber) vs ambient outdoor (Icy Cyan)
          </div>
        </div>

        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 4,
                right: 8,
                left: -18,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.12)"
              />

              <XAxis
                dataKey="time"
                tick={{
                  fill: "#94a3b8",
                  fontSize: 9,
                }}
                axisLine={false}
                tickLine={false}
                minTickGap={18}
              />

              <YAxis
                tick={{
                  fill: "#94a3b8",
                  fontSize: 9,
                }}
                axisLine={false}
                tickLine={false}
                width={34}
              />

              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  fontSize: "11px",
                }}
                labelStyle={{
                  color: "#cbd5e1",
                  marginBottom: "4px",
                }}
                formatter={(value, name) => {
                  const numericValue = Number(value);

                  return [
                    `${formatValue(numericValue)} °C`,
                    name === "indoor" ? "Indoor" : "Outdoor",
                  ];
                }}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  paddingTop: "4px",
                }}
              />

              <Line
                type="monotone"
                dataKey="indoor"
                name="Indoor Core"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="outdoor"
                name="Ambient Ext"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy chart */}
      <div className="min-h-0 border border-white/15 bg-[#090e1b] p-3 corner-bracket">
        <div className="mb-2">
          <div className="text-xs font-semibold text-white uppercase tracking-wider">
            Energy Balance Flux
          </div>
          <div className="text-[10px] text-slate-400">
            Solar radiation gain (Amber) vs total heat loss (Zinc)
          </div>
        </div>

        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 4,
                right: 8,
                left: -18,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.12)"
              />

              <XAxis
                dataKey="time"
                tick={{
                  fill: "#94a3b8",
                  fontSize: 9,
                }}
                axisLine={false}
                tickLine={false}
                minTickGap={18}
              />

              <YAxis
                tick={{
                  fill: "#94a3b8",
                  fontSize: 9,
                }}
                axisLine={false}
                tickLine={false}
                width={38}
              />

              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  fontSize: "11px",
                }}
                labelStyle={{
                  color: "#cbd5e1",
                  marginBottom: "4px",
                }}
                formatter={(value, name) => {
                  const numericValue = Number(value);

                  return [
                    `${formatValue(numericValue, 0)} W`,
                    name === "solar" ? "Solar Gain" : "Heat Transfer",
                  ];
                }}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  paddingTop: "4px",
                }}
              />

              <Line
                type="monotone"
                dataKey="solar"
                name="Solar Gain"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="heatLoss"
                name="Heat Transfer"
                stroke="#f87171"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}