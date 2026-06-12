import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Check, Mail } from "lucide-react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/login/municipal")({
  head: () => ({ meta: [{ title: "Officer sign in — RoadPulse AI" }] }),
  component: MunicipalLogin,
});

function MunicipalLogin() {
  const navigate = useNavigate();
  const municipalLogin = useAuthStore((s) => s.municipalLogin);
  const [form, setForm] = useState({ email: "arjun@patna.gov.in", password: "demo123" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await municipalLogin(form.email, form.password);
      if (res.success) {
        navigate({ to: "/dashboard" });
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Municipal officer">
      <AuthCard>
        <h1 className="font-display text-2xl font-bold text-foreground">Officer sign in</h1>
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
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-mid disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in to portal →"}
          </button>
        </form>
      </AuthCard>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber/30 bg-amber-light/50 p-5 dark:bg-amber/10">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-amber">
          <Lock className="size-4" />
          Don't have an account?
        </div>
        <p className="text-sm text-muted-foreground">
          Municipal officer accounts are created by your municipality's IT admin. They cannot be created manually.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Contact:</span>
          <a href="mailto:admin@patna.gov.in" className="font-mono font-medium text-teal-mid hover:underline">
            admin@patna.gov.in
          </a>
        </div>
      </div>
    </AuthShell>
  );
}
