"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

import { cn } from "./utils";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const TONES: Record<ToastTone, { wrap: string; icon: React.ElementType }> = {
  success: {
    wrap: "border-emerald-200 bg-admin-surface text-emerald-800",
    icon: CheckCircle2,
  },
  error: { wrap: "border-red-200 bg-admin-surface text-red-800", icon: XCircle },
  info: { wrap: "border-admin-line bg-admin-surface text-admin-ink", icon: CheckCircle2 },
};

/** Toast notifications for successful / failed operations (spec §3). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (m: string) => toast(m, "success"),
      error: (m: string) => toast(m, "error"),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 end-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => {
          const { icon: Icon, wrap } = TONES[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
                wrap
              )}
            >
              <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden />
              <p className="flex-1 text-sm font-medium">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Close"
                className="text-admin-muted transition-colors hover:text-admin-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
