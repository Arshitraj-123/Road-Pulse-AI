import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import contractors from "@/data/contractors.json";
import { Card } from "@/components/rp/Card";
import { Badge } from "@/components/rp/Badge";

export const Route = createFileRoute("/_municipal/contractors")({
  head: () => ({ meta: [{ title: "Contractors — RoadPulse AI" }] }),
  component: ContractorsPage,
});

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
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

function ContractorsPage() {
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-teal-mid">Accountability</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy sm:text-4xl">Contractor Scorecard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live grades · SLA compliance · trend over last 6 months</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contractors.map((c, i) => {
          const up = c.trend[c.trend.length - 1] >= c.trend[0];
          const gradeColor =
            c.status === "excellent"
              ? "bg-teal-mid text-white"
              : c.status === "good"
              ? "bg-teal-light text-teal-dark"
              : c.status === "average"
              ? "bg-amber-light text-amber"
              : c.status === "poor"
              ? "bg-danger-light text-danger"
              : "bg-danger text-white";
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{c.id}</p>
                    <h3 className="mt-0.5 truncate font-display text-lg font-bold text-navy">{c.name}</h3>
                  </div>
                  <div className={`flex size-12 items-center justify-center rounded-xl font-display text-lg font-extrabold ${gradeColor}`}>
                    {c.grade}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-display text-lg font-bold text-navy">{c.resolutionRate}%</p>
                    <p className="font-mono text-[9px] uppercase text-muted-foreground">Resolved</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-navy">{c.avgFixDays}d</p>
                    <p className="font-mono text-[9px] uppercase text-muted-foreground">Avg fix</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-navy">{c.openTickets}</p>
                    <p className="font-mono text-[9px] uppercase text-muted-foreground">Open</p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">SLA</p>
                    <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.slaCompliance}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.7 }}
                        className={`h-full ${c.slaCompliance >= 90 ? "bg-teal-mid" : c.slaCompliance >= 75 ? "bg-amber" : "bg-danger"}`}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-navy">{c.slaCompliance}%</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Sparkline data={c.trend} />
                    <span className={`mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] ${up ? "text-teal-mid" : "text-danger"}`}>
                      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      6mo
                    </span>
                  </div>
                </div>

                {c.violations > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <Badge variant={c.violations > 5 ? "danger" : "warning"}>
                      {c.violations} SLA violation{c.violations > 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
