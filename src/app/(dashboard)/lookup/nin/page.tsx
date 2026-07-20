"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Download,
  FileCheck2,
  FileText,
  FileWarning,
  IdCard,
  Loader2,
  Search,
} from "lucide-react";
import { useToast } from "@/components/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionSelect } from "@/components/ui/option-select";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, mockLookupResult } from "@/lib/mock-data";
import {
  mockNinRecentFiles,
  ninSlipOptions,
} from "@/lib/nin-options";

type ResultState = "idle" | "loading" | "success" | "failure";

export default function NinLookupPage() {
  const [identifier, setIdentifier] = useState("");
  const [slipType, setSlipType] = useState(ninSlipOptions[0].value);
  const [state, setState] = useState<ResultState>("idle");
  const toast = useToast();

  const selectedOption = useMemo(
    () => ninSlipOptions.find((option) => option.value === slipType),
    [slipType]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (identifier.length !== 11) return;

    setState("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setState(identifier === "12345678901" ? "success" : "failure");
  }

  const result =
    state === "success"
      ? mockLookupResult.success
      : state === "failure"
        ? mockLookupResult.failure
        : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Verify NIN</h1>
        <p className="text-sm text-muted-foreground">
          Select a slip type, enter the NIN, and run a secure verification
        </p>
      </div>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary/10">
              <IdCard className="size-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base">NIN verification</CardTitle>
              <CardDescription>
                11-digit National Identification Number
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <OptionSelect
              label="Slip type"
              hint="Choose what you want to verify or generate"
              options={ninSlipOptions}
              value={slipType}
              onChange={(value) => {
                setSlipType(value);
                setState("idle");
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="nin">NIN number</Label>
              <Input
                id="nin"
                inputMode="numeric"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value.replace(/\D/g, "").slice(0, 11));
                  setState("idle");
                }}
                placeholder="Enter 11-digit NIN"
                maxLength={11}
                className="h-12 font-mono text-base tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                {identifier.length}/11 digits
              </p>
            </div>

            {selectedOption && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total charge</p>
                  <p className="text-sm font-medium">{selectedOption.label}</p>
                </div>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(selectedOption.price)}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={state === "loading" || identifier.length !== 11}
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Run Verification
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {state === "success" && result && "name" in result && (
        <Alert className="border-success/30 bg-success/5">
          <FileCheck2 className="size-4 text-success" />
          <AlertTitle className="text-success">Verification successful</AlertTitle>
          <AlertDescription>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Full name</dt>
              <dd className="font-medium">{result.name}</dd>
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd>{result.dateOfBirth}</dd>
              <dt className="text-muted-foreground">Gender</dt>
              <dd>{result.gender}</dd>
              <dt className="text-muted-foreground">State</dt>
              <dd>{result.state}</dd>
            </dl>
          </AlertDescription>
        </Alert>
      )}

      {state === "failure" && result && "message" in result && (
        <Alert variant="destructive">
          <FileWarning className="size-4" />
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent NIN files</CardTitle>
          <CardDescription>
            Your latest NIN verifications and generated slips
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {mockNinRecentFiles.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    file.status === "verified"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{file.slipType}</p>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px]"
                    >
                      {file.identifier}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {file.name ?? "No record found"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(file.amount)}
                  </p>
                  <Badge
                    className={cn(
                      "mt-1",
                      file.status === "verified"
                        ? "bg-success/10 text-success"
                        : undefined
                    )}
                    variant={
                      file.status === "verified" ? "default" : "destructive"
                    }
                  >
                    {file.status}
                  </Badge>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    {formatDate(file.date)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={file.status !== "verified"}
                  aria-label={`Download ${file.slipType}`}
                  className="shrink-0 border-border text-muted-foreground hover:border-secondary hover:bg-secondary/10 hover:text-secondary disabled:opacity-40"
                  onClick={() =>
                    toast.message({
                      title: "Download started",
                      description: `${file.slipType} for ${file.identifier} will be ready shortly.`,
                    })
                  }
                >
                  <Download className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
