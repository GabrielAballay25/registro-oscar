const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  PARCIAL: "bg-orange-100 text-orange-800",
  COMPLETADO: "bg-emerald-100 text-emerald-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  COMPLETADO: "Completado",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-stone-100 text-stone-800";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
