/**
 * Los campos Decimal de Postgres llegan como strings (no float) para no
 * perder precisión. Estas utilidades operan en centavos (enteros) para que
 * las sumas de dinero no arrastren errores de punto flotante.
 */
import type { Numeric } from "@prisma/orm-postgres/target/codec-types";

/** Decimal(10, 2): el tipo que usan price / unitPrice / amountPaid / totalAmount. */
export type Money = Numeric<10, 2>;

/**
 * El contrato tipa las columnas Decimal como un string "brandeado" (para
 * distinguirlas de un string cualquiera). En runtime siguen siendo strings
 * comunes ("1500.00"); esta función sólo aplica el tag para el compilador
 * cuando construimos un valor a mano (formularios, sumas) en vez de leerlo
 * de la base de datos.
 */
export function toMoney(value: string): Money {
  return value as Money;
}

export function decimalToCents(value: string): number {
  const [wholeRaw, fracRaw = ""] = value.split(".");
  const sign = wholeRaw.startsWith("-") ? -1 : 1;
  const whole = wholeRaw.replace("-", "") || "0";
  const frac = (fracRaw + "00").slice(0, 2);
  return sign * (parseInt(whole, 10) * 100 + parseInt(frac, 10));
}

export function centsToDecimalString(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.round(Math.abs(cents));
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  return `${sign}${whole}.${frac.toString().padStart(2, "0")}`;
}

export function sumDecimalStrings(values: string[]): string {
  const totalCents = values.reduce((acc, v) => acc + decimalToCents(v), 0);
  return centsToDecimalString(totalCents);
}

export function multiplyDecimalByInt(value: string, factor: number): string {
  return centsToDecimalString(decimalToCents(value) * factor);
}

export function subtractDecimalStrings(a: string, b: string): string {
  return centsToDecimalString(decimalToCents(a) - decimalToCents(b));
}

export function formatCurrency(value: string): string {
  const cents = decimalToCents(value);
  const formatted = (Math.abs(cents) / 100).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cents < 0 ? "-" : ""}$${formatted}`;
}
