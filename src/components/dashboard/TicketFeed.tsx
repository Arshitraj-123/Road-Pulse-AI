import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import seed from "@/data/tickets.json";
import { Badge } from "@/components/rp/Badge";

interface Ticket {
  id: string;
  type: string;
  location: string;
  status: "new" | "in_progress" | "resolved" | "overdue";
  minsAgo: number;
}

const statusVariant: Record<Ticket["status"], "info" | "warning" | "success" | "danger"> = {
  new: "info",
  in_progress: "warning",
  resolved: "success",
  overdue: "danger",
};

const photoColors = ["#1D9E75", "#185FA5", "#BA7517", "#A32D2D", "#0F6E56"];

const newTypes = ["Grade 3 Pothole", "Alligator Cracking", "Edge Failure"];
const newLocs = ["NH-30 Bypass", "Bailey Road", "Boring Road", "Ashok Rajpath", "Fraser Road"];

export function TicketFeed() {
  const [tickets, setTickets] = useState<Ticket[]>(seed as Ticket[]);
  const [filter, setFilter] = useState<"all" | "critical" | "overdue" | "today">("all");

  useEffect(() => {
    const t = setInterval(() => {
      const id = `RP-${12400 + Math.floor(Math.random() * 999)}`;
      const next: Ticket = {
        id,
        type: newTypes[Math.floor(Math.random() * newTypes.length)],
        location: newLocs[Math.floor(Math.random() * newLocs.length)],
        status: "new",
        minsAgo: 0,
      };
      setTickets((prev) => [next, ...prev].slice(0, 20));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const filtered = tickets.filter((t) =>
    filter === "all" ? true :
    filter === "overdue" ? t.status === "overdue" :
    filter === "critical" ? t.type.includes("Grade 3") || t.type.includes("Alligator") :
    t.minsAgo < 1440
  );

  return (
    <div className="flex h-[380px] flex-col">
      <div className="mb-3 flex gap-1">
        {(["all", "critical", "overdue", "today"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
              filter === k
                ? "bg-teal-mid text-white"
                : "bg-muted text-muted-foreground hover:bg-teal-light"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 rounded-lg border bg-card p-2.5 hover:bg-teal-light/30"
            >
              <div
                className="size-9 shrink-0 rounded-md"
                style={{ background: photoColors[i % photoColors.length] }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-teal">{t.id}</span>
                  <Badge variant={statusVariant[t.status]}>{t.status.replace("_", " ")}</Badge>
                </div>
                <p className="truncate text-sm">{t.type}</p>
                <p className="truncate text-[11px] text-muted-foreground">{t.location}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {t.minsAgo < 60 ? `${t.minsAgo}m` : `${Math.floor(t.minsAgo / 60)}h`}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
