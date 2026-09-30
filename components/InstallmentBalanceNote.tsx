import { centsToDecimalString, decimalToCents, formatCurrency } from "@/lib/money";

/**
 * Compara lo cobrado hasta ahora contra lo que deberían sumar las cuotas ya
 * VENCIDAS según el calendario (firstDueDate + frecuencia), no contra el
 * total de la venta ni contra la cantidad de cobros marcados. Como el
 * cliente puede abonar montos variables, esto puede quedar en saldo a favor
 * (pagó de más para lo que va del calendario) o en deuda (todavía falta
 * para estar al día con la cuota correspondiente).
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
