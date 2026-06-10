import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 4): string {
  return value.toFixed(decimals);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function getViscosityColor(viscosity: number): string {
  if (viscosity < 0.5) return "text-emerald-600 dark:text-emerald-400";
  if (viscosity <= 1.5) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function getViscosityBadgeVariant(
  viscosity: number
): "default" | "secondary" | "destructive" {
  if (viscosity < 0.5) return "secondary";
  if (viscosity <= 1.5) return "default";
  return "destructive";
}
