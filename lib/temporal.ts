/**
 * Las columnas DateTime de este contrato (Postgres `timestamp`) se leen y
 * escriben como `Temporal.PlainDateTime`, no `Date`. Node necesita el
 * polyfill global (ver `src/prisma/db.ts`) porque esta versión de Node no
 * trae `Temporal` nativo todavía. Estos helpers convierten entre
 * `Temporal.PlainDateTime` y `Date`/strings para el resto de la app.
 */
import "temporal-polyfill/full/global";

export function dateToPlainDateTime(date: Date): Temporal.PlainDateTime {
  return new Temporal.PlainDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

export function plainDateTimeToDate(pdt: Temporal.PlainDateTime): Date {
  return new Date(
    pdt.year,
    pdt.month - 1,
    pdt.day,
    pdt.hour,
    pdt.minute,
    pdt.second,
    pdt.millisecond,
  );
}

/** Parsea "YYYY-MM-DD" (de un <input type="date">) a medianoche local. */
export function dateInputToPlainDateTime(value: string): Temporal.PlainDateTime {
  const [year, month, day] = value.split("-").map(Number);
  return new Temporal.PlainDateTime(year, month, day, 0, 0, 0);
}

/**
 * Formatea como "d/m/yyyy" (estilo es-AR) a mano, sin `toLocaleDateString`:
 * ese método depende de los datos ICU del motor JS que lo ejecuta, que
 * pueden diferir levemente entre el servidor (SSR, Node) y el navegador
 * (hidratación), causando un mismatch de hidratación en React. Esta versión
 * da siempre el mismo resultado sin importar el entorno.
 */
export function formatDateAR(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function formatDate(pdt: Temporal.PlainDateTime): string {
  return formatDateAR(plainDateTimeToDate(pdt));
}

export function formatDateTime(pdt: Temporal.PlainDateTime): string {
  const date = plainDateTimeToDate(pdt);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${formatDateAR(date)}, ${hours}:${minutes}`;
}

/** Lunes 00:00:00.000 a Domingo 23:59:59.999 de la semana de `reference`. */
export function getWeekRange(reference: Date = new Date()): {
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
  startDate: Date;
  endDate: Date;
} {
  const day = reference.getDay(); // 0 = domingo ... 6 = sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const startDate = new Date(reference);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() + diffToMonday);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return {
    start: dateToPlainDateTime(startDate),
    end: dateToPlainDateTime(endDate),
    startDate,
    endDate,
  };
}
