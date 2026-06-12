import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hourglass, Check, LogOut, Mail, Clock, Building2, FileText } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/contractor_/pending")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Application Under Review — RoadPulse AI" },
      { name: "description", content: "Your contractor access request is being reviewed." },
    ],
  }),
  component: ContractorPending,
});

function ContractorPending() {
  const { user, roleData, logout } = useAuthStore();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const submittedDate = roleData?.submittedAt
    ? new Date(roleData.submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently";

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
          {/* Hourglass icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-light dark:bg-amber/20">
            <Hourglass className="size-7 text-amber" />
          </div>

          <h1 className="mt-5 text-center font-display text-2xl font-bold text-foreground">
            Application Under Review
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Your access request has been submitted to the municipal authority.
          </p>

          {/* Status timeline */}
          <div className="mt-8">
            <ol className="relative space-y-6 pl-9">
              <span className="absolute left-3 top-3 bottom-3 w-px bg-border dark:bg-white/10" />

              {/* Step 1: Submitted */}
              <li className="relative">
                <span className="absolute -left-9 flex size-6 items-center justify-center rounded-full bg-teal-mid text-white">
                  <Check className="size-3.5" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Application submitted</span>
                  <span className="rounded-full bg-teal-light px-2 py-0.5 text-[10px] font-semibold text-teal-dark dark:bg-teal-mid/20 dark:text-teal-mid">
                    Done
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Municipal admin has been notified</div>
              </li>

              {/* Step 2: Under review (current) */}
              <li className="relative">
                <span className="absolute -left-9 flex size-6 items-center justify-center rounded-full bg-amber text-white ring-4 ring-amber/15">
                  <Clock className="size-3.5" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Under review</span>
                  <span className="rounded-full bg-amber-light px-2 py-0.5 text-[10px] font-semibold text-amber">
                    1–2 working days
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">License and registration being verified</div>
              </li>

              {/* Step 3: Approval email */}
              <li className="relative">
                <span className="absolute -left-9 flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  3
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Approval email sent</span>
                <div className="text-xs text-muted-foreground">You'll receive email confirmation</div>
              </li>

              {/* Step 4: Access granted */}
              <li className="relative">
                <span className="absolute -left-9 flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  4
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Access granted</span>
                <div className="text-xs text-muted-foreground">Full work queue access unlocked</div>
              </li>
            </ol>
          </div>

          {/* Info box */}
          <div className="mt-6 rounded-xl bg-amber-light/50 p-4 dark:bg-amber/10">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-3.5 text-amber" />
                <span>Submitted: <span className="font-medium text-foreground">{submittedDate}</span></span>
              </div>
              {roleData?.companyName && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-3.5 text-amber" />
                  <span>Company: <span className="font-medium text-foreground">{roleData.companyName}</span></span>
                </div>
              )}
              {roleData?.licenseNumber && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="size-3.5 text-amber" />
                  <span>License: <span className="font-mono font-medium text-foreground">{roleData.licenseNumber}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3.5" />
            Questions? Contact{" "}
            <a
              href="mailto:admin@patna.gov.in"
              className="font-mono text-teal-mid hover:underline"
            >
              admin@patna.gov.in
            </a>
          </p>
          <button
            onClick={signOut}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:border-white/10"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
