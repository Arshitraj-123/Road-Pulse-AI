import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat,
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Camera,
  TrendingUp,
  Wrench,
  IndianRupee,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import tickets from "@/data/tickets.json";
import reports from "@/data/damage-reports.json";

export const Route = createFileRoute("/contractor")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { isAuthenticated, role, isLoading, roleData } = useAuthStore.getState();

    // If session is still restoring, don't redirect yet
    if (isLoading) return;

    // Not logged in → send to login with context
    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { from: "/contractor" },
      });
    }

    // Logged in but wrong role → send to unauthorized
    if (role !== "contractor") {
      throw redirect({
        to: "/unauthorized",
        search: { required: "contractor", from: "/contractor" },
      });
    }

    // Check contractor approval status
    const approvalStatus = roleData?.approvalStatus;
    if (approvalStatus === "pending") {
      throw redirect({ to: "/contractor/pending" as string });
    }
    if (approvalStatus === "rejected") {
      throw redirect({ to: "/contractor/rejected" as string });
    }
    if (approvalStatus === "blacklisted") {
      throw redirect({ to: "/contractor/blacklisted" as string });
    }
  },
  head: () => ({
    meta: [
      { title: "Contractor Portal — RoadPulse AI" },
      { name: "description", content: "Manage assigned road repair tickets and update repair status." },
    ],
  }),
  component: ContractorPortal,
});

type TicketStatus = "new" | "in_progress" | "overdue" | "resolved";

interface WorkTicket {
  id: string;
  type: string;
  location: string;
  status: TicketStatus;
  minsAgo: number;
  severity: string;
  costEstimate: number;
  daysToFailure: number;
}

const statusMeta: Record<TicketStatus, { label: string; cls: string; icon: React.ElementType }> = {
  new: { label: "New", cls: "bg-navy-light text-navy border-navy-mid/30", icon: Clock },
  in_progress: { label: "In Progress", cls: "bg-amber-light text-amber border-amber/30", icon: Wrench },
  overdue: { label: "Overdue", cls: "bg-danger-light text-danger border-danger/30", icon: AlertTriangle },
  resolved: { label: "Resolved", cls: "bg-teal-light text-teal-dark border-teal-mid/30", icon: CheckCircle2 },
};

const MY_CONTRACTOR_ID = "C-002"; // BharatPave Ltd. — assigned in mock data

function ContractorPortal() {
  const { user, roleData, logout } = useAuthStore();
  const navigate = useNavigate();
  const push = useNotificationStore((s) => s.push);

  // Seed: merge tickets w/ report info, filter to "my" contractor + a few extras
  const seedTickets = useMemo<WorkTicket[]>(() => {
    const myReports = reports.filter((r) => r.contractorId === MY_CONTRACTOR_ID).slice(0, 8);
    return myReports.map((r, i) => {
      const t = tickets.find((tk) => tk.id === r.id);
      const statuses: TicketStatus[] = ["new", "in_progress", "overdue", "in_progress", "new", "resolved", "in_progress", "new"];
      return {
        id: r.id,
        type: r.type,
        location: r.location,
        status: (t?.status as TicketStatus) ?? statuses[i % statuses.length],
        minsAgo: t?.minsAgo ?? (i + 1) * 45,
        severity: r.severity,
        costEstimate: r.costEstimate,
        daysToFailure: r.daysToFailure,
      };
    });
  }, []);

  const [workTickets, setWorkTickets] = useState<WorkTicket[]>(seedTickets);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [selected, setSelected] = useState<WorkTicket | null>(null);

  useEffect(() => {
    // Welcome ping
    push({ type: "info", message: `Welcome back, ${user?.fullName?.split(" ")[0] || "Contractor"} — ${workTickets.filter(t => t.status !== "resolved").length} active tickets.` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = (id: string, status: TicketStatus) => {
    setWorkTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    push({
      type: status === "resolved" ? "success" : "info",
      message: `Ticket ${id} marked ${statusMeta[status].label.toLowerCase()}.`,
    });
  };

  const stats = useMemo(() => {
    const open = workTickets.filter((t) => t.status !== "resolved").length;
    const overdue = workTickets.filter((t) => t.status === "overdue").length;
    const resolved = workTickets.filter((t) => t.status === "resolved").length;
    const revenue = workTickets
      .filter((t) => t.status === "resolved")
      .reduce((a, t) => a + t.costEstimate, 0);
    return { open, overdue, resolved, revenue };
  }, [workTickets]);

  const filtered = workTickets.filter((t) => filter === "all" || t.status === filter);

  return (
    <div className="min-h-screen bg-surface transition-colors dark:bg-[#0A1628]">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card text-foreground transition-colors dark:border-white/10 dark:bg-[#0A1628]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-amber">
              <HardHat className="size-5 text-navy" />
            </div>
            <div>
              <p className="font-display text-base font-bold leading-none">RoadPulse</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Contractor Portal · {roleData?.companyName || user?.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted dark:border-white/15 dark:text-white/80 dark:hover:bg-white/5"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Work Queue</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Assigned repair tickets from Patna Municipal Corp · contractor ID{" "}
              <span className="font-mono text-foreground">{MY_CONTRACTOR_ID}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-teal-light px-3 py-1 text-xs font-medium text-teal-dark">
            <span className="size-1.5 animate-pulse rounded-full bg-teal-mid" />
            Live sync · last update 12s ago
          </div>
        </motion.div>

        {/* Stat strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Open", value: stats.open, icon: Clock, cls: "text-foreground" },
            { label: "Overdue", value: stats.overdue, icon: AlertTriangle, cls: "text-danger" },
            { label: "Resolved (mo.)", value: stats.resolved, icon: CheckCircle2, cls: "text-teal-dark" },
            { label: "Earned (₹)", value: stats.revenue.toLocaleString("en-IN"), icon: IndianRupee, cls: "text-amber" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <Icon className={`size-4 ${s.cls}`} />
                </div>
                <p className={`mt-2 font-display text-2xl font-bold ${s.cls}`}>{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {(["all", "new", "in_progress", "overdue", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-foreground text-background"
                  : "border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {f === "all" ? "All tickets" : statusMeta[f].label}
              <span className="ml-1.5 opacity-70">
                ({f === "all" ? workTickets.length : workTickets.filter((t) => t.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Ticket grid + detail panel */}
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* List */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-teal-light">
                  <CheckCircle2 className="size-7 text-teal-dark" />
                </div>
                <p className="font-display text-lg font-semibold text-foreground">All clear</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No tickets match this filter. Great work.
                </p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {filtered.map((t, i) => {
                const sm = statusMeta[t.status];
                const SIcon = sm.icon;
                const isSel = selected?.id === t.id;
                return (
                  <motion.button
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.03 }}
                    onClick={() => setSelected(t)}
                    className={`block w-full rounded-xl border bg-card p-4 text-left transition-all hover:border-teal-mid/50 hover:shadow-sm ${
                      isSel ? "border-teal-mid ring-2 ring-teal-mid/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${sm.cls}`}
                          >
                            <SIcon className="size-3" />
                            {sm.label}
                          </span>
                          {t.severity === "critical" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-danger-light px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-danger">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 font-display text-base font-semibold text-foreground">
                          {t.type}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" /> {t.location}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-base font-bold text-foreground">
                          ₹{t.costEstimate.toLocaleString("en-IN")}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          fails in {t.daysToFailure}d
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Detail panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">{selected.id}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${statusMeta[selected.status].cls}`}
                  >
                    {statusMeta[selected.status].label}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-foreground">{selected.type}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" /> {selected.location}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-surface p-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">Cost</p>
                    <p className="font-display text-sm font-bold text-foreground">
                      ₹{selected.costEstimate.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">SLA</p>
                    <p className="font-display text-sm font-bold text-amber">{selected.daysToFailure}d</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">Age</p>
                    <p className="font-display text-sm font-bold text-foreground">{selected.minsAgo}m</p>
                  </div>
                </div>

                <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Update status
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(["new", "in_progress", "resolved"] as TicketStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={selected.status === s}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected.status === s
                          ? "bg-muted text-muted-foreground"
                          : s === "resolved"
                          ? "bg-teal-mid text-white hover:bg-teal-dark"
                          : "border hover:bg-surface"
                      }`}
                    >
                      {statusMeta[s].label}
                    </button>
                  ))}
                </div>

                <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:border-teal-mid hover:text-teal-dark">
                  <Camera className="size-4" /> Upload completion photo
                </button>
              </motion.div>
            ) : (
              <div className="rounded-xl border border-dashed bg-card p-8 text-center">
                <TrendingUp className="mx-auto size-8 text-teal-mid" />
                <p className="mt-3 font-display text-sm font-semibold text-foreground">
                  Select a ticket
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click any ticket to view details and update status.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
