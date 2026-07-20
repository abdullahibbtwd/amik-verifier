"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/mock-data";
import type { OptionSelectItem } from "@/lib/nin-options";

export type { OptionSelectItem };

type OptionSelectProps = {
  label?: string;
  hint?: string;
  placeholder?: string;
  options: OptionSelectItem[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function OptionSelect({
  label,
  hint,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  disabled,
  className,
}: OptionSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-left shadow-sm transition-all",
          "hover:border-secondary/50 hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          "disabled:pointer-events-none disabled:opacity-50",
          open && "border-secondary ring-3 ring-secondary/20"
        )}
      >
        {selected ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{selected.label}</p>
              {selected.badge && (
                <Badge
                  className={cn(
                    "text-[10px]",
                    selected.badge === "Premium"
                      ? "bg-secondary/15 text-secondary"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {selected.badge}
                </Badge>
              )}
            </div>
            {selected.description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {selected.description}
              </p>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {selected && (
            <span className="rounded-lg bg-primary px-2.5 py-1 text-sm font-semibold text-primary-foreground">
              {formatCurrency(selected.price)}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {hint && !open && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      {open && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-border bg-background shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="border-b border-border bg-muted/40 px-4 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Choose slip type
            </p>
          </div>
          <ul className="max-h-72 overflow-y-auto p-2">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-secondary/10 ring-1 ring-secondary/30"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                        isSelected
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {isSelected && <Check className="size-3" strokeWidth={3} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          {option.label}
                        </p>
                        {option.badge && (
                          <Badge
                            className={cn(
                              "gap-1 text-[10px]",
                              option.badge === "Premium"
                                ? "bg-secondary/15 text-secondary"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {option.badge === "Premium" && (
                              <Sparkles className="size-2.5" />
                            )}
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      {option.description && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {formatCurrency(option.price)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
