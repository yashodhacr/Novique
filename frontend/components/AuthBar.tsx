"use client";

import { useState } from "react";
import { useAuth } from "@/app/auth-context";

export function AuthBar() {
  const { user, ready, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted">
          Signed in as <span className="text-zinc-200">{user.email}</span>
        </span>
        <button
          onClick={logout}
          className="rounded-md border border-edge px-2.5 py-1 text-xs text-muted hover:border-zinc-500"
        >
          Sign out
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        required
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-40 rounded-md border border-edge bg-panel px-2 py-1 text-sm outline-none focus:border-accent"
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="password (8+)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-36 rounded-md border border-edge bg-panel px-2 py-1 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-md border border-accent bg-accent/10 px-3 py-1 text-sm text-accent disabled:opacity-50"
      >
        {mode === "login" ? "Sign in" : "Sign up"}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        className="text-xs text-muted underline-offset-2 hover:underline"
      >
        {mode === "login" ? "Create account" : "Have an account?"}
      </button>
      {error && <span className="text-xs text-negative">{error}</span>}
    </form>
  );
}
