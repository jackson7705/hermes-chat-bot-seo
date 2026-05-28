export { default } from "next-auth/middleware";

// Protect every page + /api/chat. Public exceptions: /api/auth (NextAuth
// handlers), /login, /_next/* assets, /favicon.
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
