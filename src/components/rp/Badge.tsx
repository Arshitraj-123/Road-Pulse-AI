import type { ReactNode } from "react";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "live";

const styles: Record<Variant, string> = {
  success: "bg-teal-light text-teal-dark",
  warning: "bg-amber-light text-amber",
  danger: "bg-danger-light text-danger",
  info: "bg-navy-light text-navy-mid",
  neutral: "bg-muted text-muted-foreground",
  live: "bg-danger text-white",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium uppercase tracking-wide ${styles[variant]} ${className}`}
    >
      {variant === "live" && (
        <span className="inline-block size-1.5 rounded-full bg-white animate-pulse" />
      )}
      {children}
    </span>
  );
}
