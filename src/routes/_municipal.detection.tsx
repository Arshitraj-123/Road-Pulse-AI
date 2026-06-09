import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, RotateCcw, Send, Cpu, AlertTriangle, IndianRupee, Clock } from "lucide-react";
import { Card } from "@/components/rp/Card";
import { Button } from "@/components/rp/Button";
import { Badge } from "@/components/rp/Badge";
import { UploadDropzone } from "@/components/detection/UploadDropzone";
import { DetectionCanvas, type Detection } from "@/components/detection/DetectionCanvas";
import { useNotificationStore } from "@/store/useNotificationStore";

export const Route = createFileRoute("/_municipal/detection")({
  head: () => ({
    meta: [
      { title: "AI Detection — RoadPulse AI" },
      { name: "description", content: "Upload a road image — RoadPulse classifies 10 damage types in under a second." },
    ],
  }),
  component: DetectionPage,
});

const MOCK: Detection[] = [
  { id: "d1", label: "Grade 3 Pothole", confidence: 96.2, severity: "critical", x: 32, y: 44, w: 22, h: 26 },
  { id: "d2", label: "Alligator Cracking", confidence: 91.4, severity: "moderate", x: 8, y: 18, w: 28, h: 18 },
  { id: "d3", label: "Edge Failure", confidence: 84.0, severity: "minor", x: 65, y: 60, w: 26, h: 22 },
];

const PIPELINE = [
  "Pre-processing image (CLAHE + denoise)…",
  "Running YOLOv8-RP inference…",
  "Cross-validating with severity model…",
  "Estimating cost & failure window…",
];

function DetectionPage() {
  const { push } = useNotificationStore();
  const [image, setImage] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [step, setStep] = useState(0);
  const [dispatched, setDispatched] = useState(false);

  const onFile = (url: string, name: string) => {
    setImage(url);
    setFilename(name);
    setDetections([]);
    setDispatched(false);
    setScanning(true);
    setStep(0);

    const stepTimers = PIPELINE.map((_, i) =>
      setTimeout(() => setStep(i + 1), 450 * (i + 1))
    );
    setTimeout(() => {
      setScanning(false);
      setDetections(MOCK);
      push({ type: "success", message: `✅ Detected 3 defects in ${name.slice(0, 24)}` });
    }, 450 * (PIPELINE.length + 1));

    return () => stepTimers.forEach(clearTimeout);
  };

  const reset = () => {
    setImage(null);
    setDetections([]);
    setScanning(false);
    setStep(0);
    setDispatched(false);
  };

  const dispatch = () => {
    setDispatched(true);
    push({ type: "info", message: "📨 Ticket RP-12399 created · assigned to Alpha Builders" });
  };

  const totalCost = detections.reduce((s, d) => s + (d.severity === "critical" ? 1500 : d.severity === "moderate" ? 2400 : 750), 0);
  const earliest = detections.length ? Math.min(...detections.map((d) => (d.severity === "critical" ? 6 : d.severity === "moderate" ? 18 : 30))) : 0;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-teal-mid">Inference Lab</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy sm:text-4xl">AI Damage Detection</h1>
          <p className="mt-1 text-sm text-muted-foreground">YOLOv8-RP · 10 damage classes · avg 0.82s per frame</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={reset} disabled={!image}>
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button onClick={dispatch} disabled={!detections.length || dispatched}>
            <Send className="size-4" />
            {dispatched ? "Dispatched" : "Dispatch ticket"}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {!image ? (
            <UploadDropzone onFile={onFile} disabled={scanning} />
          ) : (
            <>
              <DetectionCanvas image={image} detections={detections} scanning={scanning} />
              <p className="font-mono text-[11px] text-muted-foreground">{filename}</p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="size-4 text-teal-mid" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-navy">Pipeline</h2>
            </div>
            <ol className="space-y-2">
              {PIPELINE.map((p, i) => {
                const done = step > i;
                const active = scanning && step === i;
                return (
                  <li key={p} className="flex items-start gap-3 font-mono text-xs">
                    <span
                      className={`mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                        done ? "bg-teal-mid text-white" : active ? "bg-amber text-white animate-pulse" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={done ? "text-navy" : active ? "text-amber" : "text-muted-foreground"}>{p}</span>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-navy">Detections</h2>
              <Badge variant="info">{detections.length}</Badge>
            </div>
            <AnimatePresence mode="popLayout">
              {!detections.length ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {scanning ? "Analyzing…" : "No image analyzed yet."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {detections.map((d, i) => (
                    <motion.li
                      key={d.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">{d.label}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          conf {d.confidence.toFixed(1)}% · {d.severity}
                        </p>
                      </div>
                      <Badge
                        variant={d.severity === "critical" ? "danger" : d.severity === "moderate" ? "warning" : "success"}
                      >
                        {d.severity}
                      </Badge>
                    </motion.li>
                  ))}
                </ul>
              )}
            </AnimatePresence>
          </Card>

          {detections.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5">
                <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-navy">
                  Action Brief
                </h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-danger-light p-3">
                    <AlertTriangle className="mx-auto size-4 text-danger" />
                    <p className="mt-1 font-display text-lg font-bold text-danger">
                      {detections.filter((d) => d.severity === "critical").length}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-danger/80">Critical</p>
                  </div>
                  <div className="rounded-lg bg-teal-light p-3">
                    <IndianRupee className="mx-auto size-4 text-teal-dark" />
                    <p className="mt-1 font-display text-lg font-bold text-teal-dark">
                      ₹{totalCost.toLocaleString("en-IN")}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-teal-dark/80">Est. cost</p>
                  </div>
                  <div className="rounded-lg bg-amber-light p-3">
                    <Clock className="mx-auto size-4 text-amber" />
                    <p className="mt-1 font-display text-lg font-bold text-amber">{earliest}d</p>
                    <p className="font-mono text-[10px] uppercase text-amber/80">To failure</p>
                  </div>
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-navy-light p-3 text-xs text-navy">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-navy-mid" />
                  <span>
                    Recommend immediate dispatch to <strong>Alpha Builders</strong> (98% SLA) — within failure window.
                  </span>
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
