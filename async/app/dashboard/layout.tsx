import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

/**
 * Dashboard layout — second protection layer.
 * Middleware already blocks logged-out users, but we verify the
 * session server-side too. Defense in depth.
 */

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-void">
      {/* Translucent top navbar — no sidebar, as requested */}
      <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
        <nav className="glass flex w-full max-w-5xl items-center justify-between rounded-2xl px-5 py-3">
          <Link href="/dashboard" className="font-mono text-lg font-bold">
            async<span className="blink text-accent">_</span>
          </Link>

          <DashboardNav />

          <span className="hidden font-mono text-xs text-dim sm:block">
            {session.user?.email}
          </span>
        </nav>
      </header>

      {/* Push content below the floating navbar */}
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28">{children}</main>
    </div>
  );
}
