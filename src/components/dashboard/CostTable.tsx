import { useMemo, useState } from "react";
import { ArrowDownUp, Download } from "lucide-react";
import reports from "@/data/damage-reports.json";
import { Button } from "@/components/rp/Button";
import { Badge } from "@/components/rp/Badge";

interface Row {
  id: string;
  location: string;
  type: string;
  severity: "critical" | "moderate" | "minor";
  costEstimate: number;
  daysToFailure: number;
}

type SortKey = "cost" | "priority" | "days";

export function CostTable() {
  const [sort, setSort] = useState<SortKey>("priority");

  const rows = useMemo<Row[]>(() => (reports as Row[]).slice(0, 12), []);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      if (sort === "cost") return b.costEstimate - a.costEstimate;
      if (sort === "days") return a.daysToFailure - b.daysToFailure;
      // priority = cost / days
      return b.costEstimate / b.daysToFailure - a.costEstimate / a.daysToFailure;
    });
    return arr;
  }, [rows, sort]);

  const maxPriority = Math.max(...sorted.map((r) => r.costEstimate / r.daysToFailure));

  const exportCsv = () => {
    const header = "ID,Location,Type,Severity,Cost,Days to Failure\n";
    const body = sorted
      .map((r) => [r.id, r.location, r.type, r.severity, r.costEstimate, r.daysToFailure].join(","))
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roadpulse-cost-estimates.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div>
          <h3 className="font-display text-base font-semibold">AI Cost Estimation Engine</h3>
          <p className="text-xs text-muted-foreground">Auto-prioritised by failure risk & repair cost</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Road Segment</th>
              <th className="px-3 py-2.5 text-left font-medium">Damage</th>
              <th className="px-3 py-2.5 text-left font-medium">Severity</th>
              <th
                className="cursor-pointer px-3 py-2.5 text-right font-medium hover:text-teal"
                onClick={() => setSort("cost")}
              >
                <span className="inline-flex items-center gap-1">Cost <ArrowDownUp className="size-3" /></span>
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-left font-medium hover:text-teal"
                onClick={() => setSort("priority")}
              >
                <span className="inline-flex items-center gap-1">Priority <ArrowDownUp className="size-3" /></span>
              </th>
              <th className="px-5 py-2.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const priority = r.costEstimate / r.daysToFailure;
              const pct = (priority / maxPriority) * 100;
              const color = pct > 66 ? "#A32D2D" : pct > 33 ? "#BA7517" : "#1D9E75";
              const sevVariant = r.severity === "critical" ? "danger" : r.severity === "moderate" ? "warning" : "success";
              return (
                <tr key={r.id} className="border-t hover:bg-teal-light/30">
                  <td className="px-5 py-2.5">
                    <p className="font-medium">{r.location}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{r.id}</p>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.type}</td>
                  <td className="px-3 py-2.5"><Badge variant={sevVariant}>{r.severity}</Badge></td>
                  <td className="px-3 py-2.5 text-right font-mono">₹{r.costEstimate.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">{Math.round(pct)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <Button variant="ghost" size="sm">View →</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
