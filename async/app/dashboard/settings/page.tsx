"use client";

import { useSession, signOut } from "next-auth/react";

/**
 * Settings — account info + danger zone.
 * Password change and account deletion are UI-ready with TODOs —
 * wire the API routes when you get to them (small, good practice tasks).
 */

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-sm text-accent">$ vim ~/.config</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">settings</h1>
      </div>

      {/* Account */}
      <div className="glass rounded-xl px-6 py-6">
        <h2 className="font-mono text-sm text-white/70">account</h2>
        <div className="mt-4 space-y-3 font-mono text-sm">
          <div className="flex justify-between border-b border-white/5 pb-3">
            <span className="text-dim">email</span>
            <span className="text-white/85">{session?.user?.email ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dim">name</span>
            <span className="text-white/85">{session?.user?.name ?? "not set"}</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass rounded-xl px-6 py-6">
        <h2 className="font-mono text-sm text-white/70">security</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-sm text-white/85">change password</p>
            <p className="mt-0.5 font-mono text-xs text-dim">
              {/* TODO: build /api/account/password — verify old, hash new */}
              coming soon
            </p>
          </div>
          <button
            disabled
            className="rounded-lg border border-white/10 px-4 py-2 font-mono text-xs text-white/30"
          >
            update
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-xl border-red-500/20 px-6 py-6">
        <h2 className="font-mono text-sm text-red-400/80">danger zone</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-white/85">sign out everywhere</p>
              <p className="mt-0.5 font-mono text-xs text-dim">
                ends this session and returns to the landing page
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg border border-white/10 px-4 py-2 font-mono text-xs text-white/60 transition-colors hover:border-red-400/40 hover:text-red-400"
            >
              exit
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div>
              <p className="font-mono text-sm text-white/85">rm -rf account</p>
              <p className="mt-0.5 font-mono text-xs text-dim">
                {/* TODO: build /api/account/delete — cascade wipes credentials + flows */}
                deletes your account, keys, and flows permanently — coming soon
              </p>
            </div>
            <button
              disabled
              className="rounded-lg border border-red-500/20 px-4 py-2 font-mono text-xs text-red-400/40"
            >
              delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
