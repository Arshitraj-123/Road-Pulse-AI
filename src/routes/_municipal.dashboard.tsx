import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Bell, Download, FileText, CheckCircle2, Clock, IndianRupee } from "lucide-react";
import { StatCard } from "@/components/rp/StatCard";
import { Button } from "@/components/rp/Button";
import { Card } from "@/components/rp/Card";
import { DamageMap } from "@/components/dashboard/DamageMap";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { PredictiveBar } from "@/components/dashboard/PredictiveBar";
import { TicketFeed } from "@/components/dashboard/TicketFeed";
import { CostTable } from "@/components/dashboard/CostTable";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/_municipal/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — RoadPulse AI" },
      { name: "description", content: "Live municipal road operations dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { push } = useNotificationStore();
  const { name } = useAuthStore();

  useEffect(() => {
    const t1 = setTimeout(
      () => push({ type: "critical", message: "⚡ New critical report: Bailey Road km 4.1" }),
      3000
    );
    const t2 = setTimeout(
      () => push({ type: "success", message: "✅ Ticket #RP-12001 resolved by Alpha Builders" }),
      8000
    );
    const t3 = setTimeout(
      () => push({ type: "warning", message: "⚠ Road failure predicted: Boring Road — 48 hours" }),
      15000
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [push]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-5 py-6 sm:px-8">
      {/* Top bar */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Good morning, {(name ?? "Arjun").split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">{today} · Patna Municipal Corporation</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-md border bg-card p-2 hover:bg-muted">
            <Bell className="size-4" />
            <span className="absolute right-1 top-1 size-1.5 rounded-full bg-danger" />
          </button>
          <Button variant="primary" size="md">
            <Download className="size-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Reports" value={1247} icon={FileText} accent="danger" trend={12} trendDirection="up" />
        <StatCard label="Resolved This Week" value={342} icon={CheckCircle2} accent="teal" trend={8} trendDirection="down" />
        <StatCard label="Avg. Resolution Time" value={4.2} decimals={1} suffix=" d" icon={Clock} accent="amber" trend={5} trendDirection="down" />
        <StatCard label="Budget Allocated" value={2.4} decimals={1} prefix="₹" suffix=" Cr" icon={IndianRupee} accent="navy" />
      </div>

      {/* Row 1: Map + Donut */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-3"
        >
          <Card className="p-4" hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold">Live Damage Map</h3>
                <p className="text-xs text-muted-foreground">50 reports · Patna metro · updated just now</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-light px-2.5 py-1 text-[11px] font-medium text-danger">
                <span className="size-1.5 animate-pulse rounded-full bg-danger" /> LIVE
              </span>
            </div>
            <DamageMap />
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="p-4" hover={false}>
            <h3 className="mb-1 font-display text-base font-semibold">Damage Breakdown</h3>
            <p className="mb-2 text-xs text-muted-foreground">Last 30 days · all severities</p>
            <DonutChart />
          </Card>
        </motion.div>
      </div>

      {/* Row 2: Predictive + Feed */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-4" hover={false}>
            <div className="mb-3">
              <h3 className="font-display text-base font-semibold">Predictive Failure Timeline</h3>
              <p className="text-xs text-muted-foreground">Days to predicted failure · sorted by urgency</p>
            </div>
            <PredictiveBar />
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-4" hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-semibold">Live Ticket Feed</h3>
                <p className="text-xs text-muted-foreground">Streaming in real-time</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-light px-2.5 py-1 text-[11px] font-medium text-teal-dark">
                <span className="size-1.5 animate-pulse rounded-full bg-teal-mid" /> LIVE
              </span>
            </div>
            <TicketFeed />
          </Card>
        </motion.div>
      </div>

      {/* Row 3 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.4 }}
        className="mt-4 mb-10"
      >
        <CostTable />
      </motion.div>
    </div>
  );
}
