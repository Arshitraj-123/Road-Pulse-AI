import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Check, CheckCircle2 } from "lucide-react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { z } from "zod";

const searchSchema = z.object({
  tab: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/signup/contractor")({
  head: () => ({ meta: [{ title: "Contractor — RoadPulse AI" }] }),
  validateSearch: searchSchema,
  component: ContractorAuth,
});

function ContractorAuth() {
  const navigate = useNavigate();
  const { tab: initialTab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate({
      to: "/signup/contractor",
      search: { tab: tab as "signin" | "signup" },
      replace: true,
    });
  };

  return (
    <AuthShell eyebrow="Contractor" maxWidth={520}>
      <AuthCard>
        {requestSubmitted ? (
          <RequestSubmittedView email={submittedEmail} />
        ) : (
          <>
            <AuthTabs
              tabs={["signin", "signup"]}
              labels={["Sign In", "Request Access"]}
              active={activeTab}
              onChange={handleTabChange}
            />

            {activeTab === "signin" ? (
              <SignInForm />
            ) : (
              <RequestAccessForm
                onSubmitted={(email) => {
                  setRequestSubmitted(true);
                  setSubmittedEmail(email);
                }}
              />
            )}
          </>
        )}
      </AuthCard>

      {/* "What happens next" timeline — shown below both tabs */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-bold text-foreground">What happens next</h3>
        <ol className="relative mt-4 space-y-5 pl-9">
          <span className="absolute left-3 top-3 bottom-3 w-px bg-border" />
          {[
            {
              label: "Request submitted",
              desc: "Municipal admin receives your application",
              pill: { text: "Pending", cls: "bg-amber-light text-amber" },
              done: requestSubmitted,
              current: requestSubmitted,
            },
            {
              label: "Review (1–2 working days)",
              desc: "License and registration verified",
            },
            {
              label: "Approval email",
              desc: "Set your password and access your work queue",
              pill: { text: "Approved", cls: "bg-teal-light text-teal-dark" },
            },
          ].map((s, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-9 flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  s.done
                    ? "bg-teal-mid text-white"
                    : s.current
                      ? "bg-amber text-white ring-4 ring-amber/15"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {s.done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                {s.pill && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.pill.cls}`}>
                    {s.pill.text}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </li>
          ))}
        </ol>
      </div>
    </AuthShell>
  );
}

// ─── SIGN IN TAB ───────────────────────────────────
function SignInForm() {
  const navigate = useNavigate();
  const contractorLogin = useAuthStore((s) => s.contractorLogin);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await contractorLogin(form.email, form.password);
      if (res.success) {
        // Route based on approval status
        const status = res.contractorData?.approvalStatus;
        if (status === "pending") {
          navigate({ to: "/contractor/pending" as string });
        } else if (status === "rejected") {
          navigate({ to: "/contractor/rejected" as string });
        } else if (status === "blacklisted") {
          navigate({ to: "/contractor/blacklisted" as string });
        } else {
          navigate({ to: "/contractor" });
        }
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
    <>
      <h1 className="font-display text-2xl font-bold text-foreground">Contractor sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the email you registered with
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="c-email">Work email</Label>
          <Input
            id="c-email"
            type="email"
            className="mt-1.5"
            placeholder="rajesh@alphabuilders.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="c-password">Password</Label>
          <Input
            id="c-password"
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
          className="mt-2 w-full rounded-lg bg-amber py-3 text-sm font-semibold text-white transition-colors hover:bg-amber/90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in →"}
        </button>
      </form>

      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground dark:bg-white/5">
        Only approved contractors can access the work queue.
        Pending accounts will see a waiting screen.
      </div>
    </>
  );
}

// ─── REQUEST ACCESS TAB ────────────────────────────
function RequestAccessForm({ onSubmitted }: { onSubmitted: (email: string) => void }) {
  const [form, setForm] = useState({
    company: "",
    license: "",
    municipality: "6a2ab2cbd2b617d9a1d1facf",
    contact: "",
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
        const res = await api.post("/api/auth/contractor/request", {
          companyName: form.company,
          licenseNumber: form.license,
          municipalityId: form.municipality,
          contactPerson: form.contact,
          email: form.email,
          password: form.password,
        });
        if (res.success) {
          onSubmitted(form.email);
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
        <h1 className="font-display text-2xl font-bold text-foreground">Request portal access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your application will be reviewed by the municipal authority
        </p>
  
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="company">Company name</Label>
            <Input
              id="company"
              className="mt-1.5"
              placeholder="Alpha Builders Pvt. Ltd."
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
  
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="license">License number</Label>
              <Input
                id="license"
                className="mt-1.5"
                placeholder="BH-CON-2024-001"
                value={form.license}
                onChange={(e) => setForm({ ...form, license: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="muni">Municipality</Label>
              <select
                id="muni"
                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm dark:bg-[#0A1628]"
                value={form.municipality}
                onChange={(e) => setForm({ ...form, municipality: e.target.value })}
              >
                <option value="6a2ab2cbd2b617d9a1d1facf" className="dark:bg-[#0A1628]">Patna Municipal Corp.</option>
                <option value="nmch-zone-id" className="dark:bg-[#0A1628]">NMCH Zone</option>
                <option value="danapur-id" className="dark:bg-[#0A1628]">Danapur Nagar Parishad</option>
              </select>
            </div>
          </div>

        <div>
          <Label htmlFor="contact">Contact person</Label>
          <Input
            id="contact"
            className="mt-1.5"
            placeholder="Rajesh Kumar (Site Manager)"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="cemail">Work email</Label>
          <Input
            id="cemail"
            type="email"
            className="mt-1.5"
            placeholder="rajesh@alphabuilders.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="cpassword">Password</Label>
          <Input
            id="cpassword"
            type="password"
            className="mt-1.5"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div>
          <Label>Upload license doc</Label>
          <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-teal-mid hover:bg-teal-light/30">
            <Upload className="size-6 text-teal-mid" />
            <p className="mt-2 text-sm font-medium text-foreground">
              Drop file or click to upload
            </p>
            <p className="text-xs text-muted-foreground">PDF or image · max 5MB</p>
            <input type="file" accept=".pdf,image/*" className="hidden" />
          </label>
        </div>

        {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-amber py-3 text-sm font-semibold text-white transition-colors hover:bg-amber/90 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit access request"}
        </button>
      </form>
    </>
  );
}

// ─── SUCCESS VIEW ──────────────────────────────────
function RequestSubmittedView({ email }: { email: string }) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-teal-light text-teal-dark">
        <CheckCircle2 className="size-7" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        Request submitted
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We've notified the municipal admin. You'll receive an approval email at{" "}
        <span className="font-mono text-foreground">{email || "your inbox"}</span>{" "}
        within 1–2 working days.
      </p>
    </div>
  );
}
