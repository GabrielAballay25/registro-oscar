"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (prevState, formData) => login(prevState, formData),
    null,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
    >
      {state && !state.success ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Usuario</span>
        <input
          name="username"
          required
          autoFocus
          autoComplete="username"
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-stone-600">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
