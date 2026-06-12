import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";
import { OTPInput } from "@/components/auth/OTPInput";
import { useAuthStore, type Role } from "@/store/useAuthStore";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

const searchSchema = z.object({
  phone: z.string().optional(),
  role: z.enum(["citizen", "municipal", "contractor"]).optional(),
  userId: z.string().optional(),
});

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify OTP — RoadPulse AI" }] }),
  validateSearch: searchSchema,
  component: VerifyPage,
});

const DEMO_CODE = "4729";

function VerifyPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const verifyOTP = useAuthStore((s) => s.verifyOTP);
  const [seconds, setSeconds] = useState(522);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const phone = search.phone ?? "9876543210";
  const role: Role = (search.role as Role) ?? "citizen";
  const userId = search.userId || "";
  const masked = `+91 ${phone.slice(0, 5)} ••••• ${phone.slice(-2)}`;

  const handleComplete = async (code: string) => {
    try {
      const res = await verifyOTP("+91" + phone.replace(/\D/g, "").slice(0, 10), code, userId);
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          const dest = role === "municipal" ? "/dashboard" : role === "contractor" ? "/contractor" : "/citizen";
          navigate({ to: dest });
        }, 1500);
      } else {
        setError(true);
        setTimeout(() => setError(false), 600);
      }
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AuthShell eyebrow="Verification" maxWidth={420}>
      <AuthCard>
        <h1 className="font-display text-2xl font-bold text-foreground">Enter OTP</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sent to {masked}</p>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 py-8 flex flex-col items-center justify-center space-y-4"
            >
              <CheckCircle2 className="size-12 text-teal-mid" />
              <p className="font-semibold text-foreground text-center">Verified successfully!</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Redirecting...
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {/* SMS Preview Bubble */}
              <div className="mt-5 rounded-2xl rounded-tl-sm bg-muted/60 p-4 relative">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-muted/60" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-mid">
                  RoadPulse SMS
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Your verification code is:
                </div>
                <div className="mt-2 font-mono text-[22px] font-bold tracking-[6px] text-foreground">
                  {DEMO_CODE.split("").join(" ")}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Valid for 10 minutes. Do not share with anyone.
                  <br />(Check backend terminal for OTP if not SMS)
                </div>
              </div>

              <div className="mt-8 mb-4">
                <OTPInput length={4} onComplete={handleComplete} error={error} />
              </div>

              {error && (
                <p className="text-center text-sm text-danger mt-2 font-medium">Invalid code. Please try again.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <button
            onClick={() => setSeconds(600)}
            className="font-semibold text-teal-mid hover:underline"
          >
            Resend code
          </button>
          <span>
            expires in <span className="font-mono text-foreground">{mm}:{ss}</span>
          </span>
        </div>
      </AuthCard>

      <div className="mt-6 rounded-2xl bg-teal-mid/10 p-5 border border-teal-mid/20">
        <div className="text-sm font-semibold text-foreground">After verification you'll get:</div>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>· Citizen dashboard with your reports</li>
          <li>· Leaderboard rank in Patna</li>
          <li>· WhatsApp bot linked to your account</li>
          <li>· +50 welcome points</li>
        </ul>
      </div>
    </AuthShell>
  );
}
