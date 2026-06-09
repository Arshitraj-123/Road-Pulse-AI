import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/navigate", label: "Navigate" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/login", label: "Login" },
];

export function PublicNavbar({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const stored = localStorage.getItem("rp_theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("rp_theme", next ? "dark" : "light");
  };

  const isDark = variant === "dark";
  const base = isDark
    ? "bg-[rgba(4,44,83,0.78)] text-white"
    : "bg-white/80 text-navy";
  const border = scrolled
    ? isDark
      ? "border-b border-teal-mid/20"
      : "border-b border-teal-mid/10"
    : "border-b border-transparent";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md ${base} ${border}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-teal-mid">
            <svg viewBox="0 0 24 24" fill="none" className="size-5">
              <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold tracking-tight">RoadPulse</span>
          <span className="rounded bg-teal-mid/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-teal-mid">
            AI
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? isDark ? "text-teal-mid" : "text-teal"
                    : isDark ? "text-white/80 hover:text-white" : "text-navy/70 hover:text-navy"
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

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`rounded-md p-2 transition-colors ${
              isDark ? "hover:bg-white/10" : "hover:bg-black/5"
            }`}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link
            to="/login"
            className="rounded-md border border-teal-mid px-3.5 py-1.5 text-sm font-medium text-teal-mid hover:bg-teal-mid hover:text-white transition-colors"
          >
            Login →
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
