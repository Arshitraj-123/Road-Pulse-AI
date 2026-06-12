import { motion } from "framer-motion";

interface AuthTabsProps {
  tabs: string[];
  labels: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function AuthTabs({ tabs, labels, active, onChange }: AuthTabsProps) {
  return (
    <div className="relative mb-6 flex rounded-xl bg-muted/60 p-1 dark:bg-white/5">
      {tabs.map((tab, i) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative z-10 flex-1 rounded-lg py-2.5 font-display text-[13px] font-semibold transition-colors ${
              isActive
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="auth-tab-indicator"
                className="absolute inset-0 rounded-lg bg-teal-mid shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{labels[i]}</span>
          </button>
        );
      })}
    </div>
  );
}
