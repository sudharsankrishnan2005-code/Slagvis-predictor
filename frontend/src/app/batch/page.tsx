"use client";

import { useState, useRef } from "react";
import { batchPredict, downloadBatchExport, triggerDownload } from "@/lib/api";
import { BatchResultItem } from "@/lib/types";
import { formatNumber, getViscosityBadgeVariant } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";

export default function BatchPage() {
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current = file;
    setLoading(true);
    setError(null);
    try {
      const res = await batchPredict(file);
      setResults(res.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    if (!fileRef.current) return;
    const blob = await downloadBatchExport(fileRef.current, format);
    triggerDownload(blob, `batch_results.${format}`);
  };

  const downloadTemplate = () => {
    const csv =
      "SiO2,Al2O3,MgO,MnO,K2O,TiO2,Temperature\n35,15,8,4,0.5,1,1500\n40,12,10,3,0.3,0.8,1450";
    const blob = new Blob([csv], { type: "text/csv" });
    triggerDownload(blob, "batch_template.csv");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Batch Prediction</h1>
        <p className="text-muted-foreground">
          Upload CSV or Excel files for bulk viscosity calculations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Data File</CardTitle>
          <CardDescription>
            Required columns: SiO2, Al2O3, MgO, MnO, K2O, TiO2, Temperature
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload CSV / Excel
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleUpload}
            />
            <Button variant="ghost" onClick={downloadTemplate}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Results ({results.length} rows)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExport("csv")}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport("xlsx")}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>SiO₂</TableHead>
                    <TableHead>Al₂O₃</TableHead>
                    <TableHead>MgO</TableHead>
                    <TableHead>MnO</TableHead>
                    <TableHead>K₂O</TableHead>
                    <TableHead>TiO₂</TableHead>
                    <TableHead>T (°C)</TableHead>
                    <TableHead>log₁₀η</TableHead>
                    <TableHead>η (Pa·s)</TableHead>
                    <TableHead>Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.row}>
                      <TableCell>{r.row}</TableCell>
                      <TableCell>{formatNumber(r.sio2, 1)}</TableCell>
                      <TableCell>{formatNumber(r.al2o3, 1)}</TableCell>
                      <TableCell>{formatNumber(r.mgo, 1)}</TableCell>
                      <TableCell>{formatNumber(r.mno, 1)}</TableCell>
                      <TableCell>{formatNumber(r.k2o, 2)}</TableCell>
                      <TableCell>{formatNumber(r.tio2, 1)}</TableCell>
                      <TableCell>{formatNumber(r.temperature, 0)}</TableCell>
                      <TableCell className="font-mono">{formatNumber(r.log_eta)}</TableCell>
                      <TableCell className="font-mono">{formatNumber(r.viscosity)}</TableCell>
                      <TableCell>
                        <Badge variant={getViscosityBadgeVariant(r.viscosity)}>
                          {r.interpretation}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
