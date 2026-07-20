"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { quickActions, type QuickAction } from "@/lib/quick-actions";
import { useToast } from "@/components/toast";

type QuickActionsGridProps = {
  actions?: QuickAction[];
  className?: string;
  columns?: 2 | 4;
};

export function QuickActionsGrid({
  actions = quickActions,
  className,
  columns = 4,
}: QuickActionsGridProps) {
  const toast = useToast();

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3",
        columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-2",
        className
      )}
    >
      {actions.map((action) => {
        const isVerify = Boolean(action.href);
        const buttonClass = cn(
          "flex min-h-[5.5rem] flex-col items-center justify-center gap-2.5 rounded-xl px-4 py-5 text-center font-semibold shadow-md transition-all",
          "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md",
          isVerify
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
        );
        const iconWrapClass = cn(
          "flex size-11 items-center justify-center rounded-full",
          isVerify ? "bg-white/15" : "bg-white/20"
        );

        const content = (
          <>
            <div className={iconWrapClass}>
              <action.icon className="size-5" strokeWidth={2.25} />
            </div>
            <span className="text-sm leading-tight">{action.label}</span>
          </>
        );

        if (action.href) {
          return (
            <Link key={action.label} href={action.href} className={buttonClass}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            type="button"
            onClick={() =>
              toast.info({
                title: "Coming soon",
                description: `${action.label} is not available yet. We're building it and will notify you when it launches.`,
                confirmLabel: "Got it",
              })
            }
            className={buttonClass}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
