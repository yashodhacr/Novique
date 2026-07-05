import type { Article } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const sentimentColor: Record<string, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-muted",
};

interface Props {
  article: Article;
  authed?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: (id: number) => void;
  followed?: Set<string>;
  onToggleFollow?: (topic: string) => void;
}

export function ArticleCard({
  article,
  authed = false,
  bookmarked = false,
  onToggleBookmark,
  followed,
  onToggleFollow,
}: Props) {
  return (
    <article className="group rounded-xl border border-edge bg-panel p-5 transition-colors hover:border-accent/50">
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-2">
          <ScoreBadge label="Impact" value={article.impact_score} />
          <ScoreBadge label="Trend" value={article.trend_score} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted">
            {article.kind === "paper" && (
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                Paper
              </span>
            )}
            <span>{article.source}</span>
            {article.domain && <span>· {article.domain}</span>}
            <span>· {timeAgo(article.published_at)}</span>
            {article.sentiment && (
              <span className={sentimentColor[article.sentiment] ?? "text-muted"}>
                · {article.sentiment}
              </span>
            )}
            {authed && (
              <button
                onClick={() => onToggleBookmark?.(article.id)}
                title={bookmarked ? "Remove bookmark" : "Save"}
                className={`ml-auto text-base leading-none ${
                  bookmarked ? "text-accent" : "text-muted hover:text-zinc-300"
                }`}
              >
                {bookmarked ? "★" : "☆"}
              </button>
            )}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold leading-snug text-white group-hover:text-accent"
          >
            {article.title}
          </a>

          {article.summary_30s && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {article.summary_30s}
            </p>
          )}

          {article.why_it_matters && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              <span className="font-medium text-zinc-300">Why it matters: </span>
              {article.why_it_matters}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(article.topics ?? []).map((t) => {
              const isFollowed = followed?.has(t.toLowerCase());
              if (authed && onToggleFollow) {
                return (
                  <button
                    key={t}
                    onClick={() => onToggleFollow(t)}
                    title={isFollowed ? "Unfollow topic" : "Follow topic"}
                    className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                      isFollowed
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-edge text-muted hover:border-accent/40"
                    }`}
                  >
                    {isFollowed ? "✓ " : ""}
                    {t}
                  </button>
                );
              }
              return (
                <span
                  key={t}
                  className="rounded-full border border-edge px-2 py-0.5 text-[11px] text-muted"
                >
                  {t}
                </span>
              );
            })}
            <span className="ml-auto text-xs text-muted">
              {article.kind === "paper"
                ? `📑 ${article.citation_count} citations`
                : `▲ ${article.points} · 💬 ${article.num_comments}`}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
