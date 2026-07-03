"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Wraps the app so client components can call useSession().
 * Wire it in app/layout.tsx:
 *
 *   <body className={...}>
 *     <Providers>{children}</Providers>
 *   </body>
 */

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
