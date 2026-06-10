"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboard } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import { formatDate, formatNumber, getViscosityBadgeVariant } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LatexEquation } from "@/components/latex-equation";
import { CompositionPieChart } from "@/components/charts";
import { Activity, Droplets, Thermometer, FlaskConical } from "lucide-react";

const PHASE_II_LATEX =
  String.raw`\log_{10}(\eta) = 1.777 + 0.0333\,\mathrm{SiO_2} + 0.0303\,\mathrm{Al_2O_3} - 0.0036\,\mathrm{MgO} - 0.0047\,\mathrm{MnO} + 0.0074\,\mathrm{K_2O} + 0.0055\,\mathrm{TiO_2} - 0.00263\,T`;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const last = stats?.last_prediction;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Slag viscosity prediction overview — Phase-II empirical model
          </p>
        </div>
        <Button asChild>
          <Link href="/predict">
            <FlaskConical className="mr-2 h-4 w-4" />
            New Prediction
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">
            Backend unavailable. Start the API server on port 8000.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total_predictions ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Viscosity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats ? `${formatNumber(stats.average_viscosity)} Pa·s` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Prediction</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {last ? `${formatNumber(last.viscosity)} Pa·s` : "—"}
            </div>
            {last && (
              <p className="text-xs text-muted-foreground">{formatDate(last.timestamp)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temperature Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">800–1800 °C</div>
            <p className="text-xs text-muted-foreground">Valid model range</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phase-II Equation</CardTitle>
            <CardDescription>Empirical OLS regression model</CardDescription>
          </CardHeader>
          <CardContent>
            <LatexEquation math={PHASE_II_LATEX} />
          </CardContent>
        </Card>

        {last && (
          <Card>
            <CardHeader>
              <CardTitle>Last Composition Distribution</CardTitle>
              <CardDescription>From most recent prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <CompositionPieChart
                sio2={last.sio2}
                al2o3={last.al2o3}
                mgo={last.mgo}
                mno={last.mno}
                k2o={last.k2o}
                tio2={last.tio2}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_calculations.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>SiO₂</TableHead>
                  <TableHead>Al₂O₃</TableHead>
                  <TableHead>T (°C)</TableHead>
                  <TableHead className="text-right">η (Pa·s)</TableHead>
                  <TableHead>Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_calculations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{formatDate(r.timestamp)}</TableCell>
                    <TableCell>{formatNumber(r.sio2, 1)}</TableCell>
                    <TableCell>{formatNumber(r.al2o3, 1)}</TableCell>
                    <TableCell>{formatNumber(r.temperature, 0)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(r.viscosity)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getViscosityBadgeVariant(r.viscosity)}>
                        {r.interpretation}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No predictions yet. Run your first calculation.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
