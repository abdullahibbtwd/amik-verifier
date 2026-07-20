"use client";

import Link from "next/link";
import { FileCheck2, Lock } from "lucide-react";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/mock-data";
import { lookupActions } from "@/lib/quick-actions";

export default function LookupHubPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Identity Lookup</h1>
        <p className="text-sm text-muted-foreground">
          Verify NIN or BVN — select a service to get started
        </p>
      </div>

      <QuickActionsGrid actions={lookupActions} columns={2} />

      <div className="grid gap-3 sm:grid-cols-2">
        {lookupActions.map((action) => (
          <Card key={action.label} className="border-border bg-card">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary/10">
                  <action.icon className="size-4 text-secondary" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <span className="text-sm font-semibold text-primary">
                From {formatCurrency(action.fromPrice!)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 size-5 shrink-0 text-secondary" />
            <p className="text-sm text-muted-foreground">
              NIN verifications are saved in your{" "}
              <Link href="/history" className="font-medium text-secondary hover:underline">
                verification history
              </Link>
              . Download slips anytime from recent files on the NIN page.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 size-5 shrink-0 text-secondary" />
            <p className="text-sm text-muted-foreground">
              BVN results are not stored in history to protect sensitive personal
              data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
