"use client";

import { useActionState } from "react";
import { closeCurrentWeek } from "@/actions/payments";
import type { ActionResult, ClosureRecord } from "@/lib/types";

type State = ActionResult<ClosureRecord> | null;

export function CloseWeekButton() {
  const [state, dispatch, isPending] = useActionState<State, void>(async () => {
    return closeCurrentWeek();
  }, null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => dispatch()}
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending ? "Cerrando..." : "Cerrar semana"}
      </button>
      {state && !state.success ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? (
        <p className="text-sm text-green-600">Semana cerrada correctamente.</p>
      ) : null}
    </div>
  );
}
