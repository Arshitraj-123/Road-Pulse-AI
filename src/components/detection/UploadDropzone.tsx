import { motion } from "framer-motion";
import { UploadCloud, ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  onFile: (dataUrl: string, name: string) => void;
  disabled?: boolean;
}

const SAMPLES = [
  { label: "Sample: Grade 3 Pothole", url: "https://images.unsplash.com/photo-1597007030739-6d2e7172ee6c?w=900&q=70" },
  { label: "Sample: Alligator Cracking", url: "https://images.unsplash.com/photo-1601751818941-571144562ff8?w=900&q=70" },
  { label: "Sample: Edge Failure", url: "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=900&q=70" },
];

export function UploadDropzone({ onFile, disabled }: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const r = new FileReader();
    r.onload = (e) => onFile(String(e.target?.result ?? ""), f.name);
    r.readAsDataURL(f);
  };

  return (
    <div>
      <motion.label
        htmlFor="rp-file"
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        whileHover={{ scale: 1.005 }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card px-6 py-14 text-center transition-colors ${
          drag ? "border-teal-mid bg-teal-light/40" : "border-border hover:border-teal-mid/60"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-teal-light text-teal-dark">
          <UploadCloud className="size-7" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-navy">Drop road image here</p>
          <p className="mt-1 text-sm text-muted-foreground">PNG, JPG up to 10MB · or click to browse</p>
        </div>
        <input
          ref={inputRef}
          id="rp-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </motion.label>

      <div className="mt-4">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Or try a sample
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <button
              key={s.url}
              disabled={disabled}
              onClick={() => onFile(s.url, s.label)}
              className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left text-xs hover:border-teal-mid hover:bg-teal-light/30 disabled:opacity-50"
            >
              <ImageIcon className="size-4 text-teal-mid" />
              <span className="truncate text-navy">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
