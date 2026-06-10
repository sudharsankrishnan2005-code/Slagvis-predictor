"use client";

import { useEffect, useState } from "react";
import { getModel } from "@/lib/api";
import { ModelInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LatexEquation } from "@/components/latex-equation";
import { Badge } from "@/components/ui/badge";

export default function ModelPage() {
  const [model, setModel] = useState<ModelInfo | null>(null);

  useEffect(() => {
    getModel("phase_ii").then(setModel).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Information</h1>
        <p className="text-muted-foreground">
          Phase-II empirical model — theory, coefficients, and statistical basis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Phase-II Empirical Model
            <Badge>Active</Badge>
          </CardTitle>
          <CardDescription>OLS regression-based slag viscosity predictor</CardDescription>
        </CardHeader>
        <CardContent>
          {model?.equation_latex && <LatexEquation math={model.equation_latex} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coefficient Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead className="text-right">Coefficient</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {model?.coefficients &&
                Object.entries(model.coefficients).map(([variable, coef]) => (
                  <TableRow key={variable}>
                    <TableCell className="font-medium">{variable}</TableCell>
                    <TableCell className="text-right font-mono">{coef}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Network Formers</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              <strong>SiO₂</strong> and <strong>Al₂O₃</strong> act as network formers in silicate
              melts, building the polymerized silicate structure. Higher SiO₂ and Al₂O₃ content
              increases melt viscosity by strengthening the silicate network. The positive
              coefficients (+0.0333 for SiO₂, +0.0303 for Al₂O₃) reflect this behavior.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Modifiers</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              <strong>MgO</strong>, <strong>MnO</strong>, and <strong>K₂O</strong> are network
              modifiers that depolymerize the silicate structure by breaking Si-O-Si bonds.
              <strong>TiO₂</strong> can act as both former and modifier depending on composition.
              Negative coefficients for MgO and MnO indicate viscosity reduction with increasing
              modifier content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Effect</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Temperature has a strong negative effect on viscosity (coefficient −0.00263 per °C
              on log₁₀η). As temperature increases, thermal energy overcomes intermolecular forces,
              reducing viscosity exponentially. This Arrhenius-like behavior is captured in the
              log-linear formulation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistical Basis</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-3">
            <p>
              Coefficients were derived using <strong>Ordinary Least Squares (OLS) regression</strong>{" "}
              on experimental slag viscosity data, minimizing the{" "}
              <strong>Residual Sum of Squares (RSS)</strong>:
            </p>
            <LatexEquation math="RSS = \sum_{i=1}^{n} (y_i - \hat{y}_i)^2" />
            <p>
              The normal equation yields the coefficient vector:
            </p>
            <LatexEquation math="\boldsymbol{\beta} = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\mathbf{Y}" />
            <p>
              where <strong>X</strong> is the design matrix of composition and temperature
              variables, and <strong>Y</strong> is the vector of observed log₁₀(η) values.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Future Models</CardTitle>
          <CardDescription>Architecture supports additional empirical models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Phase-III", "Machin", "Riboud", "Iida", "Urbain"].map((name) => (
              <Badge key={name} variant="outline">
                {name} — Coming Soon
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
