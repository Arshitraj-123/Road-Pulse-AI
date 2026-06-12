import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  TrendingUp,
  Award,
  Map as MapIcon,
  ChevronDown,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoadPulse AI — Roads That Think Ahead" },
      {
        name: "description",
        content:
          "Detect damage. Predict failure. Route safely. Hold contractors accountable.",
      },
      { property: "og:title", content: "RoadPulse AI" },
      {
        property: "og:description",
        content: "AI-powered road infrastructure intelligence for India.",
      },
    ],
  }),
  component: Home,
});

const cyclingWords = ["Think", "Heal", "Warn", "Protect"];

const features = [
  {
    icon: Shield,
    title: "AI Damage Detection",
    desc: "10 damage types in under 1 second.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Maintenance",
    desc: "Know before roads fail.",
  },
  {
    icon: Award,
    title: "Contractor Accountability",
    desc: "Wall of Shame rankings.",
  },
  {
    icon: MapIcon,
    title: "Safe Navigation",
    desc: "Pothole-aware routing.",
  },
];

// deterministic pseudo-random pins
const pins = Array.from({ length: 8 }, (_, i) => {
  const seed = (i + 1) * 9301;
  const x = ((seed * 49297) % 233280) / 233280;
  const y = ((seed * 12345) % 99173) / 99173;
  return {
    left: 10 + x * 80,
    top: 18 + y * 60,
    delay: i * 0.15,
    type: i % 2 === 0 ? "critical" : "moderate",
    label: i % 2 === 0 ? "Grade 3 Pothole" : "Edge Failure",
    cost: 800 + i * 200,
    days: 4 + i,
  };
});

function Home() {
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % cyclingWords.length), 2000);
    return () => clearInterval(t);
  }, []);

  const tickerItems = useMemo(
    () => [
      "⚡ 9,438 Lives Lost to Potholes (2020–2024)",
      "• ₹30 Cr Projected Annual Savings",
      "• 10× Faster Contractor Resolution",
      "• 60% Drop in Hazard Exposure",
      "• 94.7% AI Detection Confidence",
    ],
    []
  );

  return (
    <div className="min-h-screen bg-surface dark:bg-[#0A1628] text-foreground transition-colors">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        {/* animated grid */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="hgrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1D9E75" strokeOpacity="0.08" strokeWidth="1" />
            </pattern>
            <linearGradient id="pulseG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1D9E75" stopOpacity="0" />
              <stop offset="50%" stopColor="#1D9E75" stopOpacity="1" />
              <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#hgrid)" />
          {/* faux roads */}
          {[
            "M 0 200 L 1200 240",
            "M 0 420 L 1200 380",
            "M 0 600 L 1200 640",
            "M 200 0 L 240 800",
            "M 600 0 L 580 800",
            "M 940 0 L 980 800",
          ].map((d, i) => (
            <g key={i}>
              <path d={d} stroke="#1D9E75" strokeOpacity="0.15" strokeWidth="2" fill="none" />
              <path d={d} stroke="url(#pulseG)" strokeWidth="3" fill="none" strokeDasharray="80 1200">
                <animate attributeName="stroke-dashoffset" from="0" to="-1280" dur={`${5 + i}s`} repeatCount="indefinite" />
              </path>
            </g>
          ))}
        </svg>

        {/* floating damage pins */}
        {pins.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: p.delay, duration: 0.4 }}
            className="group absolute"
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
          >
            <span
              className={`absolute -inset-3 rounded-full ${p.type === "critical" ? "bg-danger" : "bg-amber"} opacity-30 blur-md`}
              style={{ animation: "pingHero 2s cubic-bezier(0,0,0.2,1) infinite" }}
            />
            <span className={`relative block size-3 rounded-full ring-2 ring-white/40 dark:ring-white/20 ${p.type === "critical" ? "bg-danger" : "bg-amber"}`} />
            <div className="pointer-events-none absolute left-1/2 top-5 z-30 hidden w-48 -translate-x-1/2 rounded-md border border-border bg-white p-2 text-[11px] shadow-xl group-hover:block dark:border-white/10 dark:bg-[#042c53]/95">
              <p className="font-medium text-navy dark:text-white">{p.label}</p>
              <p className="font-mono text-amber-dark dark:text-amber-light">₹{p.cost.toLocaleString("en-IN")} • Fails in {p.days} days</p>
            </div>
          </motion.div>
        ))}

        {/* headline */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-full border border-teal-mid/40 bg-teal-mid/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-mid"
          >
            AI-Powered Infrastructure Intelligence
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Roads That{" "}
            <span className="relative inline-block min-w-[3.5ch] align-baseline text-teal-mid">
              <AnimatePresence mode="wait">
                <motion.span
                  key={cyclingWords[wordIdx]}
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -28, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {cyclingWords[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            Ahead.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-5 max-w-2xl text-lg text-muted-foreground dark:text-[#9FE1CB] sm:text-xl"
          >
            Detect damage. Predict failure. Route safely. Hold contractors accountable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          >
            <Link
              to="/dashboard"
              className="btn-shimmer inline-flex w-full justify-center items-center gap-2 rounded-md bg-teal-mid px-6 py-3 font-display text-sm font-semibold text-white shadow-[0_8px_30px_rgba(29,158,117,0.4)] hover:bg-teal sm:w-auto"
            >
              See Live Dashboard <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://wa.me/919876543210?text=Hi%20RoadPulse!%20I%20want%20to%20report%20a%20pothole."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full justify-center items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted dark:border-white/30 dark:bg-transparent dark:hover:bg-white/5 sm:w-auto"
            >
              <MessageCircle className="size-4 text-[#25D366]" /> Report on WhatsApp
            </a>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 text-muted-foreground dark:text-white/40"
          >
            <ChevronDown className="size-6" />
          </motion.div>
        </div>

        <style>{`@keyframes pingHero { 75%, 100% { transform: scale(2.4); opacity: 0; } }`}</style>
      </section>

      {/* TICKER */}
      <div className="overflow-hidden border-y border-teal-mid/20 bg-teal-dark py-3">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-mono text-[13px] text-[#9FE1CB]">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="bg-surface px-6 py-24 transition-colors dark:bg-[#0a1628]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            One platform. <span className="text-teal-mid">Every signal.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground dark:text-white/60">
            From the citizen on the street to the engineer in the operations room.
          </p>
        </motion.div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(29,158,117,0.18)" }}
                className="rounded-xl border border-border border-l-[4px] border-l-teal-mid bg-card p-6 shadow-sm transition-colors dark:border-white/10 dark:border-l-teal-mid dark:bg-white/[0.03] dark:backdrop-blur"
              >
                <Icon className="size-7 text-teal-mid" />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground dark:text-white/60">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-6 py-10 text-center text-xs text-muted-foreground transition-colors dark:border-white/5 dark:bg-[#0a1628] dark:text-white/40">
        <p>© 2026 RoadPulse AI · Built for safer Indian roads.</p>
      </footer>
    </div>
  );
}
