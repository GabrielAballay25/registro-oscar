"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie, setSessionCookie, verifyCredentials } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

export type LoginState = ActionResult<null> | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(username, password)) {
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  await setSessionCookie();
  redirect("/");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
