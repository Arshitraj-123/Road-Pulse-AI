import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { useAuthStore, type Role } from "@/store/useAuthStore";
import { z } from "zod";

const searchSchema = z.object({
  phone: z.string().optional(),
  role: z.enum(["citizen", "municipal", "contractor"]).optional(),
});

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify OTP — RoadPulse AI" }] }),
  validateSearch: searchSchema,
  component: VerifyPage,
});

const DEMO_CODE = "472913";

function VerifyPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(522);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const phone = search.phone ?? "9876543210";
  const role: Role = (search.role as Role) ?? "citizen";
  const masked = `+91 ${phone.slice(0, 5)} ••••• ${phone.slice(-2)}`;

  const handleChange = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) return;
    login(role);
    const dest = role === "municipal" ? "/dashboard" : role === "contractor" ? "/contractor" : "/citizen";
    navigate({ to: dest });
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AuthShell eyebrow="Verification" maxWidth={420}>
      <AuthCard>
        <h1 className="font-display text-2xl font-bold text-navy">Enter OTP</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sent to {masked}</p>

        <div className="mt-5 rounded-lg bg-muted/60 p-4">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-mid">
            RoadPulse
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Your verification code is:
          </div>
          <div className="mt-2 font-mono text-[22px] font-bold tracking-[6px] text-navy">
            {DEMO_CODE.split("").join(" ")}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Valid for 10 minutes. Do not share with anyone.
          </div>
        </div>

        <form onSubmit={submit} className="mt-5">
          <div className="flex gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                inputMode="numeric"
                maxLength={1}
                placeholder="·"
                className={`h-12 flex-1 rounded-lg border text-center font-mono text-lg font-bold transition-colors ${
                  d
                    ? "border-teal-mid bg-teal-light text-teal-dark"
                    : "border-input bg-transparent text-muted-foreground placeholder:text-muted-foreground/40"
                } focus:border-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid/30`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={digits.join("").length !== 6}
            className="mt-5 w-full rounded-lg bg-teal-mid py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Verify and create account →
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <button
            onClick={() => setSeconds(600)}
            className="font-semibold text-teal-mid hover:underline"
          >
            Resend code
          </button>
          <span>
            expires in <span className="font-mono text-navy">{mm}:{ss}</span>
          </span>
        </div>
      </AuthCard>

      <div className="mt-6 rounded-2xl bg-teal-light/60 p-5">
        <div className="text-sm font-semibold text-navy">After verification you'll get:</div>
        <ul className="mt-2 space-y-1 text-xs text-navy/80">
          <li>· Citizen dashboard with your reports</li>
          <li>· Leaderboard rank in Patna</li>
          <li>· WhatsApp bot linked to your account</li>
          <li>· +50 welcome points</li>
        </ul>
      </div>
    </AuthShell>
  );
}
