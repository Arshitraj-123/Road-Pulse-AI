import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = true,
  ...rest
}: HTMLMotionProps<"div"> & { children: ReactNode; hover?: boolean }) {
  return (
    <motion.div
      whileHover={
        hover
          ? { y: -2, boxShadow: "0 12px 32px rgba(15,110,86,0.14)" }
          : undefined
      }
      transition={{ duration: 0.2 }}
      className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
