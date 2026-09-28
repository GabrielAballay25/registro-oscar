import type { ComponentType } from "react";

export function PageHeader({
  title,
  subtitle,
  Icon,
}: {
  title: string;
  subtitle: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <header className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
    </header>
  );
}
