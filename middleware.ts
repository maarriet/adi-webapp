import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protección simple de /admin/*: HTTP Basic Auth contra una sola
// contraseña compartida (ADMIN_PASSWORD en .env). El campo "usuario" del
// diálogo del navegador se ignora — solo importa la contraseña. Ver
// CLAUDE.md para el porqué de esta elección sobre un formulario + cookie.
export function middleware(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return new NextResponse(
      "ADMIN_PASSWORD no está configurado en el servidor.",
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const password = decoded.split(":")[1];
    if (password === expectedPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin ADI"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
