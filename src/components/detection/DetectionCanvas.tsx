import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  severity: "critical" | "moderate" | "minor";
  // percentages
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  image: string | null;
  detections: Detection[];
  scanning: boolean;
}

const severityColor: Record<string, string> = {
  critical: "#a32d2d",
  moderate: "#ba7517",
  minor: "#1d9e75",
};

export function DetectionCanvas({ image, detections, scanning }: Props) {
  const [scanY, setScanY] = useState(0);

  useEffect(() => {
    if (!scanning) return;
    let raf = 0;
    let t0 = performance.now();
    const loop = (t: number) => {
      const elapsed = (t - t0) / 1800;
      setScanY(((elapsed % 1) * 100));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scanning]);

  if (!image) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 text-center text-sm text-muted-foreground">
        Upload an image to begin
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border bg-navy-deep">
      <img src={image} alt="Road sample" className="absolute inset-0 size-full object-cover" />

      {/* corner grid overlay */}
      <svg className="absolute inset-0 size-full opacity-30 mix-blend-screen" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d9e75" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* corner brackets */}
      {[
        "left-3 top-3 border-l-2 border-t-2",
        "right-3 top-3 border-r-2 border-t-2",
        "left-3 bottom-3 border-l-2 border-b-2",
        "right-3 bottom-3 border-r-2 border-b-2",
      ].map((c) => (
        <div key={c} className={`absolute size-6 border-teal-mid ${c}`} />
      ))}

      {/* scanning line */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 h-[3px] bg-teal-mid shadow-[0_0_24px_rgba(29,158,117,0.95)]"
            style={{ top: `${scanY}%` }}
          />
        )}
      </AnimatePresence>

      {/* status pill */}
      <div className="absolute left-3 top-3 ml-9 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 font-mono text-[11px] text-white backdrop-blur">
        <span className={`size-2 rounded-full ${scanning ? "bg-teal-mid animate-pulse" : detections.length ? "bg-amber" : "bg-white/40"}`} />
        {scanning ? "ANALYZING…" : detections.length ? `${detections.length} DEFECTS` : "STANDBY"}
      </div>

      {/* bounding boxes */}
      <AnimatePresence>
        {!scanning && detections.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 220, damping: 20 }}
            className="absolute"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.w}%`,
              height: `${d.h}%`,
              border: `2px solid ${severityColor[d.severity]}`,
              boxShadow: `0 0 0 1px rgba(0,0,0,0.4), 0 0 18px ${severityColor[d.severity]}80`,
            }}
          >
            <div
              className="absolute -top-6 left-0 whitespace-nowrap rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold text-white"
              style={{ background: severityColor[d.severity] }}
            >
              {d.label} · {d.confidence.toFixed(1)}%
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
