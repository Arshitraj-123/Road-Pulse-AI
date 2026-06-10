import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import reports from "@/data/damage-reports.json";
import { useMemo } from "react";

export const Route = createFileRoute("/_municipal/budget")({
  head: () => ({ meta: [{ title: "Budget — RoadPulse AI" }] }),
  component: BudgetPage,
});

const TOTAL_BUDGET = 28_500_000; // ₹2.85 Cr FY allocation

function BudgetPage() {
  const stats = useMemo(() => {
    const committed = reports.reduce((a, r) => a + r.costEstimate, 0);
    const spent = reports.filter((r) => r.status === "resolved").reduce((a, r) => a + r.costEstimate, 0);
    const pending = reports.filter((r) => r.status !== "resolved").reduce((a, r) => a + r.costEstimate, 0);
    return { committed, spent, pending, remaining: TOTAL_BUDGET - committed };
  }, []);

  const byType = useMemo(() => {
    const m = new Map<string, number>();
    reports.forEach((r) => m.set(r.type, (m.get(r.type) ?? 0) + r.costEstimate));
    return Array.from(m, ([name, value]) => ({ name: name.replace("Grade 3 ", ""), value }));
  }, []);

  const monthly = [
    { month: "Jan", planned: 2200000, actual: 2050000 },
    { month: "Feb", planned: 2400000, actual: 2310000 },
    { month: "Mar", planned: 2600000, actual: 2780000 },
    { month: "Apr", planned: 2500000, actual: 2420000 },
    { month: "May", planned: 2800000, actual: 3100000 },
    { month: "Jun", planned: 3000000, actual: 2850000 },
  ];

  const pct = (n: number) => Math.round((n / TOTAL_BUDGET) * 100);
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl font-bold text-navy">Budget & Spend</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          FY 2025–26 road maintenance allocation · ₹{(TOTAL_BUDGET / 10000000).toFixed(2)} Cr total
        </p>
      </motion.div>

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Budget", value: fmt(TOTAL_BUDGET), icon: IndianRupee, tone: "text-navy", bg: "bg-navy-light" },
          { label: "Committed", value: fmt(stats.committed), sub: `${pct(stats.committed)}%`, icon: TrendingUp, tone: "text-amber", bg: "bg-amber-light" },
          { label: "Spent", value: fmt(stats.spent), sub: `${pct(stats.spent)}%`, icon: TrendingDown, tone: "text-teal-dark", bg: "bg-teal-light" },
          { label: "Remaining", value: fmt(stats.remaining), sub: `${pct(stats.remaining)}%`, icon: AlertCircle, tone: "text-danger", bg: "bg-danger-light" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <div className={`flex size-7 items-center justify-center rounded-md ${s.bg}`}>
                  <Icon className={`size-3.5 ${s.tone}`} />
                </div>
              </div>
              <p className={`mt-2 font-display text-2xl font-bold ${s.tone}`}>{s.value}</p>
              {s.sub && <p className="font-mono text-[11px] text-muted-foreground">{s.sub} of budget</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Utilization bar */}
      <div className="mb-6 rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            FY Utilization
          </p>
          <span className="font-display text-sm font-bold text-navy">
            {pct(stats.committed)}% committed · {pct(stats.spent)}% spent
          </span>
        </div>
        <div className="relative h-6 overflow-hidden rounded-full bg-surface">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct(stats.committed)}%` }}
            transition={{ duration: 0.8 }}
            className="absolute inset-y-0 left-0 bg-amber/50"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct(stats.spent)}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-y-0 left-0 bg-teal-mid"
          />
        </div>
        <div className="mt-2 flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-teal-mid" /> Spent</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-amber/50" /> Committed (pending payout)</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-surface border" /> Available</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-navy">Planned vs Actual</h3>
          <p className="text-xs text-muted-foreground">Monthly spend in ₹ Lakh</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d9e75" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1d9e75" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 100000}L`} stroke="#94a3b8" />
                <Tooltip
                  formatter={(v: unknown) => `₹${(Number(v) / 100000).toFixed(1)}L`}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="planned" stroke="#185fa5" strokeDasharray="4 4" fill="none" />
                <Area type="monotone" dataKey="actual" stroke="#1d9e75" strokeWidth={2} fill="url(#actual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By damage type */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-navy">Spend by Damage Type</h3>
          <p className="text-xs text-muted-foreground">Committed budget per category</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={byType} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} stroke="#94a3b8" />
                <Tooltip
                  formatter={(v: unknown) => `₹${Number(v).toLocaleString("en-IN")}`}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#185fa5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
