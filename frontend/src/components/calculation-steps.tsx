"use client";

import { PredictionResult } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalculationStepsProps {
  result: PredictionResult;
}

export function CalculationSteps({ result }: CalculationStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detailed Calculation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.contributions.map((c) => {
          const sign = c.coefficient >= 0 ? "+" : "−";
          const absCoef = Math.abs(c.coefficient);
          return (
            <div key={c.variable} className="rounded-md border bg-muted/30 p-4">
              <p className="mb-2 font-medium text-primary">{c.variable} Contribution</p>
              <div className="font-mono text-sm">
                <span>
                  {sign}
                  {formatNumber(absCoef, 4)} × {formatNumber(c.input_value, 2)}
                </span>
                <span className="mx-2 text-muted-foreground">=</span>
                <span className="font-semibold">{formatNumber(c.contribution)}</span>
              </div>
            </div>
          );
        })}

        <div className="rounded-md border bg-muted/30 p-4">
          <p className="mb-2 font-medium text-primary">Intercept</p>
          <p className="font-mono text-sm font-semibold">{formatNumber(result.intercept)}</p>
        </div>

        <div className="rounded-md border-2 border-primary/30 bg-primary/5 p-4">
          <p className="mb-2 font-medium">Summation</p>
          <p className="font-mono text-sm">
            log₁₀(η) = <span className="font-bold">{formatNumber(result.log_eta)}</span>
          </p>
        </div>

        <div className="rounded-md border-2 border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="mb-2 font-medium">Final Viscosity</p>
          <p className="font-mono text-sm">
            η = 10^({formatNumber(result.log_eta)}) ={" "}
            <span className="text-lg font-bold">{formatNumber(result.viscosity)} Pa·s</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
