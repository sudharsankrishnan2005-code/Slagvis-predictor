import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beaker } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Beaker className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SlagVis Predictor</h1>
          <p className="text-muted-foreground">Version 1.0.0 — Research & Publication Tool</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          <p>
            <strong>SlagVis Predictor</strong> is a professional web application for predicting
            the viscosity of metallurgical slags using empirical models. Designed for research
            work and publication purposes, it provides transparent step-by-step calculations,
            detailed engineering reports, and batch processing capabilities.
          </p>
          <p>
            The current release implements the <strong>Phase-II empirical model</strong>, an
            OLS regression-based equation relating slag composition and temperature to viscosity
            in Pa·s.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Tailwind CSS",
              "Shadcn UI",
              "FastAPI",
              "Python",
              "SQLite",
              "ReportLab",
              "Plotly",
              "KaTeX",
            ].map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Viscosity Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <Badge variant="secondary">Low viscosity slag</Badge> — η &lt; 0.5 Pa·s
          </p>
          <p>
            <Badge>Medium viscosity slag</Badge> — 0.5 ≤ η ≤ 1.5 Pa·s
          </p>
          <p>
            <Badge variant="destructive">High viscosity slag</Badge> — η &gt; 1.5 Pa·s
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Citation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            When using SlagVis Predictor in publications, please cite the Phase-II empirical
            model and acknowledge the software tool.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
