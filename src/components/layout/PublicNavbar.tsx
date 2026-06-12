import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import useThemeStore from "@/store/useThemeStore";

const links = [
  { to: "/", label: "Home" },
  { to: "/navigate", label: "Navigate" },
  { to: "/wall-of-shame", label: "Contractors" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/login", label: "Login" },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  // The navbar itself is always dark-themed visually, but slightly deeper in dark mode.
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const base = isDark
    ? "bg-[rgba(2,15,35,0.95)] text-white"
    : "bg-[rgba(4,44,83,0.92)] text-white";
  
  const border = scrolled
    ? isDark
      ? "border-b border-teal-mid/20"
      : "border-b border-teal-mid/10"
    : "border-b border-transparent";

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`fixed inset-x-0 top-0 z-[60] backdrop-blur-md ${base} ${border}`}
      >
        <div className="mx-auto flex h-14 lg:h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-mid">
              <svg viewBox="0 0 24 24" fill="none" className="size-5">
                <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="truncate font-display text-lg font-bold tracking-tight">RoadPulse</span>
            <span className="shrink-0 rounded bg-teal-mid/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-teal-mid">
              AI
            </span>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-teal-mid"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-teal-mid"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-3">
            {/* Desktop & Tablet Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Desktop Login Button */}
            <Link
              to="/login"
              className="hidden lg:inline-flex rounded-md border border-teal-mid px-4 py-2 text-sm font-medium text-teal-mid hover:bg-teal-mid hover:text-white transition-colors"
            >
              Login →
            </Link>

            {/* Tablet/Mobile Menu Toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="rounded-md p-2 transition-colors md:hidden hover:bg-white/10"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile/Tablet Dropdown / Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-[55] pt-14 flex flex-col md:inset-auto md:top-14 md:left-0 md:right-0 md:border-b md:border-white/10 ${
              isDark ? "bg-[#0A1628]" : "bg-[#042C53]"
            }`}
          >
            {/* Tablet Links Stack (md: hidden on mobile, visible on tablet) */}
            <div className="hidden md:flex flex-col mx-auto w-full max-w-7xl px-4 py-3">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex h-12 items-center px-4 rounded-md text-white/90 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="flex h-12 items-center px-4 rounded-md text-teal-mid font-semibold hover:bg-white/5 transition-colors lg:hidden"
              >
                Login →
              </Link>
            </div>

            {/* Mobile Links Stack (sm: visible on mobile, hidden on tablet) */}
            <div className="flex md:hidden flex-col items-center justify-center flex-1 px-6 gap-4">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex h-14 w-full items-center justify-center text-[18px] font-medium text-white/90 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-4 flex w-full flex-col items-center gap-6">
                <Link
                  to="/login"
                  className="flex h-14 w-full items-center justify-center rounded-full bg-teal-mid text-[18px] font-semibold text-white transition-colors"
                >
                  Login →
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
