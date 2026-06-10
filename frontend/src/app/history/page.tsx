"use client";

import { useEffect, useState } from "react";
import { getHistory, downloadPdf, triggerDownload } from "@/lib/api";
import { PredictionHistoryItem } from "@/lib/types";
import { formatDate, formatNumber, getViscosityBadgeVariant } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Search, Download } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = (q?: string) => {
    setLoading(true);
    getHistory(q)
      .then(setHistory)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = () => load(search || undefined);

  const exportPdf = async (item: PredictionHistoryItem) => {
    const blob = await downloadPdf({
      sio2: item.sio2,
      al2o3: item.al2o3,
      mgo: item.mgo,
      mno: item.mno,
      k2o: item.k2o,
      tio2: item.tio2,
      temperature: item.temperature,
      model_id: item.model_id,
      save: false,
    });
    triggerDownload(blob, `report_${item.id}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">Stored prediction records with search and PDF export</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by interpretation (e.g. Low, Medium, High)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : history.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
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
                    <TableHead>PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatDate(h.timestamp)}
                      </TableCell>
                      <TableCell>{formatNumber(h.sio2, 1)}</TableCell>
                      <TableCell>{formatNumber(h.al2o3, 1)}</TableCell>
                      <TableCell>{formatNumber(h.mgo, 1)}</TableCell>
                      <TableCell>{formatNumber(h.mno, 1)}</TableCell>
                      <TableCell>{formatNumber(h.k2o, 2)}</TableCell>
                      <TableCell>{formatNumber(h.tio2, 1)}</TableCell>
                      <TableCell>{formatNumber(h.temperature, 0)}</TableCell>
                      <TableCell className="font-mono">{formatNumber(h.log_eta)}</TableCell>
                      <TableCell className="font-mono">{formatNumber(h.viscosity)}</TableCell>
                      <TableCell>
                        <Badge variant={getViscosityBadgeVariant(h.viscosity)}>
                          {h.interpretation}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => exportPdf(h)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No predictions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
