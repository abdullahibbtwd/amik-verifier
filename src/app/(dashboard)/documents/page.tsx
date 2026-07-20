"use client";

import { useMemo, useState } from "react";
import { Clock, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { formatCurrency, formatDate } from "@/lib/mock-data";
import {
  mockSlipDocuments,
  slipFilterOptions,
  type SlipFilter,
} from "@/lib/slip-documents";

function slipBadgeClass(slipFilter: string) {
  if (slipFilter === "premium-slip") {
    return "bg-secondary/15 text-secondary";
  }
  if (slipFilter === "standard-slip") {
    return "bg-primary/10 text-primary";
  }
  return "bg-muted text-muted-foreground";
}

export default function DocumentsPage() {
  const [filter, setFilter] = useState<SlipFilter>("all");
  const toast = useToast();

  const filtered = useMemo(() => {
    if (filter === "all") return mockSlipDocuments;
    return mockSlipDocuments.filter((doc) => doc.slipFilter === filter);
  }, [filter]);

  const activeLabel =
    slipFilterOptions.find((o) => o.value === filter)?.label ?? "All slips";

  function handleDownload(title: string) {
    toast.message({
      title: "Download started",
      description: `${title} will be ready shortly.`,
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Slip documents</h1>
        <p className="text-sm text-muted-foreground">
          Downloadable NIN slips, NIN Slip, Standard Slip, and Premium Slip
          only
        </p>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as SlipFilter)}
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/50 p-1 sm:grid-cols-4">
          {slipFilterOptions.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="text-xs sm:text-sm"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{activeLabel}</CardTitle>
          <CardDescription>
            {filtered.length} slip{filtered.length === 1 ? "" : "s"} available
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No slips found for this type.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((doc) => (
                <li
                  key={doc.id}
                  className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      <FileText className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            "text-[10px]",
                            slipBadgeClass(doc.slipFilter)
                          )}
                        >
                          {doc.slipType}
                        </Badge>
                      </div>
                      <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                        {doc.identifier}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {doc.name}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        Generated {formatDate(doc.generatedAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p className="text-sm font-semibold">
                        {formatCurrency(doc.amount)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-border hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
                        onClick={() => handleDownload(doc.slipType)}
                      >
                        <Download className="size-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
