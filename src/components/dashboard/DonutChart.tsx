import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "Grade 3 Pothole", value: 34, color: "#A32D2D" },
  { name: "Alligator Cracking", value: 22, color: "#BA7517" },
  { name: "Edge Failure", value: 18, color: "#185FA5" },
  { name: "Surface Deterioration", value: 14, color: "#1D9E75" },
  { name: "Other", value: 12, color: "#888780" },
];

export function DonutChart() {
  return (
    <div className="flex h-[380px] flex-col">
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={88}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              animationDuration={900}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl font-bold">1,247</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5 px-2 pt-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 text-muted-foreground">{d.name}</span>
            <span className="font-mono font-medium">{d.value}%</span>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-lg border bg-teal-light/40 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI Confidence Score</span>
          <span className="font-mono font-semibold text-teal-dark">94.7%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "94.7%" }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="h-full rounded-full bg-teal-mid"
          />
        </div>
      </div>
    </div>
  );
}
