import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, ArrowRight, LogOut } from "lucide-react";
import { useAuthStore, type Role } from "@/store/useAuthStore";
import { z } from "zod";

const searchSchema = z.object({
  required: z.string().optional(),
  from: z.string().optional(),
});

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Access Denied — RoadPulse AI" },
      { name: "description", content: "You don't have permission to access this page." },
    ],
  }),
  validateSearch: searchSchema,
  component: UnauthorizedPage,
});

const roleLabels: Record<string, string> = {
  citizen: "Citizen",
  municipal: "Municipal Officer",
  contractor: "Contractor",
  admin: "Admin",
};

const roleHome: Record<string, string> = {
  citizen: "/citizen",
  municipal: "/dashboard",
  contractor: "/contractor",
};

function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();
  const { required, from } = Route.useSearch();

  const userRoleLabel = roleLabels[role || ""] || "User";
  const requiredRoleLabel = roleLabels[required || ""] || "another role";

  const goHome = () => {
    const home = roleHome[role || ""] || "/login";
    navigate({ to: home });
  };

  const switchRole = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 transition-colors dark:bg-[#0A1628]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Lock icon */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-light to-teal-mid/20 dark:from-teal-mid/20 dark:to-teal-dark/20">
          <Lock className="size-10 text-teal-mid" />
        </div>

        {/* Title */}
        <h1 className="mt-6 font-display text-3xl font-bold text-foreground">
          Wrong workspace.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-3 max-w-sm text-base text-muted-foreground">
          You're logged in as a{" "}
          <span className="font-semibold text-foreground">{userRoleLabel}</span>.
          {from ? (
            <>
              {" "}This page is for{" "}
              <span className="font-semibold text-foreground">{requiredRoleLabel}s</span> only.
            </>
          ) : (
            <> You don't have access to this page.</>
          )}
        </p>

        {/* CTA: Go to my dashboard */}
        <button
          onClick={goHome}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-mid py-3.5 font-display text-sm font-semibold text-white transition-all hover:bg-teal-dark hover:shadow-lg hover:shadow-teal-mid/20 active:scale-[0.98]"
        >
          Go to my dashboard
          <ArrowRight className="size-4" />
        </button>

        {/* Switch role */}
        <button
          onClick={switchRole}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:border-white/10"
        >
          <LogOut className="size-3.5" />
          Sign in as different role
        </button>

        {/* Info box */}
        <div className="mt-8 rounded-xl border border-border bg-card p-4 text-left dark:border-white/10 dark:bg-white/[0.03]">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Currently signed in as
          </p>
          <p className="mt-1 font-display text-sm font-semibold text-foreground">
            {userRoleLabel}
          </p>
          <div className="mt-3 h-px bg-border dark:bg-white/10" />
          <p className="mt-3 text-xs text-muted-foreground">
            Each role has its own isolated workspace.
            Citizens can't see municipal data, officers can't see citizen
            reports, and contractors only see their own tickets.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
