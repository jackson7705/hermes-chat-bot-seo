"use client";

import { signOut } from "next-auth/react";

export function SignOutLink() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-xs text-slate-500 hover:text-slate-800 underline-offset-2 hover:underline"
    >
      Sign out
    </button>
  );
}
