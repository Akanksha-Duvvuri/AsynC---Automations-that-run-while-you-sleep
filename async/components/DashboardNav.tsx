"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

/**
 * DashboardNav — client component so we can highlight the
 * active route and call signOut().
 */

const links = [
  { label: "home", href: "/dashboard" },
  { label: "integrations", href: "/dashboard/integrations" },
  { label: "flows", href: "/dashboard/flows" },
  { label: "settings", href: "/dashboard/settings" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-5 font-mono text-sm">
      {links.map((l) => {
        const active =
          l.href === "/dashboard"
            ? pathname === l.href
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              active
                ? "text-accent"
                : "text-white/55 transition-colors hover:text-white"
            }
          >
            {l.label}
          </Link>
        );
      })}

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-white/40 transition-colors hover:text-red-400"
        title="logout"
      >
        exit
      </button>
    </div>
  );
}
