"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SlipPage() {
  const [nin, setNin] = useState("12345678901");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [tier, setTier] = useState<"basic" | "premium">("basic");

  async function handleGenerate(selectedTier: "basic" | "premium") {
    setTier(selectedTier);
    setLoading(true);
    setGenerated(false);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setGenerated(true);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">NIN Slip Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate basic or premium NIN slips
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Slip type</CardTitle>
          <CardDescription>
            Basic slips include core details. Premium includes photo and QR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nin">NIN</Label>
            <Input
              id="nin"
              value={nin}
              onChange={(e) => {
                setNin(e.target.value);
                setGenerated(false);
              }}
              placeholder="12345678901"
              maxLength={11}
            />
          </div>

          <Tabs defaultValue="basic">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                Basic — ₦800
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex-1">
                Premium — ₦1,500
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-4">
              <Button
                className="w-full"
                disabled={loading}
                onClick={() => handleGenerate("basic")}
              >
                {loading && tier === "basic" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                Generate basic slip
              </Button>
            </TabsContent>
            <TabsContent value="premium" className="mt-4">
              <Button
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={loading}
                onClick={() => handleGenerate("premium")}
              >
                {loading && tier === "premium" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                Generate premium slip
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {generated && (
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Slip preview</CardTitle>
              <CardDescription>NIN: {nin}</CardDescription>
            </div>
            <Badge
              className={
                tier === "premium"
                  ? "bg-secondary/15 text-secondary"
                  : "bg-muted text-muted-foreground"
              }
            >
              {tier === "premium" ? "Premium" : "Basic"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <FileText className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Adaeze Okonkwo</p>
              <p className="text-xs text-muted-foreground">
                {tier === "premium"
                  ? "Premium slip with photo & QR code"
                  : "Basic slip with core details"}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => alert("Download will be enabled when API is connected")}
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
