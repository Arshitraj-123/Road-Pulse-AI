import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Camera, MapPin, Send, Award, Trophy, Flame, CheckCircle2, Clock, Sparkles, LogOut, ArrowLeft, MoreVertical, MessageCircle, Image as ImageIcon
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
    const { isAuthenticated, role, isLoading, user } = useAuthStore.getState();

    // If session is still restoring, don't redirect yet
    if (isLoading) return;

    // Not logged in → send to login with context
    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { from: "/citizen" },
      });
    }

    // Logged in but wrong role → send to unauthorized
    if (role !== "citizen") {
      throw redirect({
        to: "/unauthorized",
        search: { required: "citizen", from: "/citizen" },
      });
    }

    // Logged in as citizen but not verified → send to OTP verification
    if (!user?.isVerified) {
      throw redirect({
        to: "/verify",
        search: { phone: user?.phone, role: "citizen", userId: user?.id },
      });
    }
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
  const { user, roleData, logout } = useAuthStore();
  const { push } = useNotificationStore();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localPoints, setLocalPoints] = useState(roleData?.points || 0);

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
      setLocalPoints((p) => p + 20);
      push({ type: "success", message: "🎉 +20 RoadPoints · Report RP-99899 received" });
    }, 1400);
  };

  const currentPoints = localPoints;
  const tier = currentPoints >= 5000 ? "Gold" : currentPoints >= 2500 ? "Silver" : "Bronze";
  const tierProgress = currentPoints >= 5000 ? 100 : currentPoints >= 2500 ? ((currentPoints - 2500) / 25) : (currentPoints / 25);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-light/40 via-surface to-navy-light/30 transition-colors dark:from-[#0A1628] dark:to-[#0A1628] dark:via-[#0A1628]">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#0A1628]/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-teal-mid">
              <svg viewBox="0 0 24 24" fill="none" className="size-5">
                <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-base font-bold text-foreground leading-none">RoadPulse</p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-teal-mid">Citizen</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-light px-3 py-1 text-xs font-semibold text-amber">
              <Award className="size-3.5" /> {currentPoints.toLocaleString("en-IN")} pts
            </div>
            <button
              onClick={() => { logout(); navigate({ to: "/login" }); }}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-teal-mid">
                Hello, {user?.fullName?.split(" ")[0] || "Citizen"} 👋
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Spot a pothole? Fix the city.
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Snap it. Pin it. Earn RoadPoints when it gets repaired.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">Level: {roleData?.level || "Newcomer"}</p>
              <p className="text-xs text-muted-foreground">Rank #{roleData?.rank || "0"} in Patna</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Report form */}
          <Card className="overflow-hidden p-6" hover={false}>
            <h2 className="mb-4 font-display text-lg font-bold text-foreground">Report a road defect</h2>

            <label
              htmlFor="citizen-photo"
              className={`group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 transition-colors hover:border-teal-mid ${photo ? "border-transparent" : "border-border"}`}
            >
              {photo ? (
                <img src={photo} alt="Report" className="size-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal-light text-teal-dark dark:bg-teal-mid/20 dark:text-teal-mid">
                    <Camera className="size-7" />
                  </div>
                  <p className="mt-3 font-display text-base font-semibold text-foreground">Take or upload photo</p>
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
                    className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
                  <p className="font-display text-base font-bold text-foreground">{name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{tier} Reporter · 12-day streak</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-end justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{tier} → {tier === "Gold" ? "Max" : tier === "Silver" ? "Gold" : "Silver"}</span>
                  <span className="font-mono text-foreground">{points.toLocaleString()} / {tier === "Bronze" ? "2,500" : "5,000"}</span>
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
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Patna Top Reporters</h2>
              </div>
              <ul className="space-y-1.5">
                {leaderboard.map((p) => (
                  <li
                    key={p.rank}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 ${p.you ? "bg-teal-light ring-1 ring-teal-mid" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-xs text-muted-foreground">{p.badge || p.rank}</span>
                      <span className={`text-sm ${p.you ? "font-semibold text-teal-dark dark:text-teal-mid" : "text-foreground"}`}>{p.name}</span>
                      {p.you && <Badge variant="success" className="ml-1">You</Badge>}
                    </div>
                    <span className="font-mono text-xs font-semibold text-foreground">{p.points.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* See It In Action (WhatsApp Mockup) */}
        <section className="mt-12 mb-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-teal-mid">See It In Action</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-foreground">
                No app needed.<br/>Just WhatsApp.
              </h2>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                We've integrated our AI detection directly into WhatsApp. Simply snap a photo, share your location, and our bot handles the rest. You earn points automatically when the contractor fixes the issue.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi%20RoadPulse!%20I%20want%20to%20report%20a%20pothole."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-display text-sm font-semibold text-white shadow-lg shadow-[#25D366]/20 transition-transform hover:scale-105 active:scale-95"
              >
                <MessageCircle className="size-5" fill="currentColor" />
                Report on WhatsApp →
              </a>
            </div>
            <div className="flex justify-center lg:justify-end">
              <WhatsAppMockup />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Your reports</h2>
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
                          <p className="mt-0.5 font-display text-base font-semibold text-foreground">{r.location}</p>
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

function WhatsAppMockup() {
  const [visibleBubbles, setVisibleBubbles] = useState(0);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setVisibleBubbles(0);
      const schedule = [600, 1200, 2000, 2600, 3200, 3800];
      schedule.forEach((time, index) => {
        timers.push(setTimeout(() => setVisibleBubbles(index + 1), time));
      });
      timers.push(setTimeout(run, 3800 + 6000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const bubbles = [
    { id: 1, type: "user", text: "pothole_mgroad.jpg", isImg: true },
    { id: 2, type: "user", text: "MG Road near Gandhi Maidan 📍" },
    { id: 3, type: "bot", text: "Got it! Analysing your photo... 🔍", typing: true },
    { id: 4, type: "bot", text: "✅ Detected: Grade 3 Pothole\n📍 Location confirmed: MG Road, Patna\nSeverity: Critical | Est. repair: ₹1,200" },
    { id: 5, type: "bot", text: "🎫 Ticket #RP-12345 created!\nYou'll get updates here as it's fixed." },
    { id: 6, type: "bot", text: "🏆 +10 Civic Points earned!\nYou're now Rank #47 in Patna!" }
  ];

  return (
    <div className="relative h-[560px] w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border-[8px] border-navy bg-[#efeae2] shadow-2xl">
      {/* Notch */}
      <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-navy" />
      
      {/* Header */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-20 items-end bg-[#008069] px-4 pb-3 text-white shadow-sm">
        <div className="flex w-full items-center gap-3">
          <ArrowLeft className="size-5" />
          <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 24 24" fill="none" className="size-5">
              <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-display text-[15px] font-semibold leading-tight">RoadPulse Bot</p>
            <p className="text-[11px] opacity-80">bot</p>
          </div>
          <MoreVertical className="size-5" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="absolute inset-0 top-20 overflow-y-auto p-4 pb-20 [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {bubbles.slice(0, visibleBubbles).map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9, y: 10, originX: b.type === "user" ? 1 : 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex w-full ${b.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                    b.type === "user"
                      ? "rounded-tr-none bg-[#d9fdd3] text-navy"
                      : "rounded-tl-none bg-white text-navy"
                  }`}
                >
                  {b.isImg && (
                    <div className="mb-1 flex aspect-[4/3] w-full items-center justify-center rounded-md bg-black/10">
                      <ImageIcon className="size-8 text-black/20" />
                    </div>
                  )}
                  {b.typing && visibleBubbles === 3 ? (
                    <span className="inline-flex gap-1 opacity-50">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                    </span>
                  ) : (
                    <span className="whitespace-pre-wrap">{b.text}</span>
                  )}
                  {/* Tail */}
                  <div
                    className={`absolute top-0 h-3 w-3 ${
                      b.type === "user"
                        ? "-right-2 text-[#d9fdd3]"
                        : "-left-2 text-white"
                    }`}
                  >
                    <svg viewBox="0 0 8 13" width="8" height="13" fill="currentColor">
                      {b.type === "user" ? (
                        <path d="M0 0h8v13L0 0z" />
                      ) : (
                        <path d="M8 0H0v13L8 0z" />
                      )}
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
