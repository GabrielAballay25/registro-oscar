import type { PaymentFrequency } from "./types";

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  SEMANAL: "Semanal",
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
};

export const FREQUENCY_DAYS: Record<PaymentFrequency, number> = {
  SEMANAL: 7,
  QUINCENAL: 15,
  MENSUAL: 30,
};
