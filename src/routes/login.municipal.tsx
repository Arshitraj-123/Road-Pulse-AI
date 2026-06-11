import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Check } from "lucide-react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, MOCK_USERS } from "@/store/useAuthStore";

export const Route = createFileRoute("/login/municipal")({
  head: () => ({ meta: [{ title: "Officer sign in — RoadPulse AI" }] }),
  component: MunicipalLogin,
});

function MunicipalLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: "officer@patna.gov.in", password: "demo123" });
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const found = MOCK_USERS.find(
      (u) => u.email === form.email && u.password === form.password && u.role === "municipal"
    );
    if (!found) {
      setError("Invalid credentials. Try officer@patna.gov.in / demo123");
      return;
    }
    login("municipal", found.name, found.email);
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell eyebrow="Municipal officer">
      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber/40 bg-amber-light p-3.5 text-sm">
        <Lock className="mt-0.5 size-4 shrink-0 text-amber" />
        <div className="text-navy">
          <span className="font-semibold">Invite-only access.</span>{" "}
          Municipal officer accounts are created by your municipality's IT admin. If
          you don't have credentials, contact{" "}
          <span className="font-mono text-xs text-amber">admin@patna.gov.in</span>
        </div>
      </div>

      <AuthCard>
        <h1 className="font-display text-2xl font-bold text-navy">Officer sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use your government email address</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="govemail">Government email</Label>
            <Input
              id="govemail"
              type="email"
              className="mt-1.5"
              placeholder="arjun.singh@patna.gov.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Must end in .gov.in or your municipality domain
            </p>
          </div>

          <div>
            <Label htmlFor="mpassword">Password</Label>
            <Input
              id="mpassword"
              type="password"
              className="mt-1.5"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-mid"
          >
            Sign in to municipal portal →
          </button>
        </form>

        <div className="mt-5 flex justify-center gap-3 text-xs text-muted-foreground">
          <button className="hover:text-navy">Forgot password?</button>
          <span>·</span>
          <button className="hover:text-navy">Request access from admin</button>
        </div>
      </AuthCard>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-bold text-navy">
          First time? Here's how access works
        </h3>
        <ol className="relative mt-4 space-y-5 pl-9">
          <span className="absolute left-3 top-3 bottom-3 w-px bg-border" />
          {[
            { label: "Admin creates your account", desc: "Your municipality's IT team adds you in the admin panel", done: true },
            { label: "You receive an invite email", desc: "Click the magic link to set your password", done: true },
            { label: "Sign in above", desc: "Access is scoped to your municipality only", current: true },
          ].map((s, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-9 flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  s.done
                    ? "bg-teal-mid text-white"
                    : s.current
                    ? "bg-navy text-white ring-4 ring-navy/15"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <div className="text-sm font-semibold text-navy">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </li>
          ))}
        </ol>
      </div>
    </AuthShell>
  );
}
