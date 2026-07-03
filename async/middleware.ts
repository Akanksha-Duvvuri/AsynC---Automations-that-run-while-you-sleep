export { default } from "next-auth/middleware";

/**
 * First layer of route protection (same three-layer pattern as Bluprynt):
 * 1. this middleware — redirects logged-out users away from /dashboard
 * 2. the dashboard layout — server-side session check
 * 3. every API route — getServerSession check
 */

export const config = {
  matcher: ["/dashboard/:path*"],
};
