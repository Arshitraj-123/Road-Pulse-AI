import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Building2, HardHat, ArrowRight, Clock, AlertTriangle, Info } from "lucide-react";
import { useAuthStore, type Role } from "@/store/useAuthStore";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { z } from "zod";

const searchSchema = z.object({
  reason: z.string().optional(),
  from: z.string().optional(),
});

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: "Sign in — RoadPulse AI" },
      { name: "description", content: "Choose your role to access RoadPulse AI." },
    ],
  }),
  validateSearch: searchSchema,
  component: LoginPage,
});

const roles: {
  key: Role;
  icon: React.ElementType;
  title: string;
  desc: string;
  to: string;
  accent: string;
}[] = [
  {
    key: "citizen",
    icon: User,
    title: "Citizen",
    desc: "Report potholes, earn points, track repairs.",
    to: "/signup/citizen",
    accent: "from-teal-light to-teal-mid/10",
  },
  {
    key: "municipal",
    icon: Building2,
    title: "Municipal Officer",
    desc: "Full dashboard, AI detection, contractor management.",
    to: "/login/municipal",
    accent: "from-navy-light to-navy-mid/10",
  },
  {
    key: "contractor",
    icon: HardHat,
    title: "Contractor",
    desc: "View assigned tickets, update repair status.",
    to: "/signup/contractor",
    accent: "from-amber-light to-amber/10",
  },
];

// Contextual banners based on redirect reason/source
const fromBanners: Record<string, { icon: React.ElementType; message: string; cls: string }> = {
  "/dashboard": {
    icon: Info,
    message: "Sign in as a Municipal Officer to access the dashboard.",
    cls: "border-navy-mid/30 bg-navy-light text-navy dark:bg-navy-mid/20 dark:text-navy-light",
  },
  "/contractor": {
    icon: Info,
    message: "Sign in as a Contractor to access your work queue.",
    cls: "border-amber/30 bg-amber-light text-amber",
  },
  "/citizen": {
    icon: Info,
    message: "Sign in as a Citizen to access the citizen portal.",
    cls: "border-teal-mid/30 bg-teal-light text-teal-dark dark:bg-teal-mid/20 dark:text-teal-mid",
  },
};

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const { reason, from } = Route.useSearch();

  // Smart redirect: if already logged in, send to the right workspace
  const roleHome: Record<string, string> = {
    citizen: "/citizen",
    municipal: "/dashboard",
    contractor: "/contractor",
  };

  const choose = (r: (typeof roles)[number]) => {
    // If already logged in as this role, go directly to their workspace
    if (isAuthenticated && role === r.key) {
      navigate({ to: roleHome[r.key] || "/" });
      return;
    }

    // For roles with tab pages, default to sign-in tab
    if (r.key === "citizen") {
      navigate({ to: "/signup/citizen", search: { tab: "signin" } });
      return;
    }
    if (r.key === "contractor") {
      navigate({ to: "/signup/contractor", search: { tab: "signin" } });
      return;
    }

    // Municipal goes directly to login (no tabs)
    navigate({ to: r.to });
  };

  // Determine which banner to show
  const banner = reason === "expired"
    ? { icon: AlertTriangle, message: "Your session expired. Please sign in again.", cls: "border-amber/40 bg-amber-light text-amber" }
    : from && fromBanners[from]
      ? fromBanners[from]
      : null;

  return (
    <div className="min-h-screen bg-surface transition-colors dark:bg-[#0A1628]">
      <PublicNavbar />
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-24">
        {/* Contextual banner */}
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 flex w-full max-w-2xl items-center gap-2.5 rounded-lg border p-3.5 text-sm ${banner.cls}`}
          >
            <banner.icon className="size-4 shrink-0" />
            <span>{banner.message}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="rounded-full bg-teal-light px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-dark dark:bg-teal-mid/20 dark:text-teal-mid">
            Demo Access
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Choose your role.
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            No password needed for the demo — pick a perspective to explore RoadPulse AI.
          </p>
        </motion.div>

        <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r, i) => {
            const Icon = r.icon;
            const isActive = isAuthenticated && role === r.key;
            return (
              <motion.button
                key={r.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(15,110,86,0.18)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => choose(r)}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-7 text-left transition-colors dark:border-white/10 dark:bg-white/[0.03] ${
                  isActive ? "ring-2 ring-teal-mid" : ""
                }`}
              >
                <div className={`absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br ${r.accent} blur-2xl opacity-70`} />
                <div className="relative">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-teal-light text-teal-dark dark:bg-teal-mid/20 dark:text-teal-mid">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-foreground">{r.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-mid">
                    {isActive ? "Go to dashboard" : "Continue"}{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Roles persist locally. You can switch any time by visiting <span className="font-mono">/login</span>.
        </p>
      </section>
    </div>
  );
}
