"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  icon: LucideIcon;
  placeholder?: string;
  defaultValue?: string;
  autoComplete?: string;
  passwordToggle?: boolean;
  className?: string;
};

export function AuthField({
  id,
  label,
  type = "text",
  icon: Icon,
  placeholder,
  defaultValue,
  autoComplete,
  passwordToggle,
  className,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password" || passwordToggle;
  const inputType = isPassword && passwordToggle
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
          type={inputType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          className={cn(
            "h-11 bg-background pl-10 text-sm",
            isPassword && passwordToggle && "pr-11"
          )}
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
    </div>
  );
}
