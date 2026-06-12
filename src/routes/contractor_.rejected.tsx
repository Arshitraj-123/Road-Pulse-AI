import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { XCircle, LogOut, Mail, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/contractor_/rejected")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Application Not Approved — RoadPulse AI" },
      { name: "description", content: "Your contractor access request was not approved." },
    ],
  }),
  component: ContractorRejected,
});

function ContractorRejected() {
  const { roleData, logout } = useAuthStore();
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
          {/* Red alert icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-light dark:bg-danger/20">
            <XCircle className="size-7 text-danger" />
          </div>

          <h1 className="mt-5 text-center font-display text-2xl font-bold text-foreground">
            Application Not Approved
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your access request was not approved by the municipal authority.
          </p>

          {/* Reason box (if provided) */}
          {roleData?.rejectionReason && (
            <div className="mt-6 rounded-xl border border-danger/20 bg-danger-light/50 p-4 dark:bg-danger/10">
              <p className="font-mono text-[10px] uppercase tracking-wider text-danger">
                Reason
              </p>
              <p className="mt-1 text-sm text-foreground">
                {roleData.rejectionReason}
              </p>
            </div>
          )}

          {/* Reapply notice */}
          <div className="mt-6 rounded-xl bg-muted/60 p-4 text-center dark:bg-white/5">
            <p className="text-sm text-muted-foreground">
              You may reapply after <span className="font-semibold text-foreground">30 days</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <a
              href="mailto:admin@patna.gov.in"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted dark:border-white/10"
            >
              <MessageSquare className="size-4" />
              Contact Municipality
            </a>
            <button
              onClick={signOut}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
            Support:{" "}
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
