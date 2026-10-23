import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  } else if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  }
  return `₹${val.toLocaleString("en-IN")}`;
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}
