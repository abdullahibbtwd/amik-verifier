import { Clock, FileText, IdCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  mockVerifications,
} from "@/lib/mock-data";

const historyRecords = mockVerifications.filter((v) => v.type !== "BVN");

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Verification history</h1>
        <p className="text-sm text-muted-foreground">
          NIN lookups and slip generation records
        </p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All verifications</CardTitle>
          <CardDescription>{historyRecords.length} total records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {historyRecords.map((record) => (
              <li
                key={record.id}
                className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      record.status === "verified"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {record.type.includes("Slip") ? (
                      <FileText className="size-4" />
                    ) : (
                      <IdCard className="size-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{record.type}</p>
                      {"tier" in record && record.tier === "premium" && (
                        <Badge className="bg-secondary/15 text-secondary text-[10px]">
                          Premium
                        </Badge>
                      )}
                      <Badge
                        variant={
                          record.status === "verified"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          record.status === "verified"
                            ? "bg-success/10 text-success"
                            : undefined
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>

                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {record.identifier}
                    </p>

                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {record.name ?? "No name returned"}
                    </p>

                    <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:hidden">
                      <Clock className="size-3" />
                      {formatDate(record.date)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(record.cost)}
                    </p>
                    <p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">
                      {formatDate(record.date)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
