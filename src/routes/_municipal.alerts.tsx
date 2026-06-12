import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { AlertTriangle, Zap, Info, CheckCircle2, Bell, BellOff, X } from "lucide-react";
import reports from "@/data/damage-reports.json";

export const Route = createFileRoute("/_municipal/alerts")({
  head: () => ({ meta: [{ title: "Alerts — RoadPulse AI" }] }),
  component: AlertsPage,
});

type AlertKind = "critical" | "warning" | "info" | "success";
interface Alert {
  id: string;
  kind: AlertKind;
  title: string;
  body: string;
  ts: string;
  source: string;
  read: boolean;
}

const meta: Record<AlertKind, { icon: React.ElementType; cls: string; ring: string }> = {
  critical: { icon: AlertTriangle, cls: "bg-danger-light text-danger", ring: "border-danger/40" },
  warning: { icon: Zap, cls: "bg-amber-light text-amber", ring: "border-amber/40" },
  info: { icon: Info, cls: "bg-muted text-foreground", ring: "border-border" },
  success: { icon: CheckCircle2, cls: "bg-teal-light text-teal-dark", ring: "border-teal-mid/40" },
};

function seedAlerts(): Alert[] {
  const critical = reports
    .filter((r) => r.severity === "critical" && r.daysToFailure < 8)
    .slice(0, 5)
    .map((r) => ({
      id: `A-${r.id}`,
      kind: "critical" as const,
      title: `Imminent failure: ${r.type}`,
      body: `${r.location} predicted to fail in ${r.daysToFailure} days. Confidence ${r.confidence.toFixed(1)}%.`,
      ts: `${r.daysToFailure * 12}m ago`,
      source: `AI Predictor · ${r.id}`,
      read: false,
    }));
  const warning = reports
    .filter((r) => r.severity === "moderate")
    .slice(0, 3)
    .map((r) => ({
      id: `A-${r.id}-w`,
      kind: "warning" as const,
      title: "SLA breach approaching",
      body: `${r.location} ticket exceeded 72-hour response window. Contractor ${r.contractorId} not acknowledged.`,
      ts: `${r.daysToFailure * 6}m ago`,
      source: `SLA Monitor · ${r.contractorId}`,
      read: false,
    }));
  const info: Alert[] = [
    { id: "A-SYS-1", kind: "info", title: "Detection model updated", body: "v3.2 deployed: +4.1% recall on alligator cracking class.", ts: "2h ago", source: "RoadPulse AI", read: true },
    { id: "A-SYS-2", kind: "info", title: "Drone sweep scheduled", body: "Sector 7 (Boring Road–AIIMS corridor) drone capture tomorrow 06:00 IST.", ts: "5h ago", source: "Ops · Drone Fleet", read: true },
  ];
  const success: Alert[] = [
    { id: "A-SYS-3", kind: "success", title: "47 tickets closed this week", body: "Alpha Builders cleared backlog 12 days ahead of SLA. Bonus eligibility triggered.", ts: "1d ago", source: "Performance", read: true },
  ];
  return [...critical, ...warning, ...info, ...success];
}

function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [filter, setFilter] = useState<AlertKind | "all" | "unread">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return alerts;
    if (filter === "unread") return alerts.filter((a) => !a.read);
    return alerts.filter((a) => a.kind === filter);
  }, [alerts, filter]);

  const unread = alerts.filter((a) => !a.read).length;

  const markAllRead = () => setAlerts((a) => a.map((x) => ({ ...x, read: true })));
  const dismiss = (id: string) => setAlerts((a) => a.filter((x) => x.id !== id));
  const toggleRead = (id: string) =>
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, read: !x.read } : x)));

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-foreground">
            Alerts
            {unread > 0 && (
              <span className="rounded-full bg-danger px-2 py-0.5 font-mono text-xs font-bold text-white">
                {unread}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI predictions, SLA breaches, and system notifications · real-time
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className="flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:border-teal-mid disabled:opacity-40"
        >
          <BellOff className="size-3.5" /> Mark all read
        </button>
      </motion.div>

      {/* Filter chips */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {(["all", "unread", "critical", "warning", "info", "success"] as const).map((f) => {
          const count =
            f === "all"
              ? alerts.length
              : f === "unread"
              ? unread
              : alerts.filter((a) => a.kind === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-foreground text-background"
                  : "border bg-card text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {f[0].toUpperCase() + f.slice(1)}
              <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Stream */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.map((a, i) => {
            const m = meta[a.kind];
            const Icon = m.icon;
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02 }}
                className={`group relative flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors ${
                  !a.read ? `border-l-4 ${m.ring}` : ""
                }`}
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${m.cls}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-display text-sm ${!a.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                      {a.title}
                    </p>
                    {!a.read && <span className="size-1.5 rounded-full bg-teal-mid" />}
                    <span className="font-mono text-[10px] text-muted-foreground">{a.ts}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {a.source}
                  </p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => toggleRead(a.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
                    title={a.read ? "Mark unread" : "Mark read"}
                  >
                    <Bell className="size-3.5" />
                  </button>
                  <button
                    onClick={() => dismiss(a.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-danger-light hover:text-danger"
                    title="Dismiss"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-teal-light">
              <CheckCircle2 className="size-7 text-teal-dark" />
            </div>
            <p className="font-display text-lg font-semibold text-foreground">Inbox zero</p>
            <p className="mt-1 text-sm text-muted-foreground">No alerts match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
