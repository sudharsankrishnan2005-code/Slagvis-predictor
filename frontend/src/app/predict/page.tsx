"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { predict } from "@/lib/api";
import { SlagInput, PredictionResult } from "@/lib/types";
import { useReport } from "@/components/report-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalculationSteps } from "@/components/calculation-steps";
import {
  CompositionPieChart,
  ViscosityGauge,
  TemperatureEffectChart,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { formatNumber, getViscosityColor } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const DEFAULT_INPUT: SlagInput = {
  sio2: 35,
  al2o3: 15,
  mgo: 8,
  mno: 4,
  k2o: 0.5,
  tio2: 1,
  temperature: 1500,
  model_id: "phase_ii",
};

export default function PredictPage() {
  const [input, setInput] = useState<SlagInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setResult: setReportResult } = useReport();
  const router = useRouter();

  const update = (field: keyof SlagInput, value: string) => {
    setInput((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predict(input);
      setResult(res);
      setReportResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Single Prediction</h1>
        <p className="text-muted-foreground">
          Enter slag composition and temperature for viscosity prediction
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Composition in wt.%, temperature in °C</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    ["sio2", "SiO₂", "wt.%"],
                    ["al2o3", "Al₂O₃", "wt.%"],
                    ["mgo", "MgO", "wt.%"],
                    ["mno", "MnO", "wt.%"],
                    ["k2o", "K₂O", "wt.%"],
                    ["tio2", "TiO₂", "wt.%"],
                    ["temperature", "Temperature", "°C"],
                  ] as const
                ).map(([key, label, unit]) => (
                  <div key={key} className={key === "temperature" ? "col-span-2" : ""}>
                    <Label htmlFor={key}>
                      {label} ({unit})
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      step="any"
                      value={input[key]}
                      onChange={(e) => update(key, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label>Model</Label>
                <Select
                  value={input.model_id || "phase_ii"}
                  onValueChange={(v) => setInput((p) => ({ ...p, model_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phase_ii">Phase-II Empirical Model</SelectItem>
                    <SelectItem value="phase_iii" disabled>
                      Phase-III (Coming Soon)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Viscosity
                </Button>
                {result && (
                  <Button type="button" variant="outline" onClick={() => router.push("/report")}>
                    View Full Report
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Predicted Viscosity</p>
                <p className={`text-4xl font-bold ${getViscosityColor(result.viscosity)}`}>
                  {formatNumber(result.viscosity)} Pa·s
                </p>
                <Badge className="mt-2">{result.interpretation}</Badge>
              </div>
              <ViscosityGauge viscosity={result.viscosity} />
            </CardContent>
          </Card>
        )}
      </div>

      {result && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <CompositionPieChart
              sio2={input.sio2}
              al2o3={input.al2o3}
              mgo={input.mgo}
              mno={input.mno}
              k2o={input.k2o}
              tio2={input.tio2}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temperature Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <TemperatureEffectChart
                  baseInput={input}
                  currentTemp={input.temperature}
                />
              </CardContent>
            </Card>
          </div>
          <CalculationSteps result={result} />
        </>
      )}
    </div>
  );
}
