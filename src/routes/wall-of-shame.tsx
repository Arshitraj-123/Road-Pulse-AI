import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Shield,
  Clock,
  IndianRupee,
  Ban,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import contractorsData from "@/data/contractors.json";

export const Route = createFileRoute("/wall-of-shame")({
  head: () => ({
    meta: [
      { title: "Contractor Accountability — RoadPulse AI" },
      {
        name: "description",
        content:
          "Public contractor rankings. SLA compliance, resolution rates, and accountability scores updated in real-time.",
      },
    ],
  }),
  component: WallOfShame,
});

/* ── helpers ─────────────────────────────────────────────────── */

type Contractor = (typeof contractorsData)[number];
type FilterTab = "all" | "top" | "risk" | "investigation";
type SortKey = "resolutionRate" | "openTickets" | "avgFixDays" | "grade";

const gradeOrder: Record<string, number> = {
  "A+": 1,
  "A-": 2,
  "B+": 3,
  "D+": 4,
  "D-": 5,
  RISK: 6,
};

function gradeColor(c: Contractor) {
  if (c.status === "excellent") return "bg-teal-mid text-white";
  if (c.status === "good") return "bg-teal-light text-teal-dark border border-teal-mid/30";
  if (c.status === "average") return "bg-amber-light text-amber border border-amber/30";
  if (c.status === "poor") return "bg-danger-light text-danger border border-danger/30";
  return "bg-danger text-white";
}

function stripColor(c: Contractor) {
  if (c.status === "excellent" || c.status === "good") return "bg-teal-mid";
  if (c.status === "average") return "bg-amber";
  if (c.status === "poor") return "bg-danger";
  return "bg-danger animate-pulse";
}

function rankIcon(idx: number) {
  if (idx === 0) return "🏆";
  if (idx === 1) return "🥈";
  if (idx === 2) return "🥉";
  return "";
}

/* ── sparkline ───────────────────────────────────────────────── */

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`
    )
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-10 w-24">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#1d9e75" : "#a32d2d"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── mock SLA violations ─────────────────────────────────────── */

function mockViolations(c: Contractor) {
  const base = [
    "2025-05-28 · 3-day SLA breach on RP-10421",
    "2025-05-15 · Quality rejection at Bailey Rd",
    "2025-04-30 · Non-response to critical alert",
    "2025-04-12 · Incomplete repair at NH-30 km 4.2",
    "2025-03-27 · Missed deadline on RP-10102",
    "2025-03-10 · Failed reinspection",
  ];
  return base.slice(0, Math.min(c.violations, base.length));
}

function mockOpenTickets(c: Contractor) {
  return Array.from({ length: Math.min(c.openTickets, 6) }, (_, i) => ({
    id: `RP-${10400 + i}`,
    type: ["Pothole", "Alligator Cracking", "Edge Failure", "Surface Erosion"][
      i % 4
    ],
    status: i < 2 ? "overdue" : "in_progress",
    daysOpen: 3 + i * 2,
  }));
}

/* ── chart data builder ──────────────────────────────────────── */

function trendChartData(c: Contractor) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return c.trend.map((v, i) => ({ month: months[i], rate: v }));
}

/* ═══════════════════════════════════════════════════════════════ */
/*  COMPONENT                                                     */
/* ═══════════════════════════════════════════════════════════════ */

function WallOfShame() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("resolutionRate");
  const [selected, setSelected] = useState<Contractor | null>(null);

  /* filtering */
  const filtered = contractorsData.filter((c) => {
    if (filter === "top") return c.status === "excellent" || c.status === "good";
    if (filter === "risk") return c.status === "poor" || c.status === "critical";
    if (filter === "investigation") return c.status === "critical";
    return true;
  });

  /* sorting */
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "grade")
      return (gradeOrder[a.grade] ?? 9) - (gradeOrder[b.grade] ?? 9);
    if (sortKey === "openTickets") return b.openTickets - a.openTickets;
    if (sortKey === "avgFixDays") return b.avgFixDays - a.avgFixDays;
    return b.resolutionRate - a.resolutionRate;
  });

  return (
    <div className="min-h-screen bg-surface text-foreground transition-colors dark:bg-[#0A1628] dark:text-white">
      <PublicNavbar />

      {/* ─── PAGE HEADER ──────────────────────────────────────── */}
      <header className="border-b border-border pt-24 pb-8 px-6 transition-colors dark:border-white/10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-danger/20">
                <Shield className="size-6 text-danger" />
              </div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">
                Contractor Accountability Index
              </h1>
            </div>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground dark:text-white/60">
              Public rankings updated in real-time. SLA compliance, resolution
              rates, satisfaction scores.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 animate-pulse rounded-full bg-danger" />
            <span className="font-mono text-xs text-danger">LIVE</span>
            <span className="ml-1 font-mono text-[11px] text-white/40">
              Last updated: just now
            </span>
          </div>
        </div>
      </header>

      {/* ─── FILTER / SORT BAR ────────────────────────────────── */}
      <div className="border-b border-border bg-card transition-colors dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "All"],
                ["top", "Top Performers"],
                ["risk", "At Risk"],
                ["investigation", "Under Investigation"],
              ] as [FilterTab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-teal-mid text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground dark:text-white/40">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground outline-none transition-colors dark:border-white/15 dark:bg-[#0A1628] dark:text-white"
            >
              <option value="resolutionRate" className="dark:bg-[#0A1628]">Resolution Rate ▼</option>
              <option value="openTickets" className="dark:bg-[#0A1628]">Open Tickets</option>
              <option value="avgFixDays" className="dark:bg-[#0A1628]">Avg Fix Time</option>
              <option value="grade" className="dark:bg-[#0A1628]">Grade</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── RANKINGS ─────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((c, i) => {
              const isCritical = c.status === "critical";
              const isSelected = selected?.id === c.id;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setSelected(isSelected ? null : c)}
                    className={`group relative block w-full overflow-hidden rounded-xl text-left transition-all ${
                      isCritical
                        ? "bg-danger-light ring-2 ring-danger/40"
                        : "bg-card hover:ring-2 hover:ring-teal-mid/30 dark:bg-white"
                    } ${isSelected ? "ring-2 ring-teal-mid" : ""}`}
                  >
                    {/* pulsing left strip */}
                    <div
                      className={`absolute inset-y-0 left-0 w-1.5 ${stripColor(c)} ${isCritical ? "" : ""}`}
                    />

                    {/* red alert banner for critical */}
                    {isCritical && (
                      <div className="flex items-center gap-2 bg-danger px-5 py-2 text-xs font-bold text-white">
                        <AlertTriangle className="size-3.5" />
                        ⚠ PAYMENT HOLD RECOMMENDED
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 px-5 py-5 sm:flex-nowrap sm:gap-6">
                      {/* rank */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-display text-4xl font-bold text-black/15">
                          {rankIcon(i) || `#${i + 1}`}
                        </span>
                      </div>

                      {/* avatar */}
                      <div
                        className={`flex size-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${
                          isCritical
                            ? "bg-danger text-white"
                            : "bg-navy-light text-navy"
                        }`}
                      >
                        {c.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      {/* name + grade */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`truncate font-display text-lg font-bold ${
                            isCritical ? "text-danger" : "text-navy"
                          }`}
                        >
                          {c.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${gradeColor(c)}`}
                          >
                            {c.grade === "RISK" && (
                              <AlertTriangle className="mr-1 size-3" />
                            )}
                            {c.grade}
                          </span>
                          {isCritical && (
                            <span className="rounded-full bg-danger/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-danger">
                              Blacklisting review initiated
                            </span>
                          )}
                        </div>
                      </div>

                      {/* resolution rate bar */}
                      <div className="w-32 shrink-0 hidden md:block">
                        <p className="font-mono text-[10px] uppercase text-muted-foreground dark:text-black/40">
                          Resolution
                        </p>
                        <p
                          className={`font-display text-2xl font-bold ${
                            c.resolutionRate >= 90
                              ? "text-teal-dark"
                              : c.resolutionRate >= 70
                                ? "text-amber"
                                : "text-danger"
                          }`}
                        >
                          {c.resolutionRate}%
                        </p>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.resolutionRate}%` }}
                            transition={{ delay: 0.2 + i * 0.05, duration: 0.7 }}
                            className={`h-full ${
                              c.resolutionRate >= 90
                                ? "bg-teal-mid"
                                : c.resolutionRate >= 70
                                  ? "bg-amber"
                                  : "bg-danger"
                            }`}
                          />
                        </div>
                      </div>

                      {/* 3 small stats */}
                      <div className="flex gap-4 shrink-0 text-center">
                        <div>
                          <p className="font-display text-lg font-bold text-navy">
                            {c.openTickets}
                          </p>
                          <p className="font-mono text-[9px] uppercase text-muted-foreground dark:text-black/40">
                            Open
                          </p>
                        </div>
                        <div>
                          <p className="font-display text-lg font-bold text-navy">
                            {c.avgFixDays}d
                          </p>
                          <p className="font-mono text-[9px] uppercase text-muted-foreground dark:text-black/40">
                            Avg Fix
                          </p>
                        </div>
                        <div>
                          <p
                            className={`font-display text-lg font-bold ${
                              c.slaCompliance >= 90
                                ? "text-teal-dark"
                                : c.slaCompliance >= 70
                                  ? "text-amber"
                                  : "text-danger"
                            }`}
                          >
                            {c.slaCompliance}%
                          </p>
                          <p className="font-mono text-[9px] uppercase text-muted-foreground dark:text-black/40">
                            SLA
                          </p>
                        </div>
                      </div>

                      {/* sparkline + arrow */}
                      <div className="hidden items-center gap-3 sm:flex shrink-0">
                        <Sparkline data={c.trend} />
                        <ChevronRight
                          className={`size-5 text-black/20 transition-transform ${
                            isSelected ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* critical summary line */}
                    {isCritical && (
                      <div className="border-t border-danger/20 bg-danger/5 px-5 py-2.5">
                        <p className="font-mono text-xs text-danger">
                          {c.resolutionRate}% Resolution Rate — {c.openTickets}{" "}
                          Open Tickets — {c.violations} SLA Violations
                        </p>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ─── CONSEQUENCE INFO CARDS ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: Clock,
              title: "SLA Breach",
              desc: "Ticket unresolved past deadline triggers automatic alert to municipal oversight.",
              color: "text-amber",
              bg: "bg-amber/10",
            },
            {
              icon: IndianRupee,
              title: "Payment Hold",
              desc: "Persistent violations result in withheld municipal payments until resolution.",
              color: "text-danger",
              bg: "bg-danger/10",
            },
            {
              icon: Ban,
              title: "Blacklist Risk",
              desc: "Repeat offenders flagged for contract termination and future bid exclusion.",
              color: "text-danger",
              bg: "bg-danger/10",
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div
                  className={`mb-3 inline-flex size-10 items-center justify-center rounded-lg ${c.bg}`}
                >
                  <Icon className={`size-5 ${c.color}`} />
                </div>
                <h3 className="font-display text-base font-semibold">
                  {c.title}
                </h3>
                <p className="mt-1 text-sm text-white/50">{c.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* ─── SLIDE-IN DETAIL PANEL ────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            {/* backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            {/* panel */}
            <motion.aside
              key="panel"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[400px] overflow-y-auto border-l border-border bg-surface p-6 shadow-2xl transition-colors dark:border-white/10 dark:bg-[#0d1f3c]"
            >
              {/* header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {selected.name}
                  </h2>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase ${gradeColor(selected)}`}
                  >
                    {selected.grade}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md p-1.5 hover:bg-white/10"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* trend chart */}
              <div className="mt-6">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-white/40">
                  Resolution Rate — 6-Month Trend
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData(selected)}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0d1f3c",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke={
                          selected.trend[selected.trend.length - 1] >=
                          selected.trend[0]
                            ? "#1d9e75"
                            : "#a32d2d"
                        }
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#0d1f3c", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* stats grid */}
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-white/5 p-4">
                <div className="text-center">
                  <p className="font-display text-xl font-bold">
                    {selected.resolutionRate}%
                  </p>
                  <p className="font-mono text-[9px] uppercase text-white/40">
                    Resolved
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold">
                    {selected.avgFixDays}d
                  </p>
                  <p className="font-mono text-[9px] uppercase text-white/40">
                    Avg Fix
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold">
                    {selected.slaCompliance}%
                  </p>
                  <p className="font-mono text-[9px] uppercase text-white/40">
                    SLA
                  </p>
                </div>
              </div>

              {/* open tickets */}
              <div className="mt-6">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-white/40">
                  Open Tickets ({selected.openTickets})
                </p>
                <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {mockOpenTickets(selected).map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2"
                    >
                      <div>
                        <span className="font-mono text-xs">{t.id}</span>
                        <span className="ml-2 text-xs text-white/50">
                          {t.type}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                          t.status === "overdue"
                            ? "bg-danger/20 text-danger"
                            : "bg-amber/20 text-amber"
                        }`}
                      >
                        {t.status === "overdue" ? "Overdue" : "In Progress"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SLA violations */}
              {selected.violations > 0 && (
                <div className="mt-6">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-white/40">
                    SLA Violations ({selected.violations})
                  </p>
                  <ul className="space-y-1">
                    {mockViolations(selected).map((v, i) => (
                      <li
                        key={i}
                        className="rounded-md bg-danger/10 px-3 py-2 text-xs text-danger/90"
                      >
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* actions */}
              <div className="mt-8 flex flex-col gap-2">
                <button className="flex items-center justify-center gap-2 rounded-md border border-danger/40 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 transition-colors">
                  <AlertTriangle className="size-4" />
                  Flag for Review
                </button>
                <button className="flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors">
                  <Download className="size-4" />
                  Download Report
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* footer */}
      <footer className="border-t border-border bg-surface px-6 py-10 text-center text-xs text-muted-foreground transition-colors dark:border-white/5 dark:bg-[#0A1628] dark:text-white/40">
        <p>© 2026 RoadPulse AI · Contractor data is updated in real-time from municipal records.</p>
      </footer>
    </div>
  );
}
