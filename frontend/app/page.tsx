"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchFeed } from "@/lib/api";
import * as authApi from "@/lib/auth";
import type { Kind, Sort } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
import { AuthBar } from "@/components/AuthBar";
import { useAuth } from "./auth-context";

const SORTS: { key: Sort; label: string }[] = [
  { key: "impact", label: "Top Impact" },
  { key: "trend", label: "Trending" },
  { key: "recent", label: "Latest" },
];

const KINDS: { key: Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "news", label: "News" },
  { key: "paper", label: "Research" },
];

type Mode = "discover" | "foryou";

export default function Home() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [sort, setSort] = useState<Sort>("impact");
  const [kind, setKind] = useState<Kind>("all");
  const [mode, setMode] = useState<Mode>("discover");
  const effectiveMode: Mode = token ? mode : "discover";

  // Feed (Discover = public, For You = personalized).
  const { data, isLoading, isError } = useQuery({
    queryKey: ["feed", effectiveMode, sort, kind, !!token],
    queryFn: () =>
      effectiveMode === "foryou" && token
        ? authApi.fetchMyFeed(token, sort === "recent" ? "impact" : sort, kind)
        : fetchFeed(sort, kind),
  });

  // Personalization signals (only when signed in).
  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks", !!token],
    queryFn: () => authApi.getBookmarks(token!),
    enabled: !!token,
  });
  const { data: interests } = useQuery({
    queryKey: ["interests", !!token],
    queryFn: () => authApi.getInterests(token!),
    enabled: !!token,
  });

  const bookmarkedIds = new Set((bookmarks ?? []).map((a) => a.id));
  const followed = new Set((interests ?? []).map((t) => t.toLowerCase()));

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["feed"] });
    qc.invalidateQueries({ queryKey: ["bookmarks"] });
    qc.invalidateQueries({ queryKey: ["interests"] });
  };

  const bookmarkMut = useMutation({
    mutationFn: (id: number) =>
      bookmarkedIds.has(id)
        ? authApi.removeBookmark(token!, id)
        : authApi.addBookmark(token!, id),
    onSuccess: refresh,
  });
  const followMut = useMutation({
    mutationFn: (topic: string) =>
      followed.has(topic.toLowerCase())
        ? authApi.removeInterest(token!, topic)
        : authApi.addInterest(token!, topic),
    onSuccess: refresh,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Pulse <span className="text-accent">●</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Real-time AI intelligence — aggregated, summarized, and scored by the
            proprietary Impact &amp; Trend engine.
          </p>
        </div>
        <AuthBar />
      </header>

      {/* Discover / For You */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setMode("discover")}
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            effectiveMode === "discover"
              ? "border-accent bg-accent/10 text-accent"
              : "border-edge text-muted hover:border-accent/40"
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setMode("foryou")}
          disabled={!token}
          title={token ? "" : "Sign in to personalize"}
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-40 ${
            effectiveMode === "foryou"
              ? "border-accent bg-accent/10 text-accent"
              : "border-edge text-muted hover:border-accent/40"
          }`}
        >
          For You
        </button>
      </div>

      {/* Sort */}
      <div className="mb-3 flex gap-2">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              sort === s.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-edge text-muted hover:border-accent/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Kind */}
      <div className="mb-6 flex gap-2">
        {KINDS.map((k) => (
          <button
            key={k.key}
            onClick={() => setKind(k.key)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              kind === k.key
                ? "border-zinc-400 bg-zinc-700/30 text-zinc-200"
                : "border-edge text-muted hover:border-zinc-500"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {effectiveMode === "foryou" && (
        <p className="mb-4 text-xs text-muted">
          Ranked for you by the topics you follow and the articles you save. Tap a
          topic tag to follow it, or ★ to save.
        </p>
      )}

      {isLoading && <p className="text-muted">Loading feed…</p>}
      {isError && (
        <p className="text-negative">
          Could not reach the API. Is the backend running and seeded?
        </p>
      )}

      <div className="flex flex-col gap-4">
        {data?.map((a) => (
          <ArticleCard
            key={a.id}
            article={a}
            authed={!!token}
            bookmarked={bookmarkedIds.has(a.id)}
            onToggleBookmark={(id) => bookmarkMut.mutate(id)}
            followed={followed}
            onToggleFollow={(t) => followMut.mutate(t)}
          />
        ))}
        {data?.length === 0 && (
          <p className="text-muted">
            No articles yet. Run an ingestion cycle: <code>POST /api/ingest</code>.
          </p>
        )}
      </div>
    </main>
  );
}
