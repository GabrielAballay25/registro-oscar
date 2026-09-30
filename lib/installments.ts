import { FREQUENCY_DAYS } from "./frequency";
import type { PaymentFrequency } from "./types";

/**
 * Cuántas cuotas ya vencieron a la fecha de referencia (hoy, por defecto),
 * según `firstDueDate` y la frecuencia pactada — no según cuántos cobros se
 * marcaron. El día del primer vencimiento ya cuenta como 1 cuota vencida;
 * cada período completo (7/15/30 días) suma una más. Se limita a
 * `installmentCount`: no puede haber "vencido" más cuotas que las pactadas.
 */
export function elapsedPeriods(
  firstDueDate: Date,
  frequency: PaymentFrequency,
  installmentCount: number,
  referenceDate: Date = new Date(),
): number {
  const periodDays = FREQUENCY_DAYS[frequency];
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((referenceDate.getTime() - firstDueDate.getTime()) / msPerDay);

  if (diffDays < 0) return 0;

  const periods = Math.floor(diffDays / periodDays) + 1;
  return Math.min(Math.max(periods, 0), installmentCount);
}
