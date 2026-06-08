import { motion } from "framer-motion";
import damageData from "@/data/damage-reports.json";

interface Report {
  id: string;
  lat: number;
  lng: number;
  severity: "critical" | "moderate" | "minor";
  type: string;
  location: string;
  costEstimate: number;
}

const reports = damageData as Report[];

const severityColor: Record<Report["severity"], string> = {
  critical: "#A32D2D",
  moderate: "#BA7517",
  minor: "#1D9E75",
};

// Patna bbox approx
const LAT_MIN = 25.572;
const LAT_MAX = 25.628;
const LNG_MIN = 85.108;
const LNG_MAX = 85.155;

function project(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return { x, y };
}

export function DamageMap() {
  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-xl border bg-[#0a1628]">
      {/* stylized SVG road grid */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#1D9E75" strokeOpacity="0.08" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {/* fake roads */}
        {[
          "M0 30 L100 35",
          "M0 55 L100 50",
          "M0 78 L100 75",
          "M20 0 L25 100",
          "M55 0 L52 100",
          "M82 0 L80 100",
          "M0 12 L100 18",
        ].map((d, i) => (
          <path key={i} d={d} stroke="#1D9E75" strokeOpacity="0.22" strokeWidth="0.6" fill="none" />
        ))}
      </svg>

      {/* legend & toggles */}
      <div className="absolute left-3 top-3 z-10 flex gap-1.5">
        {(["Heatmap", "Markers", "Clusters"] as const).map((b, i) => (
          <button
            key={b}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium backdrop-blur ${
              i === 1
                ? "bg-teal-mid text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="absolute right-3 top-3 z-10 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] text-white/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#A32D2D]"/>Critical</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#BA7517]"/>Moderate</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#1D9E75]"/>Minor</span>
        </div>
      </div>

      {/* markers */}
      {reports.map((r, i) => {
        const { x, y } = project(r.lat, r.lng);
        if (x < 0 || x > 100 || y < 0 || y > 100) return null;
        const c = severityColor[r.severity];
        const size = r.severity === "critical" ? 10 : r.severity === "moderate" ? 8 : 6;
        return (
          <motion.div
            key={r.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.015, duration: 0.3 }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: c,
                width: size * 2.4,
                height: size * 2.4,
                marginLeft: -size * 1.2,
                marginTop: -size * 1.2,
                opacity: 0.3,
                animation: r.severity === "critical" ? "ping 1.6s cubic-bezier(0,0,0.2,1) infinite" : undefined,
              }}
            />
            <span
              className="block cursor-pointer rounded-full ring-2 ring-white/30"
              style={{ background: c, width: size, height: size }}
            />
            <div className="pointer-events-none absolute left-1/2 top-3 z-20 hidden w-44 -translate-x-1/2 rounded-md border border-white/10 bg-[#0a1628]/95 p-2 text-[11px] text-white shadow-xl group-hover:block">
              <p className="font-mono font-semibold text-teal-mid">{r.id}</p>
              <p className="font-medium">{r.type}</p>
              <p className="truncate text-white/60">{r.location}</p>
              <p className="mt-1 font-mono text-amber-light">₹{r.costEstimate.toLocaleString("en-IN")}</p>
            </div>
          </motion.div>
        );
      })}

      <style>{`@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>
    </div>
  );
}
