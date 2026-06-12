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
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import useThemeStore from "@/store/useThemeStore";

type NavItem = { to: string; icon: typeof LayoutDashboard; label: string; badge?: number };
const items: NavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/detection", icon: Map, label: "AI Detection" },
  { to: "/contractors", icon: Users, label: "Contractors" },
  { to: "/reports", icon: FileText, label: "Damage Reports" },
  { to: "/budget", icon: DollarSign, label: "Budget" },
  { to: "/alerts", icon: Bell, label: "Alerts", badge: 7 },
];

export function MunicipalSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, roleData, logout } = useAuthStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { theme } = useThemeStore();

  const isDark = theme === "dark";
  const sidebarBg = isDark ? "bg-[#071428]" : "bg-[#042C53]";

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden flex-col ${sidebarBg} text-white transition-all duration-300 md:flex ${
          expanded ? "w-[240px]" : "w-[60px] lg:w-[240px]"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative flex h-16 shrink-0 items-center justify-center lg:justify-start lg:px-4">
            <div
              className={`flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                expanded ? "w-full px-4" : "w-0 opacity-0 lg:w-full lg:px-0 lg:opacity-100"
              }`}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-mid">
                <svg viewBox="0 0 24 24" fill="none" className="size-5">
                  <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-bold leading-none">RoadPulse</p>
                <p className="text-[10px] uppercase tracking-wider text-white/50">Municipal</p>
              </div>
            </div>

            {/* Icon only logo for tablet */}
            {!expanded && (
              <div className="flex lg:hidden size-8 shrink-0 items-center justify-center rounded-md bg-teal-mid">
                <svg viewBox="0 0 24 24" fill="none" className="size-5">
                  <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}

            {/* Tablet Expand/Collapse Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="absolute -right-3 top-5 z-50 hidden rounded-full border border-white/20 bg-teal-dark p-0.5 text-white shadow-md hover:bg-teal-mid md:flex lg:hidden"
            >
              {expanded ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
            {items.map((item) => {
              const active = pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to as any}
                  className={`group relative flex h-10 items-center rounded-md transition-colors ${
                    active ? "bg-teal-mid/15 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                  } ${expanded ? "justify-start px-3" : "justify-center lg:justify-start lg:px-3"}`}
                >
                  {active && (
                    <div className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-teal-mid" />
                  )}
                  <Icon className="size-5 shrink-0 lg:size-4" />

                  {/* Label (Visible on expanded or lg) */}
                  <span
                    className={`ml-3 truncate text-sm transition-all duration-300 ${
                      expanded ? "block" : "hidden lg:block"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={`ml-auto rounded-full bg-danger font-mono font-semibold transition-all duration-300 ${
                        expanded ? "px-1.5 py-0.5 text-[10px]" : "absolute right-1 top-1 size-2 lg:static lg:size-auto lg:px-1.5 lg:py-0.5 lg:text-[10px]"
                      }`}
                    >
                      {expanded || window.innerWidth >= 1024 ? item.badge : ""}
                    </span>
                  )}

                  {/* Tooltip for collapsed tablet state */}
                  {!expanded && (
                    <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded bg-white px-2 py-1 text-xs font-semibold text-navy opacity-0 shadow-xl transition-opacity group-hover:opacity-100 lg:hidden pointer-events-none z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-white/10 p-2">
            <div
              className={`flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-white/5 ${
                expanded ? "justify-start" : "justify-center lg:justify-start"
              }`}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-mid font-display text-sm font-bold">
                {(user?.fullName || "A").charAt(0)}
              </div>
              <div className={`min-w-0 flex-1 transition-all ${expanded ? "block" : "hidden lg:block"}`}>
                <p className="truncate text-sm font-medium">{user?.fullName || "Officer"}</p>
                <p className="truncate text-[10px] text-white/50">{roleData?.designation || "Officer"}</p>
              </div>
              <button
                className={`shrink-0 rounded p-1 text-white/60 hover:bg-white/10 hover:text-white transition-all ${
                  expanded ? "block" : "hidden lg:block"
                }`}
              >
                <Settings className="size-4" />
              </button>
            </div>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className={`mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/10 text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all ${
                expanded ? "px-3" : "px-0 lg:px-3"
              }`}
              title="Sign out"
            >
              <LogOut className="size-4" />
              <span className={`transition-all ${expanded ? "block" : "hidden lg:block"}`}>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for tablet expanded sidebar */}
      {expanded && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-between border-t border-border bg-white px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[#0F1E35] md:hidden">
        {[
          { to: "/dashboard", icon: LayoutDashboard },
          { to: "/detection", icon: Map },
          { to: "/reports", icon: FileText },
          { to: "/contractors", icon: Users },
          { to: "/alerts", icon: Bell, badge: true },
        ].map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as any}
              className="group relative flex flex-1 flex-col items-center justify-center gap-1 h-full"
            >
              <div className="relative">
                <Icon
                  className={`size-6 transition-colors ${
                    active ? "text-teal-mid" : "text-muted-foreground dark:text-gray-400"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-danger dark:border-[#0F1E35]" />
                )}
              </div>
              <div
                className={`h-1 w-1 rounded-full transition-colors ${
                  active ? "bg-teal-mid" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
