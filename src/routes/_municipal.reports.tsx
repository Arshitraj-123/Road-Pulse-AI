import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, Filter, Download, MapPin, ChevronDown, ArrowUpDown } from "lucide-react";
import reports from "@/data/damage-reports.json";

export const Route = createFileRoute("/_municipal/reports")({
  head: () => ({ meta: [{ title: "Damage Reports — RoadPulse AI" }] }),
  component: ReportsPage,
});

type Severity = "all" | "critical" | "moderate" | "minor";
type Status = "all" | "open" | "in_progress" | "resolved";

const sevCls: Record<string, string> = {
  critical: "bg-danger-light text-danger border-danger/30",
  moderate: "bg-amber-light text-amber border-amber/30",
  minor: "bg-teal-light text-teal-dark border-teal-mid/30",
};
const statusCls: Record<string, string> = {
  open: "bg-navy-light text-navy",
  in_progress: "bg-amber-light text-amber",
  resolved: "bg-teal-light text-teal-dark",
};

function ReportsPage() {
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<Severity>("all");
  const [status, setStatus] = useState<Status>("all");
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(() => {
    return reports
      .filter((r) => (sev === "all" ? true : r.severity === sev))
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) =>
        q.trim() === ""
          ? true
          : (r.id + r.type + r.location).toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => (sortDesc ? b.confidence - a.confidence : a.confidence - b.confidence));
  }, [q, sev, status, sortDesc]);

  const exportCsv = () => {
    const headers = ["ID", "Type", "Location", "Severity", "Confidence", "Cost", "DaysToFailure", "Status"];
    const rows = filtered.map((r) =>
      [r.id, r.type, r.location, r.severity, r.confidence, r.costEstimate, r.daysToFailure, r.status]
        .map((v) => `"${v}"`)
        .join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadpulse-reports-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Damage Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All AI-detected and citizen-reported road damage across Patna · {filtered.length} of {reports.length}
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-md bg-navy px-3.5 py-2 text-xs font-medium text-white hover:bg-navy/90"
        >
          <Download className="size-3.5" /> Export CSV
        </button>
      </motion.div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by ID, type, location…"
              className="w-full rounded-md border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-mid"
            />
          </div>
          <Select
            label="Severity"
            value={sev}
            onChange={(v) => setSev(v as Severity)}
            options={[
              { v: "all", l: "All severity" },
              { v: "critical", l: "Critical" },
              { v: "moderate", l: "Moderate" },
              { v: "minor", l: "Minor" },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as Status)}
            options={[
              { v: "all", l: "All status" },
              { v: "open", l: "Open" },
              { v: "in_progress", l: "In Progress" },
              { v: "resolved", l: "Resolved" },
            ]}
          />
          <button
            onClick={() => setSortDesc((s) => !s)}
            className="flex items-center gap-1.5 rounded-md border bg-surface px-3 py-2 text-xs hover:border-teal-mid"
          >
            <ArrowUpDown className="size-3.5" /> Confidence {sortDesc ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Damage</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3 text-right">Conf.</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Fails In</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i, 12) * 0.015 }}
                  className="border-t hover:bg-surface/60"
                >
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{r.id}</td>
                  <td className="px-4 py-2.5 font-medium text-navy">{r.type}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {r.location}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${sevCls[r.severity]}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs">{r.confidence.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-navy">
                    ₹{r.costEstimate.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-mono text-xs ${r.daysToFailure < 7 ? "text-danger" : "text-muted-foreground"}`}>
                      {r.daysToFailure}d
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${statusCls[r.status]}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Filter className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No reports match these filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border bg-surface py-2 pl-3 pr-8 text-xs outline-none focus:border-teal-mid"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}
