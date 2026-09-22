"use client";
import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useProgress } from "./progress-provider";
export function CodeBlock({
  code,
  label = "LARAVEL / PHP",
}: {
  code: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { notify } = useProgress();
  return (
    <div className="code-block">
      <div className="code-header">
        <span>
          <i />
          <i />
          <i /> <b>{label}</b>
        </span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              notify(
                "Salin otomatis tidak tersedia. Pilih teks kode dan salin secara manual.",
              );
            }
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="meter"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
