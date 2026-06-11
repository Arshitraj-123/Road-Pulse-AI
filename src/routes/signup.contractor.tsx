import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Check, CheckCircle2 } from "lucide-react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup/contractor")({
  head: () => ({ meta: [{ title: "Contractor access — RoadPulse AI" }] }),
  component: ContractorSignup,
});

function ContractorSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: "",
    license: "",
    municipality: "Patna Municipal Corp.",
    contact: "",
    email: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthShell eyebrow="Contractor access" maxWidth={520}>
      <AuthCard>
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-teal-light text-teal-dark">
              <CheckCircle2 className="size-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-navy">
              Request submitted
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We've notified the municipal admin. You'll receive an approval email at{" "}
              <span className="font-mono text-navy">{form.email || "your inbox"}</span>{" "}
              within 1–2 working days.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-navy">Request portal access</h1>
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
                    className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={form.municipality}
                    onChange={(e) => setForm({ ...form, municipality: e.target.value })}
                  >
                    <option>Patna Municipal Corp.</option>
                    <option>NMCH Zone</option>
                    <option>Danapur Nagar Parishad</option>
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
                <Label>Upload license doc</Label>
                <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-teal-mid hover:bg-teal-light/30">
                  <Upload className="size-6 text-teal-mid" />
                  <p className="mt-2 text-sm font-medium text-navy">
                    Drop file or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">PDF or image · max 5MB</p>
                  <input type="file" accept=".pdf,image/*" className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-amber py-3 text-sm font-semibold text-white transition-colors hover:bg-amber/90"
              >
                Submit access request
              </button>
            </form>
          </>
        )}
      </AuthCard>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-bold text-navy">What happens next</h3>
        <ol className="relative mt-4 space-y-5 pl-9">
          <span className="absolute left-3 top-3 bottom-3 w-px bg-border" />
          {[
            {
              label: "Request submitted",
              desc: "Municipal admin receives your application",
              pill: { text: "Pending", cls: "bg-amber-light text-amber" },
              done: submitted,
              current: submitted,
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
                <span className="text-sm font-semibold text-navy">{s.label}</span>
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
