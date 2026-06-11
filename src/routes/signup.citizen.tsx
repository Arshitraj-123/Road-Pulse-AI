import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/signup/citizen")({
  head: () => ({ meta: [{ title: "Citizen signup — RoadPulse AI" }] }),
  component: CitizenSignup,
});

function CitizenSignup() {
  const navigate = useNavigate();
  const setAuthStep = useAuthStore((s) => s.setAuthStep);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStep("verify");
    navigate({
      to: "/verify",
      search: { phone: form.phone || "9876543210", role: "citizen" },
    });
  };

  return (
    <AuthShell
      eyebrow="Citizen signup"
      footerNote={
        <>
          By signing up you agree to RoadPulse's Terms of Service.
          <br />
          Your reports help make Patna's roads safer.
        </>
      }
    >
      <AuthCard>
        <h1 className="font-display text-2xl font-bold text-navy">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free forever · no app download needed
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              className="mt-1.5"
              placeholder="Priya Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone number</Label>
            <div className="mt-1.5 flex gap-2">
              <div className="flex h-9 w-[72px] items-center justify-center rounded-md border border-input bg-muted/50 font-mono text-sm font-medium text-navy">
                +91
              </div>
              <Input
                id="phone"
                inputMode="numeric"
                className="flex-1"
                placeholder="98765 43210"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              We'll send a 6-digit OTP to verify
            </p>
          </div>

          <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or sign up with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              className="mt-1.5"
              placeholder="priya@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="mt-1.5"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-teal-mid py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-dark"
          >
            Create account → get OTP
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-teal-mid hover:underline">
            Sign in
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
