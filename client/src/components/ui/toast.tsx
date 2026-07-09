"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "loading" | "info";
type Toast = { id: string; title: string; description?: string; kind: ToastKind };
type ToastInput = Omit<Toast, "id" | "kind">;
type ToastContextValue = {
  success: (toast: ToastInput) => void;
  error: (toast: ToastInput) => void;
  loading: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, toast: ToastInput, ttl = 4200) => {
      const id = crypto.randomUUID();
      setToasts((items) => [...items, { ...toast, id, kind }].slice(-4));
      if (kind !== "loading") window.setTimeout(() => dismiss(id), ttl);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      success: (toast: ToastInput) => push("success", toast),
      error: (toast: ToastInput) => push("error", toast, 6200),
      loading: (toast: ToastInput) => push("loading", toast),
      dismiss,
    }),
    [dismiss, push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(92vw,360px)] gap-2">
        {toasts.map((toast) => (
          <ToastView key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? XCircle : toast.kind === "loading" ? Loader2 : Info;
  return (
    <div className="flex gap-3 rounded-[4px] border border-border bg-[#121a22] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          toast.kind === "success" && "text-success",
          toast.kind === "error" && "text-destructive",
          toast.kind === "loading" && "animate-spin text-accent",
          toast.kind === "info" && "text-foreground-muted",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-xs leading-5 text-foreground-muted">{toast.description}</p> : null}
      </div>
      <button type="button" onClick={onDismiss} className="grid h-6 w-6 place-items-center rounded-[3px] text-text-muted hover:bg-surface-raised hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
