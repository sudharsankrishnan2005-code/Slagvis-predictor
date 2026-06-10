"use client";

import { PredictionResult } from "@/lib/types";
import { formatNumber, getViscosityColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LatexEquation } from "@/components/latex-equation";
import { CalculationSteps } from "@/components/calculation-steps";
import { Button } from "@/components/ui/button";
import { Copy, Download, Printer } from "lucide-react";
import { downloadPdfFromResult, triggerDownload } from "@/lib/api";
import { useState } from "react";

interface ReportViewProps {
  result: PredictionResult;
  showActions?: boolean;
}

export function ReportView({ result, showActions = true }: ReportViewProps) {
  const [copyDone, setCopyDone] = useState(false);
  const inputs = result.inputs;

  const copyCalculation = async () => {
    const lines = [
      "Slag Viscosity Prediction Report",
      `Model: ${result.model_name}`,
      "",
      "Inputs:",
      `SiO2: ${inputs.sio2} wt.%, Al2O3: ${inputs.al2o3} wt.%, MgO: ${inputs.mgo} wt.%`,
      `MnO: ${inputs.mno} wt.%, K2O: ${inputs.k2o} wt.%, TiO2: ${inputs.tio2} wt.%`,
      `Temperature: ${inputs.temperature} °C`,
      "",
      ...result.contributions.map(
        (c) =>
          `${c.variable}: ${c.coefficient >= 0 ? "+" : ""}${c.coefficient} × ${c.input_value} = ${formatNumber(c.contribution)}`
      ),
      `Intercept: ${result.intercept}`,
      `log10(η) = ${formatNumber(result.log_eta)}`,
      `η = ${formatNumber(result.viscosity)} Pa·s`,
      `Interpretation: ${result.interpretation}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  const exportPdf = async () => {
    const payload = {
      inputs: inputs,
      model_name: result.model_name,
      equation_plain: result.equation_plain,
      intercept: result.intercept,
      contributions: result.contributions,
      log_eta: result.log_eta,
      viscosity: result.viscosity,
      interpretation: result.interpretation,
    };
    const blob = await downloadPdfFromResult(payload);
    triggerDownload(blob, "slag_viscosity_report.pdf");
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6 print:space-y-4">
      {showActions && (
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={copyCalculation}>
            <Copy className="mr-2 h-4 w-4" />
            {copyDone ? "Copied!" : "Copy Calculation"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["SiO₂", inputs.sio2, "wt.%"],
                ["Al₂O₃", inputs.al2o3, "wt.%"],
                ["MgO", inputs.mgo, "wt.%"],
                ["MnO", inputs.mno, "wt.%"],
                ["K₂O", inputs.k2o, "wt.%"],
                ["TiO₂", inputs.tio2, "wt.%"],
                ["Temperature", inputs.temperature, "°C"],
              ].map(([name, val, unit]) => (
                <TableRow key={String(name)}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(Number(val), 2)}
                  </TableCell>
                  <TableCell>{unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equation Used</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{result.model_name}</p>
          <LatexEquation math={result.equation_latex} />
        </CardContent>
      </Card>

      <CalculationSteps result={result} />

      <Card>
        <CardHeader>
          <CardTitle>Result Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">log₁₀(η)</p>
              <p className="font-mono text-2xl font-bold">{formatNumber(result.log_eta)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Viscosity (η)</p>
              <p className={`font-mono text-2xl font-bold ${getViscosityColor(result.viscosity)}`}>
                {formatNumber(result.viscosity)} Pa·s
              </p>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm text-muted-foreground">Engineering Interpretation</p>
            <Badge variant="outline" className="text-base">
              {result.interpretation}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
