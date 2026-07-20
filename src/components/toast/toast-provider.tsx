"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastView } from "./toast-view";
import type { ToastContextValue, ToastItem, ToastOptions } from "./types";

const ToastContext = createContext<ToastContextValue | null>(null);

function createId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.map((t) => (t.id === id ? { ...t, open: false } : t))
    );

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? createId();
      const variant = options.variant ?? "message";
      const item: ToastItem = { ...options, id, variant, open: true };

      setToasts((current) => [...current.filter((t) => t.open), item]);

      if (
        (variant === "message" || variant === "info") &&
        options.duration !== 0
      ) {
        const duration = options.duration ?? (variant === "info" ? 5000 : 4000);
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  const message = useCallback(
    (options: Omit<ToastOptions, "variant">) =>
      show({ ...options, variant: "message" }),
    [show]
  );

  const info = useCallback(
    (options: Omit<ToastOptions, "variant">) =>
      show({ ...options, variant: "info" }),
    [show]
  );

  const confirm = useCallback(
    (options: Omit<ToastOptions, "variant">) =>
      show({ ...options, variant: "confirm" }),
    [show]
  );

  const deleteToast = useCallback(
    (options: Omit<ToastOptions, "variant">) =>
      show({ ...options, variant: "delete" }),
    [show]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      message,
      info,
      confirm,
      delete: deleteToast,
      dismiss,
    }),
    [show, message, info, confirm, deleteToast, dismiss]
  );

  const activeToast = toasts.find((t) => t.open);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {activeToast && (
        <ToastView
          toast={activeToast}
          onDismiss={() => dismiss(activeToast.id)}
          onConfirm={async () => {
            await activeToast.onConfirm?.();
            dismiss(activeToast.id);
          }}
          onCancel={() => {
            activeToast.onCancel?.();
            dismiss(activeToast.id);
          }}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
