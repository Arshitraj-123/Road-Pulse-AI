import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  FileText,
  Users,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

type NavItem = { to: string; icon: typeof LayoutDashboard; label: string; badge?: number };
const items: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/detection", icon: Map, label: "AI Detection" },
  { to: "/contractors", icon: Users, label: "Contractors" },
  { to: "/reports", icon: FileText, label: "Damage Reports" },
  { to: "/budget", icon: DollarSign, label: "Budget" },
  { to: "/alerts", icon: Bell, label: "Alerts", badge: 7 },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { name, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 pb-3 pt-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-teal-mid">
          <svg viewBox="0 0 24 24" fill="none" className="size-5">
            <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold leading-none">RoadPulse</p>
          <p className="text-[10px] uppercase tracking-wider text-white/50">Municipal Portal</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-2">
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to as "/dashboard"}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-teal-mid/15 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-1.5 left-0 w-0.5 rounded-r bg-teal-mid"
                />
              )}
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-danger px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-md p-2 hover:bg-white/5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-mid font-display font-bold">
            {(name ?? "A").charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-[10px] text-white/50">Municipal Officer, Patna</p>
          </div>
          <button className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Settings">
            <Settings className="size-4" />
          </button>
        </div>
        <button
          onClick={() => {
            logout();
            onNavigate?.();
            navigate({ to: "/login" });
          }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-3" /> Sign out
        </button>
      </div>
    </div>
  );
}

export function MunicipalSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-navy text-white md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-navy px-4 text-white md:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 hover:bg-white/10"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-teal-mid">
              <svg viewBox="0 0 24 24" fill="none" className="size-4">
                <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold">RoadPulse</span>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/60">Municipal</span>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-navy text-white shadow-2xl md:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 z-10 rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
