import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Zap, X } from "lucide-react";
import { useNotificationStore, type ToastType } from "@/store/useNotificationStore";

const meta: Record<ToastType, { icon: React.ElementType; cls: string }> = {
  info: { icon: Info, cls: "bg-navy-light text-navy border-navy-mid/30" },
  success: { icon: CheckCircle2, cls: "bg-teal-light text-teal-dark border-teal-mid/30" },
  warning: { icon: Zap, cls: "bg-amber-light text-amber border-amber/30" },
  critical: { icon: AlertTriangle, cls: "bg-danger-light text-danger border-danger/30" },
};

export function ToastHost() {
  const { toasts, dismiss } = useNotificationStore();
  return (
    <div className="fixed top-4 right-4 z-[100] flex w-80 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const m = meta[t.type];
          const Icon = m.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 shadow-md backdrop-blur ${m.cls}`}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-60 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
