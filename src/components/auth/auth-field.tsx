"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "id"
> & {
  id: string;
  label: string;
  type?: string;
  icon: LucideIcon;
  passwordToggle?: boolean;
  error?: string;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    {
      id,
      label,
      type = "text",
      icon: Icon,
      placeholder,
      autoComplete,
      passwordToggle,
      className,
      error,
      disabled,
      ...props
    },
    ref
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password" || passwordToggle;
    const inputType =
      isPassword && passwordToggle
        ? showPassword
          ? "text"
          : "password"
        : type;

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <div className="relative">
          <Icon className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              "h-11 bg-background pl-10 text-sm",
              isPassword && passwordToggle && "pr-11",
              error && "border-destructive"
            )}
            {...props}
          />
          {isPassword && passwordToggle && (
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }
);
