"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  FileCheck2,
  FileWarning,
  Loader2,
  Lock,
  Search,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { formatCurrency } from "@/lib/mock-data";
import { bvnLookupOptions, mockBvnLookupResult } from "@/lib/bvn-options";

type ResultState = "idle" | "loading" | "success" | "failure";

export default function BvnLookupPage() {
  const [identifier, setIdentifier] = useState("");
  const [lookupType, setLookupType] = useState(bvnLookupOptions[0].value);
  const [state, setState] = useState<ResultState>("idle");

  const selectedOption = useMemo(
    () => bvnLookupOptions.find((option) => option.value === lookupType),
    [lookupType]
  );

  const isSlip = lookupType === "generate-slip";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (identifier.length !== 11) return;

    setState("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setState(identifier === "22987654321" ? "success" : "failure");
  }

  const successData =
    state === "success"
      ? isSlip
        ? mockBvnLookupResult.success.generateSlip
        : mockBvnLookupResult.success.viewDetails
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Verify BVN</h1>
        <p className="text-sm text-muted-foreground">
          Select a verification type, enter the BVN, and run a secure lookup
        </p>
      </div>

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary/10">
              <CreditCard className="size-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base">BVN verification</CardTitle>
              <CardDescription>
                11-digit Bank Verification Number
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <OptionSelect
              label="Verification type"
              hint="Choose to view details only or generate a full BVN slip"
              options={bvnLookupOptions}
              value={lookupType}
              onChange={(value) => {
                setLookupType(value);
                setState("idle");
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="bvn">BVN number</Label>
              <Input
                id="bvn"
                inputMode="numeric"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value.replace(/\D/g, "").slice(0, 11));
                  setState("idle");
                }}
                placeholder="Enter 11-digit BVN"
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

            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3">
              <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                BVN data is sensitive. Results are shown once and not stored in
                your history to protect personal information.
              </p>
            </div>

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
                  {isSlip ? "Generate BVN Slip" : "View Details"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {state === "success" && successData && !isSlip && (
        <Alert className="border-success/30 bg-success/5">
          <FileCheck2 className="size-4 text-success" />
          <AlertTitle className="text-success">Verification successful</AlertTitle>
          <AlertDescription>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Full name</dt>
              <dd className="font-medium">{successData.fullName}</dd>
              <dt className="text-muted-foreground">Bank</dt>
              <dd>{successData.bank}</dd>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{successData.phone}</dd>
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd>{successData.dateOfBirth}</dd>
            </dl>
          </AlertDescription>
        </Alert>
      )}

      {state === "success" && isSlip && (
        <Alert className="border-success/30 bg-success/5">
          <FileCheck2 className="size-4 text-success" />
          <AlertTitle className="text-success">BVN slip generated</AlertTitle>
          <AlertDescription>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Full name</dt>
              <dd className="font-medium">
                {mockBvnLookupResult.success.generateSlip.fullName}
              </dd>
              <dt className="text-muted-foreground">Bank</dt>
              <dd>{mockBvnLookupResult.success.generateSlip.bank}</dd>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{mockBvnLookupResult.success.generateSlip.phone}</dd>
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd>{mockBvnLookupResult.success.generateSlip.dateOfBirth}</dd>
              <dt className="text-muted-foreground">BVN</dt>
              <dd className="font-mono">
                {mockBvnLookupResult.success.generateSlip.bvn}
              </dd>
              <dt className="text-muted-foreground">Account status</dt>
              <dd>{mockBvnLookupResult.success.generateSlip.accountStatus}</dd>
              <dt className="text-muted-foreground col-span-2">
                Enrollment branch
              </dt>
              <dd className="col-span-2">
                {mockBvnLookupResult.success.generateSlip.enrollmentBranch}
              </dd>
            </dl>
          </AlertDescription>
        </Alert>
      )}

      {state === "failure" && (
        <Alert variant="destructive">
          <FileWarning className="size-4" />
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>
            {mockBvnLookupResult.failure.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
