"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface CompositionPieProps {
  sio2: number;
  al2o3: number;
  mgo: number;
  mno: number;
  k2o: number;
  tio2: number;
}

export function CompositionPieChart({
  sio2,
  al2o3,
  mgo,
  mno,
  k2o,
  tio2,
}: CompositionPieProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const labels = ["SiO₂", "Al₂O₃", "MgO", "MnO", "K₂O", "TiO₂"];
  const values = [sio2, al2o3, mgo, mno, k2o, tio2];

  return (
    <Plot
      data={[
        {
          type: "pie",
          labels,
          values,
          hole: 0.4,
          marker: {
            colors: ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"],
          },
          textinfo: "label+percent",
          textfont: { color: isDark ? "#e2e8f0" : "#1e293b" },
        },
      ]}
      layout={{
        autosize: true,
        height: 320,
        margin: { t: 20, b: 20, l: 20, r: 20 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: isDark ? "#e2e8f0" : "#1e293b" },
        showlegend: true,
        legend: { orientation: "h", y: -0.1 },
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%" }}
      useResizeHandler
    />
  );
}

interface ViscosityGaugeProps {
  viscosity: number;
}

export function ViscosityGauge({ viscosity }: ViscosityGaugeProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const maxVisc = 3;

  return (
    <Plot
      data={[
        {
          type: "indicator",
          mode: "gauge+number",
          value: viscosity,
          number: { suffix: " Pa·s", font: { size: 24 } },
          gauge: {
            axis: { range: [0, maxVisc], tickwidth: 1 },
            bar: { color: "#2563eb" },
            steps: [
              { range: [0, 0.5], color: "#10b981" },
              { range: [0.5, 1.5], color: "#f59e0b" },
              { range: [1.5, maxVisc], color: "#ef4444" },
            ],
            threshold: {
              line: { color: "#1e3a5f", width: 4 },
              thickness: 0.75,
              value: viscosity,
            },
          },
        },
      ]}
      layout={{
        autosize: true,
        height: 280,
        margin: { t: 40, b: 20, l: 30, r: 30 },
        paper_bgcolor: "transparent",
        font: { color: isDark ? "#e2e8f0" : "#1e293b" },
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%" }}
      useResizeHandler
    />
  );
}

interface TemperatureEffectProps {
  baseInput: {
    sio2: number;
    al2o3: number;
    mgo: number;
    mno: number;
    k2o: number;
    tio2: number;
  };
  currentTemp: number;
}

/** Phase-II temperature coefficient: -0.00263 per °C on log10(eta) */
export function TemperatureEffectChart({ baseInput, currentTemp }: TemperatureEffectProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const temps = Array.from({ length: 21 }, (_, i) => 1200 + i * 30);
  const intercept = 1.777;
  const compSum =
    0.0333 * baseInput.sio2 +
    0.0303 * baseInput.al2o3 -
    0.0036 * baseInput.mgo -
    0.0047 * baseInput.mno +
    0.0074 * baseInput.k2o +
    0.0055 * baseInput.tio2;

  const viscosities = temps.map((t) => {
    const logEta = intercept + compSum - 0.00263 * t;
    return Math.pow(10, logEta);
  });

  return (
    <Plot
      data={[
        {
          x: temps,
          y: viscosities,
          type: "scatter",
          mode: "lines+markers",
          name: "η (Pa·s)",
          line: { color: "#2563eb", width: 2 },
          marker: { size: 4 },
        },
        {
          x: [currentTemp],
          y: [
            Math.pow(10, intercept + compSum - 0.00263 * currentTemp),
          ],
          type: "scatter",
          mode: "markers",
          name: "Current",
          marker: { color: "#ef4444", size: 12, symbol: "star" },
        },
      ]}
      layout={{
        autosize: true,
        height: 320,
        xaxis: { title: { text: "Temperature (°C)" }, gridcolor: isDark ? "#334155" : "#e2e8f0" },
        yaxis: {
          title: { text: "Viscosity (Pa·s)" },
          type: "log",
          gridcolor: isDark ? "#334155" : "#e2e8f0",
        },
        margin: { t: 30, b: 50, l: 60, r: 20 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { color: isDark ? "#e2e8f0" : "#1e293b" },
        legend: { orientation: "h", y: 1.15 },
      }}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: "100%" }}
      useResizeHandler
    />
  );
}
