import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldOff, LogOut, Mail } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/contractor_/blacklisted")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Account Suspended — RoadPulse AI" },
      { name: "description", content: "Your contractor account has been suspended." },
    ],
  }),
  component: ContractorBlacklisted,
});

function ContractorBlacklisted() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 transition-colors dark:bg-[#0A1628]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px]"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-teal-mid">
            <svg viewBox="0 0 24 24" fill="none" className="size-5">
              <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-foreground">RoadPulse</span>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/[0.03]">
          {/* Shield icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-light dark:bg-danger/20">
            <ShieldOff className="size-7 text-danger" />
          </div>

          <h1 className="mt-5 text-center font-display text-2xl font-bold text-foreground">
            Account Suspended
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your contractor account has been suspended due to policy violations
            or repeated SLA non-compliance.
          </p>

          {/* Info box */}
          <div className="mt-6 rounded-xl border border-danger/20 bg-danger-light/50 p-4 dark:bg-danger/10">
            <p className="text-sm text-foreground">
              Blacklisted accounts cannot access the contractor portal.
              All assigned tickets have been reassigned.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              If you believe this is an error, contact the municipal administration.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={signOut}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:border-white/10"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3.5" />
            Contact:{" "}
            <a
              href="mailto:admin@patna.gov.in"
              className="font-mono text-teal-mid hover:underline"
            >
              admin@patna.gov.in
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
