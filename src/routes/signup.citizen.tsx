import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { z } from "zod";

const searchSchema = z.object({
  tab: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/signup/citizen")({
  head: () => ({ meta: [{ title: "Citizen — RoadPulse AI" }] }),
  validateSearch: searchSchema,
  component: CitizenAuth,
});

function CitizenAuth() {
  const navigate = useNavigate();
  const { tab: initialTab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without navigation
    navigate({
      to: "/signup/citizen",
      search: { tab: tab as "signin" | "signup" },
      replace: true,
    });
  };

  return (
    <AuthShell
      eyebrow="Citizen"
      footerNote={
        <>
          By signing up you agree to RoadPulse's Terms of Service.
          <br />
          Your reports help make Patna's roads safer.
        </>
      }
    >
      <AuthCard>
        <AuthTabs
          tabs={["signin", "signup"]}
          labels={["Sign In", "Sign Up"]}
          active={activeTab}
          onChange={handleTabChange}
        />

        {activeTab === "signin" ? <SignInForm /> : <SignUpForm />}
      </AuthCard>
    </AuthShell>
  );
}

// ─── SIGN IN TAB ───────────────────────────────────
function SignInForm() {
  const navigate = useNavigate();
  const citizenLogin = useAuthStore((s) => s.citizenLogin);
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await citizenLogin(identifier);
      if (res.success) {
        navigate({
          to: "/verify",
          search: { phone: identifier, role: "citizen", userId: res.userId },
        });
      } else {
        setError(res.message || "Account not found.");
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in with your phone or email — we'll send an OTP
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="signin-identifier">Phone or email</Label>
          <Input
            id="signin-identifier"
            className="mt-1.5"
            placeholder="9876543210 or priya@gmail.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            We'll send a 4-digit OTP to verify your identity
          </p>
        </div>

        {error && <p className="text-xs font-medium text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading || !identifier.trim()}
          className="mt-2 w-full rounded-lg bg-teal-mid py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-dark disabled:opacity-50"
        >
          {loading ? "Sending OTP..." : "Sign in →"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <button className="text-sm text-muted-foreground hover:text-teal-mid hover:underline">
          Forgot password?
        </button>
      </div>
    </>
  );
}

// ─── SIGN UP TAB ───────────────────────────────────
function SignUpForm() {
  const navigate = useNavigate();
  const setAuthStep = useAuthStore((s) => s.setAuthStep);
  const citizenSignup = useAuthStore((s) => s.citizenSignup);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await citizenSignup({
        fullName: form.name,
        phone: "+91" + form.phone,
        email: form.email,
        password: form.password,
        municipalityId: "65d8f1e5a2c4e2b10f9a2b5a", // mocked for now
      });
      if (res.success) {
        setAuthStep("verify");
        navigate({
          to: "/verify",
          search: {
            phone: form.phone || form.email,
            role: "citizen",
            userId: res.userId,
          },
        });
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
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
            <div className="flex h-9 w-[72px] items-center justify-center rounded-md border border-input bg-muted/50 font-mono text-sm font-medium text-foreground">
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
            We'll send a 4-digit OTP to verify
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

        {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-teal-mid py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-dark disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account → get OTP"}
        </button>
      </form>
    </>
  );
}
