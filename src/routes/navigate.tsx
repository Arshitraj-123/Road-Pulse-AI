import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Navigation, MapPin, Clock, AlertTriangle, Shield, Zap, ArrowRight, Volume2, Car,
} from "lucide-react";
import damageData from "@/data/damage-reports.json";
import { Card } from "@/components/rp/Card";
import { Button } from "@/components/rp/Button";
import { Badge } from "@/components/rp/Badge";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export const Route = createFileRoute("/navigate")({
  head: () => ({
    meta: [
      { title: "Smart Navigate — RoadPulse AI" },
      { name: "description", content: "Route around potholes. Choose Safe, Balanced or Fast — RoadPulse warns you in real time." },
    ],
  }),
  component: NavigatePage,
});

interface Hazard {
  id: string;
  x: number; // %
  y: number; // %
  severity: "critical" | "moderate" | "minor";
  type: string;
  location: string;
}

const LAT_MIN = 25.572, LAT_MAX = 25.628, LNG_MIN = 85.108, LNG_MAX = 85.155;
const hazards: Hazard[] = damageData
  .filter((d: any) => d.status !== "resolved")
  .slice(0, 30)
  .map((d: any) => ({
    id: d.id,
    x: ((d.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100,
    y: 100 - ((d.lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100,
    severity: d.severity,
    type: d.type,
    location: d.location,
  }))
  .filter((h) => h.x > 2 && h.x < 98 && h.y > 2 && h.y < 98);

const sevColor: Record<Hazard["severity"], string> = {
  critical: "#a32d2d",
  moderate: "#ba7517",
  minor: "#1d9e75",
};

type Mode = "safe" | "balanced" | "fast";

const routes: Record<Mode, { d: string; color: string; time: number; distance: number; hazards: number; label: string }> = {
  safe:     { d: "M8,82 C 22,72 28,40 50,38 C 72,36 80,18 92,12",  color: "#1d9e75", time: 22, distance: 8.4, hazards: 1, label: "Safe Route" },
  balanced: { d: "M8,82 C 28,70 40,55 55,48 C 75,40 84,22 92,12",  color: "#185fa5", time: 17, distance: 7.1, hazards: 4, label: "Balanced" },
  fast:     { d: "M8,82 L 35,68 L 55,52 L 72,32 L 92,12",          color: "#ba7517", time: 13, distance: 6.5, hazards: 9, label: "Fast Route" },
};

function NavigatePage() {
  const [mode, setMode] = useState<Mode>("balanced");
  const [navigating, setNavigating] = useState(false);
  const [voice, setVoice] = useState(true);

  const route = routes[mode];
  const upcomingHazards = useMemo(() => hazards.filter((h) => h.severity !== "minor").slice(0, 3), []);

  return (
    <div className="min-h-screen bg-surface transition-colors dark:bg-[#0A1628]">
      <PublicNavbar />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-teal-mid">Smart Navigate</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Route around potholes, not into them.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live damage data from RoadPulse · re-routes every 30 seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Map */}
          <Card className="overflow-hidden p-0" hover={false}>
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 transition-colors dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-mono text-foreground">
                  <span className="size-2 rounded-full bg-teal-mid" /> From: Gandhi Maidan
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <span className="flex items-center gap-1.5 font-mono text-foreground">
                  <span className="size-2 rounded-full bg-danger" /> To: Patna Junction
                </span>
              </div>
              <button
                onClick={() => setVoice(!voice)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-mono ${voice ? "bg-teal-light text-teal-dark" : "bg-muted text-muted-foreground"}`}
              >
                <Volume2 className="size-3" /> Voice {voice ? "on" : "off"}
              </button>
            </div>

            <div className="relative aspect-[16/11] w-full bg-[#0a1628]">
              {/* base grid + roads */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
                <defs>
                  <pattern id="nav-grid" width="6" height="6" patternUnits="userSpaceOnUse">
                    <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#1d9e75" strokeOpacity="0.08" strokeWidth="0.3" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#nav-grid)" />
                {[
                  "M0 30 L100 35", "M0 55 L100 50", "M0 78 L100 75",
                  "M20 0 L25 100", "M55 0 L52 100", "M82 0 L80 100",
                  "M0 12 L100 18",
                ].map((d, i) => (
                  <path key={i} d={d} stroke="#1d9e75" strokeOpacity="0.18" strokeWidth="0.5" fill="none" />
                ))}

                {/* ghost (non-selected) routes */}
                {(Object.keys(routes) as Mode[]).filter((m) => m !== mode).map((m) => (
                  <path
                    key={m}
                    d={routes[m].d}
                    fill="none"
                    stroke={routes[m].color}
                    strokeOpacity="0.22"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray="2 1.5"
                  />
                ))}

                {/* active route casing */}
                <path d={route.d} fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="3.2" strokeLinecap="round" />
                <motion.path
                  key={mode}
                  d={route.d}
                  fill="none"
                  stroke={route.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  style={{ filter: `drop-shadow(0 0 4px ${route.color})` }}
                />
                {navigating && (
                  <motion.path
                    d={route.d}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeDasharray="3 30"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -66 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    opacity="0.85"
                  />
                )}

                {/* endpoints */}
                <circle cx="8" cy="82" r="1.8" fill="#1d9e75" stroke="#fff" strokeWidth="0.6" />
                <circle cx="92" cy="12" r="1.8" fill="#a32d2d" stroke="#fff" strokeWidth="0.6" />
              </svg>

              {/* hazards */}
              {hazards.map((h, i) => {
                const size = h.severity === "critical" ? 9 : h.severity === "moderate" ? 7 : 5;
                return (
                  <motion.div
                    key={h.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.02 }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  >
                    {h.severity === "critical" && (
                      <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: sevColor[h.severity],
                          width: size * 2.6, height: size * 2.6, opacity: 0.35,
                          animation: "nav-ping 1.8s cubic-bezier(0,0,0.2,1) infinite",
                        }}
                      />
                    )}
                    <span
                      className="block rounded-full ring-2 ring-white/40"
                      style={{ width: size, height: size, background: sevColor[h.severity] }}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-3 z-30 hidden w-44 -translate-x-1/2 rounded-md border border-white/10 bg-[#0a1628]/95 p-2 text-[10px] text-white shadow-xl group-hover:block">
                      <p className="font-mono font-semibold text-teal-mid">{h.id}</p>
                      <p>{h.type}</p>
                      <p className="truncate text-white/60">{h.location}</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* legend */}
              <div className="absolute bottom-3 left-3 z-10 rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-mono text-white/90 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#a32d2d]" />Critical</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#ba7517]" />Moderate</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#1d9e75]" />Minor</span>
                </div>
              </div>

              {/* live re-route pill */}
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] text-white backdrop-blur">
                <span className="size-2 rounded-full bg-teal-mid animate-pulse" />
                Live · {hazards.length} hazards
              </div>

              <style>{`@keyframes nav-ping { 75%, 100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; } }`}</style>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Route selector */}
            <Card className="p-5" hover={false}>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Choose route
              </h2>
              <div className="space-y-2">
                {(Object.keys(routes) as Mode[]).map((m) => {
                  const r = routes[m];
                  const icon = m === "safe" ? Shield : m === "fast" ? Zap : Car;
                  const Icon = icon;
                  const active = mode === m;
                  return (
                    <motion.button
                      key={m}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMode(m)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        active ? "border-teal-mid bg-teal-light/40 ring-1 ring-teal-mid" : "border-border hover:border-teal-mid/40 hover:bg-muted/40"
                      }`}
                    >
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ background: r.color }}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-display text-sm font-bold text-foreground">{r.label}</p>
                          <p className="font-mono text-sm font-bold text-foreground">{r.time}m</p>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                          <span>{r.distance} km</span>
                          <span className={r.hazards <= 2 ? "text-teal-mid" : r.hazards <= 5 ? "text-amber" : "text-danger"}>
                            {r.hazards} hazards
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="mt-4 w-full"
                onClick={() => setNavigating((n) => !n)}
              >
                <Navigation className="size-4" />
                {navigating ? "Stop navigation" : "Start navigation"}
              </Button>
            </Card>

            {/* ETA card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <Card className="p-5" hover={false}>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <Clock className="mx-auto size-4 text-teal-mid" />
                      <p className="mt-1 font-display text-xl font-bold text-foreground">{route.time}m</p>
                      <p className="font-mono text-[10px] uppercase text-muted-foreground">ETA</p>
                    </div>
                    <div>
                      <MapPin className="mx-auto size-4 text-teal-mid" />
                      <p className="mt-1 font-display text-xl font-bold text-foreground">{route.distance}<span className="text-xs">km</span></p>
                      <p className="font-mono text-[10px] uppercase text-muted-foreground">Distance</p>
                    </div>
                    <div>
                      <AlertTriangle className="mx-auto size-4 text-amber" />
                      <p className="mt-1 font-display text-xl font-bold text-foreground">{route.hazards}</p>
                      <p className="font-mono text-[10px] uppercase text-muted-foreground">Hazards</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Upcoming alerts */}
            <Card className="p-5" hover={false}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                  Upcoming alerts
                </h2>
                <Badge variant="live">Live</Badge>
              </div>
              <ul className="space-y-2">
                {upcomingHazards.map((h, i) => (
                  <motion.li
                    key={h.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2.5 rounded-lg border bg-card p-2.5"
                  >
                    <span
                      className="mt-0.5 inline-block size-2.5 shrink-0 rounded-full"
                      style={{ background: sevColor[h.severity] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{h.type}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">{h.location}</p>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{(i + 1) * 320}m</span>
                  </motion.li>
                ))}
              </ul>
              {voice && navigating && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 rounded-md bg-muted/50 p-2.5 text-xs italic text-foreground transition-colors dark:bg-white/5"
                >
                  <Volume2 className="size-3.5 shrink-0 text-muted-foreground" />
                  "Critical pothole ahead in 320 meters. Slow down."
                </motion.p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
