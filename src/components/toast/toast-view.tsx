"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ToastItem, ToastVariant } from "./types";

const variantConfig: Record<
  ToastVariant,
  {
    icon: typeof Info;
    iconClass: string;
    ringClass: string;
    accentClass: string;
  }
> = {
  message: {
    icon: CheckCircle2,
    iconClass: "text-secondary bg-secondary/15",
    ringClass: "ring-secondary/20",
    accentClass: "from-secondary/80 to-secondary/40",
  },
  info: {
    icon: Sparkles,
    iconClass: "text-secondary bg-secondary/15",
    ringClass: "ring-secondary/20",
    accentClass: "from-primary/80 to-secondary/60",
  },
  confirm: {
    icon: AlertTriangle,
    iconClass: "text-primary bg-primary/10",
    ringClass: "ring-primary/15",
    accentClass: "from-primary/80 to-primary/40",
  },
  delete: {
    icon: Trash2,
    iconClass: "text-destructive bg-destructive/10",
    ringClass: "ring-destructive/20",
    accentClass: "from-destructive/80 to-destructive/40",
  },
};

type ToastViewProps = {
  toast: ToastItem;
  onDismiss: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ToastView({
  toast,
  onDismiss,
  onConfirm,
  onCancel,
}: ToastViewProps) {
  const variant = toast.variant ?? "message";
  const config = variantConfig[variant];
  const Icon = config.icon;

  const isDialog = variant === "confirm" || variant === "delete";
  const confirmLabel =
    toast.confirmLabel ??
    (variant === "delete" ? "Delete" : variant === "confirm" ? "Yes" : "OK");
  const cancelLabel = toast.cancelLabel ?? (variant === "delete" ? "Cancel" : "No");

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex p-4",
        isDialog ? "items-center justify-center" : "items-end justify-center sm:items-end sm:justify-end"
      )}
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={isDialog ? onCancel : onDismiss}
      />

      <div
        role="alertdialog"
        aria-labelledby={`toast-title-${toast.id}`}
        aria-describedby={toast.description ? `toast-desc-${toast.id}` : undefined}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200",
          isDialog ? "max-w-md" : "max-w-sm sm:mb-4 sm:mr-4"
        )}
      >
        <div
          className={cn(
            "h-1 w-full bg-gradient-to-r",
            config.accentClass
          )}
        />

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl ring-4",
                config.iconClass,
                config.ringClass
              )}
            >
              <Icon className="size-5" strokeWidth={2.25} />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-3">
                <p
                  id={`toast-title-${toast.id}`}
                  className="font-semibold font-[family-name:var(--font-jakarta)] text-foreground"
                >
                  {toast.title}
                </p>
                {!isDialog && (
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              {toast.description && (
                <p
                  id={`toast-desc-${toast.id}`}
                  className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
                >
                  {toast.description}
                </p>
              )}
            </div>
          </div>

          <div
            className={cn(
              "mt-5 flex gap-2",
              isDialog ? "justify-end" : "justify-start"
            )}
          >
            {variant === "confirm" && (
              <>
                <Button variant="outline" onClick={onCancel}>
                  {cancelLabel}
                </Button>
                <Button onClick={onConfirm}>{confirmLabel}</Button>
              </>
            )}

            {variant === "delete" && (
              <>
                <Button variant="outline" onClick={onCancel}>
                  {cancelLabel}
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                  {confirmLabel}
                </Button>
              </>
            )}

            {(variant === "message" || variant === "info") && (
              <Button
                className={cn(
                  variant === "info" && "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                )}
                onClick={onDismiss}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
