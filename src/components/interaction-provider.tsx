"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  X,
  CheckCircle2,
  Info,
  TriangleAlert,
  ShieldCheck,
} from "lucide-react";

type Tone = "info" | "success" | "danger";
type Prompt = {
  title: string;
  description: string;
  accept?: string;
  tone?: Tone;
  details?: readonly string[];
  requireText?: string;
  acknowledgement?: string;
  alert?: boolean;
};
type Notice = { id: number; message: string; tone: Tone };
const Context = createContext<{
  confirm: (prompt: Prompt) => Promise<boolean>;
  notify: (message: string, tone?: Tone) => void;
}>({ confirm: async () => false, notify: () => {} });
export const useInteractions = () => useContext(Context);

function Toast({
  notice,
  dismiss,
}: {
  notice: Notice;
  dismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dismiss(notice.id), 6500);
    return () => clearTimeout(timer);
  }, [paused, dismiss, notice.id]);
  const Icon =
    notice.tone === "danger"
      ? TriangleAlert
      : notice.tone === "success"
        ? CheckCircle2
        : Info;
  return (
    <div
      className={`notice notice-${notice.tone}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon size={21} aria-hidden="true" />
      <span role={notice.tone === "danger" ? "alert" : "status"}>
        {notice.message}
      </span>
      <button
        className="icon-button"
        aria-label="Tutup notifikasi"
        onClick={() => dismiss(notice.id)}
      >
        <X size={17} />
      </button>
    </div>
  );
}

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [typed, setTyped] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const counter = useRef(0);
  const path = usePathname();
  const close = useCallback((value: boolean) => {
    dialog.current?.close();
    resolver.current?.(value);
    resolver.current = null;
    setPrompt(null);
  }, []);
  const confirm = useCallback((options: Prompt) => {
    // A duplicate click must never leave a pending promise or execute two actions.
    if (resolver.current) return Promise.resolve(false);
    setTyped("");
    setAccepted(false);
    setPrompt(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);
  const notify = useCallback((message: string, tone: Tone = "info") => {
    const id = ++counter.current;
    setNotices((items) =>
      [
        ...items.filter((item) => item.message !== message),
        { id, message, tone },
      ].slice(-3),
    );
  }, []);
  const dismiss = useCallback(
    (id: number) =>
      setNotices((items) => items.filter((item) => item.id !== id)),
    [],
  );
  useEffect(() => {
    close(false);
  }, [path, close]);
  useEffect(
    () => () => {
      resolver.current?.(false);
    },
    [],
  );
  useEffect(() => {
    if (!prompt) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    dialog.current
      ?.querySelector<HTMLButtonElement>("[data-default-action]")
      ?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [prompt]);
  const Icon =
    prompt?.tone === "danger"
      ? TriangleAlert
      : prompt?.tone === "success"
        ? ShieldCheck
        : Info;
  const contextValue = useMemo(() => ({ confirm, notify }), [confirm, notify]);
  return (
    <Context.Provider value={contextValue}>
      {children}
      <div className="notice-stack" aria-label="Notifikasi">
        {notices.map((notice) => (
          <Toast key={notice.id} notice={notice} dismiss={dismiss} />
        ))}
      </div>
      <dialog
        ref={dialog}
        className={`app-dialog tone-${prompt?.tone || "info"}`}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onCancel={(event) => {
          event.preventDefault();
          close(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              close(false);
          }
        }}
      >
        {prompt && (
          <>
            <div className="dialog-heading">
              <span className="dialog-symbol">
                <Icon size={26} />
              </span>
              <span className="eyebrow">
                {prompt.tone === "danger"
                  ? "PERIKSA SEBELUM MELANJUTKAN"
                  : "RUANG BELAJAR EDUCODE"}
              </span>
              <button
                className="icon-button"
                aria-label="Tutup dialog"
                onClick={() => close(false)}
              >
                <X size={19} />
              </button>
            </div>
            <div className="dialog-content">
              <h2 id="dialog-title">{prompt.title}</h2>
              <p id="dialog-description">{prompt.description}</p>
              {prompt.details && (
                <ul className="dialog-details">
                  {prompt.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              )}
              {prompt.acknowledgement && (
                <label className="dialog-ack">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />
                  <span>{prompt.acknowledgement}</span>
                </label>
              )}
              {prompt.requireText && (
                <label className="dialog-typed">
                  Ketik <strong>{prompt.requireText}</strong> untuk melanjutkan
                  <input
                    autoComplete="off"
                    spellCheck={false}
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                  />
                </label>
              )}
            </div>
            <div className="dialog-actions">
              {!prompt.alert && (
                <button
                  autoFocus
                  data-default-action
                  className="button secondary"
                  onClick={() => close(false)}
                >
                  Batal
                </button>
              )}
              <button
                autoFocus={prompt.alert}
                data-default-action={prompt.alert || undefined}
                className={`button ${prompt.tone === "danger" ? "danger" : "primary"}`}
                disabled={Boolean(
                  (prompt.requireText && typed !== prompt.requireText) ||
                  (prompt.acknowledgement && !accepted),
                )}
                onClick={() => close(true)}
              >
                {prompt.accept || "Ya, lanjutkan"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </Context.Provider>
  );
}
