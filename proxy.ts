import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isValidSessionValue } from "@/lib/auth-core";

export function proxy(request: NextRequest) {
  const isLoggedIn = isValidSessionValue(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Todo menos /login, assets estáticos y archivos de metadata.
    "/((?!login|_next/static|_next/image|favicon.ico).*)",
  ],
};
