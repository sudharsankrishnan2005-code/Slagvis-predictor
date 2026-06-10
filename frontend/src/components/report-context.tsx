"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PredictionResult } from "@/lib/types";

interface ReportContextType {
  result: PredictionResult | null;
  setResult: (result: PredictionResult | null) => void;
}

const ReportContext = createContext<ReportContextType>({
  result: null,
  setResult: () => {},
});

export function ReportProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<PredictionResult | null>(null);
  return (
    <ReportContext.Provider value={{ result, setResult }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  return useContext(ReportContext);
}
