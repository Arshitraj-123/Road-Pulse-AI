import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Building2, HardHat, ArrowRight } from "lucide-react";
import { useAuthStore, type Role } from "@/store/useAuthStore";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — RoadPulse AI" },
      { name: "description", content: "Choose your role to access RoadPulse AI." },
    ],
  }),
  component: LoginPage,
});

const roles: {
  key: Role;
  icon: React.ElementType;
  title: string;
  desc: string;
  to: "/dashboard" | "/";
  accent: string;
}[] = [
  {
    key: "citizen",
    icon: User,
    title: "Citizen",
    desc: "Report potholes, earn points, track repairs.",
    to: "/",
    accent: "from-teal-light to-teal-mid/10",
  },
  {
    key: "municipal",
    icon: Building2,
    title: "Municipal Officer",
    desc: "Full dashboard, AI detection, contractor management.",
    to: "/dashboard",
    accent: "from-navy-light to-navy-mid/10",
  },
  {
    key: "contractor",
    icon: HardHat,
    title: "Contractor",
    desc: "View assigned tickets, update repair status.",
    to: "/",
    accent: "from-amber-light to-amber/10",
  },
];

function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const choose = (r: typeof roles[number]) => {
    login(r.key);
    navigate({ to: r.to });
  };

  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar variant="light" />
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="rounded-full bg-teal-light px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-dark">
            Demo Access
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-navy sm:text-5xl">
            Choose your role.
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            No password needed for the demo — pick a perspective to explore RoadPulse AI.
          </p>
        </motion.div>

        <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.button
                key={r.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(15,110,86,0.18)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => choose(r)}
                className={`group relative overflow-hidden rounded-2xl border bg-card p-7 text-left transition-colors`}
              >
                <div className={`absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br ${r.accent} blur-2xl opacity-70`} />
                <div className="relative">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-teal-light text-teal-dark">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-navy">{r.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-mid">
                    Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
