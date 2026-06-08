import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface Props {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  trend?: number;
  trendDirection?: "up" | "down";
  accent?: "teal" | "amber" | "danger" | "navy";
}

const accents = {
  teal: "border-l-teal-mid text-teal-mid bg-teal-light",
  amber: "border-l-amber text-amber bg-amber-light",
  danger: "border-l-danger text-danger bg-danger-light",
  navy: "border-l-navy-mid text-navy-mid bg-navy-light",
};

export function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon: Icon,
  trend,
  trendDirection = "up",
  accent = "teal",
}: Props) {
  const animated = useCountUp(value, 1000);
  const TrendIcon = trendDirection === "up" ? TrendingUp : TrendingDown;
  const trendColor =
    trendDirection === "up" ? "text-teal-mid" : "text-danger";
  const a = accents[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(15,110,86,0.12)" }}
      className={`rounded-xl border bg-card border-l-[3px] ${a.split(" ")[0]} p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
            {prefix}
            {animated.toLocaleString("en-IN", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
            {suffix}
          </p>
          {trend !== undefined && (
            <div className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}>
              <TrendIcon className="size-3" />
              <span className="font-mono">{trend}%</span>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${a.split(" ")[2]}`}>
          <Icon className={`size-5 ${a.split(" ")[1]}`} />
        </div>
      </div>
    </motion.div>
  );
}
