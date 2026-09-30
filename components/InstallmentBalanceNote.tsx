import { centsToDecimalString, decimalToCents, formatCurrency } from "@/lib/money";

/**
 * Compara lo cobrado hasta ahora contra lo que deberían sumar las cuotas ya
 * marcadas (cuotas × monto por cuota). Como el cliente puede abonar montos
 * variables, esto puede quedar en saldo a favor (pagó de más) o en deuda
 * (todavía falta para completar esa cuota).
 */
export function InstallmentBalanceNote({
  balance,
  className = "",
}: {
  balance: string;
  className?: string;
}) {
  const cents = decimalToCents(balance);
  if (cents === 0) return null;

  const isFavor = cents > 0;
  const amount = formatCurrency(centsToDecimalString(Math.abs(cents)));

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isFavor ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      } ${className}`}
    >
      {isFavor ? `Saldo a favor: ${amount}` : `Debe ${amount} para completar la cuota`}
    </span>
  );
}
