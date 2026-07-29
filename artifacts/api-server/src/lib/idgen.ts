import { randomUUID } from "crypto";

export const genId = () => randomUUID();

export function calcEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) * 100) / 100;
}

export function appNumber(): string {
  return `APP-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

export function loanNumber(): string {
  return `LN-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}
