import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: boolean;
}

export function OTPInput({ length = 4, onComplete, error = false }: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (error) {
      setDigits(Array(length).fill(""));
      refs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);

    if (ch && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
    
    if (next.join("").length === length) {
      onComplete(next.join(""));
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = [...digits];
    pasted.split("").forEach((char, idx) => {
      if (idx < length) next[idx] = char;
    });
    setDigits(next);
    
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();

    if (pasted.length === length) {
      onComplete(pasted);
    }
  };

  return (
    <motion.div
      className="flex gap-3 justify-center"
      animate={error ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          placeholder="·"
          className={`h-14 w-12 rounded-lg border text-center font-mono text-xl font-bold transition-colors ${
            error
              ? "border-danger bg-danger/10 text-danger"
              : d
              ? "border-teal-mid bg-teal-mid/10 text-teal-dark dark:text-teal-mid"
              : "border-input bg-transparent text-foreground placeholder:text-muted-foreground/40"
          } focus:border-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid/30`}
        />
      ))}
    </motion.div>
  );
}
