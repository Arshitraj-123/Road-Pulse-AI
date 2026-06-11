import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

interface AuthShellProps {
  eyebrow: string;
  maxWidth?: number;
  children: React.ReactNode;
  footerNote?: React.ReactNode;
}

export function AuthShell({ eyebrow, maxWidth = 480, children, footerNote }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNavbar variant="light" />
      <section
        className="mx-auto flex min-h-screen flex-col items-stretch justify-start px-5 pt-24 pb-16"
        style={{ maxWidth }}
      >
        <Link
          to="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
        >
          <ArrowLeft className="size-4" /> Back to roles
        </Link>
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 self-start rounded-full bg-teal-light px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-dark"
        >
          {eyebrow}
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
        {footerNote && (
          <div className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
            {footerNote}
          </div>
        )}
      </section>
    </div>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      {children}
    </div>
  );
}
