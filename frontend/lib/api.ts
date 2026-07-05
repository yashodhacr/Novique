import type { Article, Kind, Sort } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchFeed(sort: Sort, kind: Kind): Promise<Article[]> {
  const params = new URLSearchParams({ sort, limit: "40" });
  if (kind !== "all") params.set("kind", kind);
  const res = await fetch(`${API_URL}/api/feed?${params}`);
  if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
  return res.json();
}
