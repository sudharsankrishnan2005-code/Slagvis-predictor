export const API_BASE = "https://slagvis-predictor.onrender.com/api/v1";

export interface SlagInput {
  sio2: number;
  al2o3: number;
  mgo: number;
  mno: number;
  k2o: number;
  tio2: number;
  temperature: number;
  model_id?: string;
  save?: boolean;
}

export interface Contribution {
  variable: string;
  coefficient: number;
  input_value: number;
  contribution: number;
  unit: string;
}

export interface PredictionResult {
  model_id: string;
  model_name: string;
  log_eta: number;
  viscosity: number;
  interpretation: string;
  intercept: number;
  contributions: Contribution[];
  equation_latex: string;
  equation_plain: string;
  inputs: SlagInput;
  prediction_id?: number;
}

export interface PredictionHistoryItem {
  id: number;
  timestamp: string;
  model_id: string;
  sio2: number;
  al2o3: number;
  mgo: number;
  mno: number;
  k2o: number;
  tio2: number;
  temperature: number;
  log_eta: number;
  viscosity: number;
  interpretation: string;
}

export interface DashboardStats {
  total_predictions: number;
  average_viscosity: number;
  last_prediction: PredictionHistoryItem | null;
  recent_calculations: PredictionHistoryItem[];
}

export interface ModelInfo {
  id: string;
  name: string;
  available: boolean;
  equation_latex?: string;
  equation_plain?: string;
  coefficients?: Record<string, number>;
}

export interface BatchResultItem {
  row: number;
  sio2: number;
  al2o3: number;
  mgo: number;
  mno: number;
  k2o: number;
  tio2: number;
  temperature: number;
  log_eta: number;
  viscosity: number;
  interpretation: string;
}
