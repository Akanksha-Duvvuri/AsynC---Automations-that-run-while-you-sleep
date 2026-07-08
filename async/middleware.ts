import { withAuth } from "next-auth/middleware";

/**
 * Layer 1 of route protection — redirects logged-out users
 * away from /dashboard before the request even renders.
 */
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};