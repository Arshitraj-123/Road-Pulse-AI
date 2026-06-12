import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, Check, X, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/rp/Card";
import { Badge } from "@/components/rp/Badge";
import { api } from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";

export const Route = createFileRoute("/_municipal/contractors")({
  head: () => ({ meta: [{ title: "Contractors — RoadPulse AI" }] }),
  component: ContractorsPage,
});

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
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

// Define the shape coming from our API
interface Contractor {
  _id: string;
  companyName: string;
  licenseNumber: string;
  approvalStatus: string;
  createdAt: string;
  profileId?: { fullName: string; email: string };
  performance: {
    grade: string;
    resolutionRate: number;
    openTickets: number;
    avgFixDays: number;
    slaCompliance: number;
    violations: number;
    trendHistory: number[];
  };
}

function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const push = useNotificationStore((s) => s.push);

  const fetchContractors = async () => {
    try {
      const res = await api.get('/api/municipal/contractors');
      if (res.success) {
        setContractors(res.contractors);
      }
    } catch (err) {
      push({ type: 'error', message: 'Failed to load contractors' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await api.patch(`/api/municipal/contractors/${id}/approve`, {
        approved,
        reason: approved ? undefined : "Does not meet municipal requirements."
      });
      if (res.success) {
        push({ type: 'success', message: `Contractor ${approved ? 'approved' : 'rejected'} successfully.` });
        fetchContractors(); // reload data
      }
    } catch (err) {
      push({ type: 'error', message: 'Failed to update status' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-teal-mid" />
      </div>
    );
  }

  const pending = contractors.filter(c => c.approvalStatus === 'pending');
  const approvedList = contractors.filter(c => c.approvalStatus === 'approved');

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-10">
      
      {/* PENDING REQUESTS SECTION */}
      {pending.length > 0 && (
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              Pending Requests
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-danger text-xs text-white">
                {pending.length}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">Contractors awaiting access approval</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AnimatePresence>
              {pending.map((c) => (
                <motion.div key={c._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className="flex flex-col justify-between p-5 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">{c.companyName}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {c.profileId?.fullName} · {c.profileId?.email}
                      </p>
                      <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        <span>License: {c.licenseNumber}</span>
                        <span>·</span>
                        <span>Submitted: {new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
                      <button className="flex items-center gap-1.5 rounded-md border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-muted">
                        <FileText className="size-3.5" /> Docs
                      </button>
                      <button 
                        onClick={() => handleApprove(c._id, false)}
                        className="flex items-center gap-1.5 rounded-md border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20"
                      >
                        <X className="size-3.5" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(c._id, true)}
                        className="flex items-center gap-1.5 rounded-md bg-teal-mid px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-dark"
                      >
                        <Check className="size-3.5" /> Approve
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* APPROVED SCORECARD */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-teal-mid">Accountability</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-foreground sm:text-4xl">Contractor Scorecard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live grades · SLA compliance · trend over last 6 months</p>
      </motion.div>

      {approvedList.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          No approved contractors found for your municipality.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {approvedList.map((c, i) => {
            const p = c.performance;
            const up = p.trendHistory && p.trendHistory.length > 0 && p.trendHistory[p.trendHistory.length - 1] >= p.trendHistory[0];
            const gradeColor =
              p.grade === "A+" || p.grade === "A-" || p.grade === "A"
                ? "bg-teal-mid text-white"
                : p.grade.startsWith("B")
                ? "bg-teal-light text-teal-dark"
                : p.grade.startsWith("C")
                ? "bg-amber-light text-amber"
                : p.grade.startsWith("D")
                ? "bg-danger-light text-danger"
                : "bg-navy-light text-navy";

            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{c.licenseNumber}</p>
                      <h3 className="mt-0.5 truncate font-display text-lg font-bold text-foreground">{c.companyName}</h3>
                    </div>
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-extrabold ${gradeColor}`}>
                      {p.grade}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">{p.resolutionRate}%</p>
                      <p className="font-mono text-[9px] uppercase text-muted-foreground">Resolved</p>
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">{p.avgFixDays}d</p>
                      <p className="font-mono text-[9px] uppercase text-muted-foreground">Avg fix</p>
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">{p.openTickets}</p>
                      <p className="font-mono text-[9px] uppercase text-muted-foreground">Open</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase text-muted-foreground">SLA</p>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.slaCompliance}%` }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.7 }}
                          className={`h-full ${p.slaCompliance >= 90 ? "bg-teal-mid" : p.slaCompliance >= 75 ? "bg-amber" : "bg-danger"}`}
                        />
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-foreground">{p.slaCompliance}%</p>
                    </div>
                    {p.trendHistory && p.trendHistory.length > 0 && (
                      <div className="flex flex-col items-end">
                        <Sparkline data={p.trendHistory} />
                        <span className={`mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] ${up ? "text-teal-mid" : "text-danger"}`}>
                          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          6mo
                        </span>
                      </div>
                    )}
                  </div>

                  {p.violations > 0 && (
                    <div className="mt-4 border-t pt-3">
                      <Badge variant={p.violations > 5 ? "danger" : "warning"}>
                        {p.violations} SLA violation{p.violations > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
