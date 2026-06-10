"use client";

import Link from "next/link";
import { useReport } from "@/components/report-context";
import { ReportView } from "@/components/report-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportPage() {
  const { result } = useReport();

  if (!result) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calculation Report</h1>
          <p className="text-muted-foreground">Professional engineering report for publication</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <p className="text-muted-foreground">No calculation available. Run a prediction first.</p>
            <Button asChild>
              <Link href="/predict">Go to Single Prediction</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calculation Report</h1>
        <p className="text-muted-foreground">
          Slag Viscosity Prediction Report — {result.model_name}
        </p>
      </div>
      <ReportView result={result} />
    </div>
  );
}
