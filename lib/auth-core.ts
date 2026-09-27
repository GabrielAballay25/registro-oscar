/**
 * Lógica de sesión sin dependencias de Next (usable tanto desde `proxy.ts`,
 * que recibe cookies crudas de `NextRequest`, como desde `lib/auth.ts`, que
 * las lee vía `next/headers`). Nada de "server-only" ni `next/headers` acá
 * para que ambos contextos puedan importarlo sin fricción.
 */
import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "ro_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Falta configurar la variable de entorno AUTH_SECRET.");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionCookieValue(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  if (!timingSafeEqualStrings(sign(payload), signature)) return false;

  try {
    const data: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      typeof data === "object" &&
      data !== null &&
      "exp" in data &&
      typeof (data as { exp: unknown }).exp === "number" &&
      (data as { exp: number }).exp > Date.now()
    );
  } catch {
    return false;
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return false;
  return (
    timingSafeEqualStrings(username, expectedUser) &&
    timingSafeEqualStrings(password, expectedPass)
  );
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
