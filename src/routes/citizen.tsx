import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Camera, MapPin, Send, Award, Trophy, Flame, CheckCircle2, Clock, Sparkles, LogOut,
} from "lucide-react";
import { Card } from "@/components/rp/Card";
import { Button } from "@/components/rp/Button";
import { Badge } from "@/components/rp/Badge";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";

export const Route = createFileRoute("/citizen")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { role } = useAuthStore.getState();
    if (role !== "citizen") throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Citizen Portal — RoadPulse AI" },
      { name: "description", content: "Snap a pothole, earn RoadPoints, see it get fixed." },
    ],
  }),
  component: CitizenPortal,
});

const leaderboard = [
  { rank: 1, name: "Rohan Verma", points: 4820, badge: "🏆" },
  { rank: 2, name: "Aisha Khan", points: 4310, badge: "🥈" },
  { rank: 3, name: "Priya Sharma", points: 3940, badge: "🥉", you: true },
  { rank: 4, name: "Vikram Rao", points: 3120, badge: "" },
  { rank: 5, name: "Neha Iyer", points: 2870, badge: "" },
];

const myReports = [
  { id: "RP-99812", location: "Boring Road", status: "resolved", points: 50, daysAgo: 3 },
  { id: "RP-99845", location: "Fraser Road", status: "in_progress", points: 30, daysAgo: 1 },
  { id: "RP-99877", location: "Exhibition Rd", status: "new", points: 20, daysAgo: 0 },
];

const statusMap = {
  new: { variant: "info" as const, label: "Received", icon: Clock },
  in_progress: { variant: "warning" as const, label: "In Progress", icon: Sparkles },
  resolved: { variant: "success" as const, label: "Fixed", icon: CheckCircle2 },
};

function CitizenPortal() {
  const { name, logout } = useAuthStore();
  const { push } = useNotificationStore();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [points, setPoints] = useState(3940);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPhoto(String(ev.target?.result ?? ""));
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (!photo || !location) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setPhoto(null);
      setLocation("");
      setPoints((p) => p + 20);
      push({ type: "success", message: "🎉 +20 RoadPoints · Report RP-99899 received" });
    }, 1400);
  };

  const tier = points >= 5000 ? "Gold" : points >= 2500 ? "Silver" : "Bronze";
  const tierProgress = points >= 5000 ? 100 : points >= 2500 ? ((points - 2500) / 25) : (points / 25);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-light/40 via-surface to-navy-light/30">
      <header className="sticky top-0 z-30 border-b border-teal-mid/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-teal-mid">
              <svg viewBox="0 0 24 24" fill="none" className="size-5">
                <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-base font-bold text-navy leading-none">RoadPulse</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-teal-mid">Citizen</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-light px-3 py-1 text-xs font-semibold text-amber">
              <Award className="size-3.5" /> {points.toLocaleString("en-IN")} pts
            </div>
            <button
              onClick={() => { logout(); navigate({ to: "/login" }); }}
              className="rounded-md p-2 text-navy/60 hover:bg-muted hover:text-navy"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-wider text-teal-mid">Hello, {name?.split(" ")[0]}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy sm:text-4xl">
            Spot a pothole? Fix the city.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Snap it. Pin it. Earn RoadPoints when it gets repaired.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Report form */}
          <Card className="overflow-hidden p-6" hover={false}>
            <h2 className="mb-4 font-display text-lg font-bold text-navy">Report a road defect</h2>

            <label
              htmlFor="citizen-photo"
              className={`group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 transition-colors hover:border-teal-mid ${photo ? "border-transparent" : "border-border"}`}
            >
              {photo ? (
                <img src={photo} alt="Report" className="size-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal-light text-teal-dark">
                    <Camera className="size-7" />
                  </div>
                  <p className="mt-3 font-display text-base font-semibold text-navy">Take or upload photo</p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG/PNG · clear view of damage</p>
                </div>
              )}
              <input id="citizen-photo" type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
            </label>

            <div className="mt-4">
              <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Location</label>
              <div className="mt-1 flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-md border bg-card px-3">
                  <MapPin className="size-4 text-teal-mid" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. MG Road, near Gandhi Maidan"
                    className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <Button variant="outline" size="md" onClick={() => setLocation("Boring Road, 25.6093°N 85.1235°E")}>
                  GPS
                </Button>
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="mt-5 w-full"
              onClick={submit}
              disabled={!photo || !location || submitting}
            >
              <Send className="size-4" />
              {submitting ? "Sending…" : "Submit report · +20 pts"}
            </Button>
          </Card>

          {/* Side: profile + leaderboard */}
          <div className="space-y-6">
            <Card className="p-5" hover={false}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-amber to-teal-mid font-display text-xl font-bold text-white">
                    {(name ?? "P").charAt(0)}
                  </div>
                  <Flame className="absolute -bottom-1 -right-1 size-5 rounded-full bg-white p-0.5 text-amber" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-navy">{name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{tier} Reporter · 12-day streak</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-end justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{tier} → {tier === "Gold" ? "Max" : tier === "Silver" ? "Gold" : "Silver"}</span>
                  <span className="font-mono text-navy">{points.toLocaleString()} / {tier === "Bronze" ? "2,500" : "5,000"}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, tierProgress)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-amber to-teal-mid"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5" hover={false}>
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="size-4 text-amber" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-navy">Patna Top Reporters</h2>
              </div>
              <ul className="space-y-1.5">
                {leaderboard.map((p) => (
                  <li
                    key={p.rank}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 ${p.you ? "bg-teal-light ring-1 ring-teal-mid" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-xs text-muted-foreground">{p.badge || p.rank}</span>
                      <span className={`text-sm ${p.you ? "font-semibold text-teal-dark" : "text-navy"}`}>{p.name}</span>
                      {p.you && <Badge variant="success" className="ml-1">You</Badge>}
                    </div>
                    <span className="font-mono text-xs font-semibold text-navy">{p.points.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* My reports */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-bold text-navy">Your reports</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AnimatePresence>
              {myReports.map((r, i) => {
                const s = statusMap[r.status as keyof typeof statusMap];
                const Icon = s.icon;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-[10px] uppercase text-muted-foreground">{r.id}</p>
                          <p className="mt-0.5 font-display text-base font-semibold text-navy">{r.location}</p>
                        </div>
                        <Badge variant={s.variant}>
                          <Icon className="size-3" /> {s.label}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">
                          {r.daysAgo === 0 ? "Today" : `${r.daysAgo}d ago`}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber">
                          <Award className="size-3" /> +{r.points}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
