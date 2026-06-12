import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Bailey Road km 4.1", days: 2, cost: 4500, type: "Alligator Cracking" },
  { name: "Beur Jail Road", days: 3, cost: 1600, type: "Grade 3 Pothole" },
  { name: "Income Tax Roundabout", days: 3, cost: 1620, type: "Grade 3 Pothole" },
  { name: "Exhibition Road", days: 4, cost: 1500, type: "Grade 3 Pothole" },
  { name: "Hartali Mor", days: 4, cost: 1530, type: "Grade 3 Pothole" },
  { name: "Anisabad", days: 5, cost: 1450, type: "Grade 3 Pothole" },
  { name: "Patna Junction", days: 5, cost: 1550, type: "Grade 3 Pothole" },
  { name: "Mithapur", days: 6, cost: 1400, type: "Grade 3 Pothole" },
  { name: "MG Road", days: 7, cost: 1200, type: "Grade 3 Pothole" },
  { name: "Sandalpur", days: 10, cost: 4600, type: "Alligator Cracking" },
  { name: "Gandhi Setu", days: 10, cost: 4800, type: "Alligator Cracking" },
  { name: "NH-30 Bypass", days: 14, cost: 4500, type: "Edge Failure" },
];

const barColor = (d: number) =>
  d <= 7 ? "#A32D2D" : d <= 14 ? "#BA7517" : "#1D9E75";

import useThemeStore from "@/store/useThemeStore";

export function PredictiveBar() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="h-[220px] w-full md:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} domain={[0, 30]} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
          />
          <ReferenceLine
            x={0}
            stroke="#0F6E56"
            strokeWidth={2}
            label={{ value: "TODAY", position: "top", fill: "#0F6E56", fontSize: 10 }}
          />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(29,158,117,0.08)" }}
            contentStyle={{
              background: isDark ? "#0F1E35" : "#ffffff",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ color: isDark ? "#e2e8f0" : "#475569" }}
            labelStyle={{ color: isDark ? "#ffffff" : "#042c53", fontWeight: 600, marginBottom: 4 }}
            formatter={((value: unknown, _name: unknown, item: unknown) => {
              const it = item as { payload: (typeof data)[number] };
              const d = it.payload;
              return [
                `${d.type} • ${value} days • ₹${d.cost.toLocaleString("en-IN")}`,
                d.name,
              ];
            }) as never}
          />
          <Bar dataKey="days" radius={[0, 4, 4, 0]} animationDuration={1200}>
            {data.map((d, i) => (
              <Cell key={i} fill={barColor(d.days)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
