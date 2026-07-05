"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Navbar({ searchQuery, setSearchQuery }: Props) {
  const { token, user, login, register, logout, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setIsAuthModalOpen(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthBusy(false);
    }
  };

  const navLinks = [
    { label: "Morning Brief", path: "/" },
    { label: "Signals", path: "/signals" },
    { label: "Research", path: "/research" },
    { label: "Companies", path: "/companies" },
    { label: "Models", path: "/models" },
    { label: "Learning", path: "/learning" },
    { label: "Opportunities", path: "/opportunities" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-ink/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent logo-pulse shadow-[0_0_8px_rgba(108,99,255,0.4)]"></span>
              <span className="font-display text-xl font-extrabold tracking-tight text-textPrimary">
                Noviqe
              </span>
            </Link>
            
            <nav className="hidden xl:flex items-center gap-1.5 text-[11px] font-bold text-textSecondary tracking-wider uppercase">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive ? "text-textPrimary bg-white/[0.04]" : "hover:text-textPrimary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: Ask Noviqe Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search companies, papers, models, AI trends, funding, technologies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (pathname !== "/signals" && pathname !== "/") {
                  router.push("/signals");
                }
              }}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-white/[0.05] bg-panel/85 text-xs font-semibold text-textPrimary placeholder-textSecondary/55 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3.5 flex items-center text-zinc-500 hover:text-white text-xs font-semibold">
                Clear
              </button>
            )}
          </div>

          {/* Right: Notifications, Bookmarks, Auth */}
          <div className="flex items-center gap-3">
            {/* Bookmarks Toggle */}
            {token && (
              <Link
                href="/signals"
                title="View Saved Signals"
                className="p-2 rounded-xl border border-white/[0.05] text-textSecondary hover:bg-white/[0.02]"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </Link>
            )}

            {/* Notification Badge Mock */}
            <div className="relative p-2 rounded-xl border border-white/[0.05] text-textSecondary hover:bg-white/[0.02] cursor-pointer hidden sm:block">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-tealAccent shadow-[0_0_4px_currentColor]"></span>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>

            {/* Profile Action */}
            {ready && (
              user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
                  <span className="text-xs text-textSecondary font-semibold hidden md:inline">
                    {user.email.split("@")[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4.5 py-2 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-white transition-all hover:scale-[1.02] shadow-lg shadow-accent/10"
                >
                  Sign In
                </button>
              )
            )}
          </div>

        </div>
      </header>

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-panel border border-white/[0.08] rounded-3xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsAuthModalOpen(false);
                setAuthError(null);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
              <span className="font-display text-lg font-bold text-white">Noviqe Auth</span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </h3>
            <p className="text-xs text-textSecondary mb-6">
              Access personalized briefings, bookmarks, and interest filters.
            </p>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder-zinc-500 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder-zinc-500 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
              </div>

              {authError && (
                <div className="text-xs text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/20 p-2.5 rounded-lg">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="w-full h-10 mt-2 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-white transition-all disabled:opacity-50"
              >
                {authBusy ? "Verifying..." : authMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs">
              <span className="text-zinc-500">
                {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError(null);
                }}
                className="ml-1 text-accent font-bold hover:underline"
              >
                {authMode === "login" ? "Register" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
