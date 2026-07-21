"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
};

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error,
  autoFocus = true,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const focusIndex = useCallback((index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus) {
      focusIndex(0);
    }
  }, [autoFocus, focusIndex]);

  function updateDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, length));
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      updateDigit(index, "");
      return;
    }

    if (cleaned.length > 1) {
      const next = digits.slice();
      const chars = cleaned.slice(0, length - index).split("");
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      onChange(next.join("").slice(0, length));
      focusIndex(Math.min(index + chars.length, length - 1));
      return;
    }

    updateDigit(index, cleaned);
    if (index < length - 1) {
      focusIndex(index + 1);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        updateDigit(index, "");
        return;
      }
      if (index > 0) {
        updateDigit(index - 1, "");
        focusIndex(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    onChange(pasted.padEnd(length, "").slice(0, length).replace(/ /g, ""));
    focusIndex(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1}`}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className={cn(
              "h-12 w-10 rounded-lg border border-border bg-background text-center text-lg font-semibold tracking-widest outline-none transition-all sm:h-14 sm:w-12 sm:text-xl",
              "focus-visible:border-secondary focus-visible:ring-3 focus-visible:ring-secondary/30",
              error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              disabled && "opacity-50"
            )}
          />
        ))}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
