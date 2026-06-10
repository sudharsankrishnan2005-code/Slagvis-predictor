import {
  API_BASE,
  BatchResultItem,
  DashboardStats,
  ModelInfo,
  PredictionHistoryItem,
  PredictionResult,
  SlagInput,
} from "./types";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API request failed");
  }
  return res.json();
}

export async function predict(data: SlagInput): Promise<PredictionResult> {
  return fetchApi<PredictionResult>("/predict", {
    method: "POST",
    body: JSON.stringify({ model_id: "phase_ii", save: true, ...data }),
  });
}

export async function getDashboard(): Promise<DashboardStats> {
  return fetchApi<DashboardStats>("/dashboard");
}

export async function getHistory(search?: string): Promise<PredictionHistoryItem[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return fetchApi<PredictionHistoryItem[]>(`/history${q}`);
}

export async function getModels(): Promise<ModelInfo[]> {
  return fetchApi<ModelInfo[]>("/models");
}

export async function getModel(id: string): Promise<ModelInfo> {
  return fetchApi<ModelInfo>(`/models/${id}`);
}

export async function batchPredict(file: File, modelId = "phase_ii"): Promise<{
  count: number;
  results: BatchResultItem[];
}> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/predict/batch?model_id=${modelId}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Batch prediction failed");
  return res.json();
}

export async function downloadBatchExport(
  file: File,
  format: "csv" | "xlsx",
  modelId = "phase_ii"
): Promise<Blob> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${API_BASE}/predict/batch/export?model_id=${modelId}&format=${format}`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

export async function downloadPdf(data: SlagInput): Promise<Blob> {
  const res = await fetch(`${API_BASE}/report/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id: "phase_ii", save: false, ...data }),
  });
  if (!res.ok) throw new Error("PDF generation failed");
  return res.blob();
}

export async function downloadPdfFromResult(payload: Record<string, unknown>): Promise<Blob> {
  const res = await fetch(`${API_BASE}/report/pdf/from-result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("PDF generation failed");
  return res.blob();
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
