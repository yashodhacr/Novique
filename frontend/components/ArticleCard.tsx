import type { Article } from "@/lib/types";
import { useState } from "react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Generate high-quality, role-specific insights dynamically from article topics & text
function getActionableInsights(article: Article) {
  const topics = (article.topics ?? []).map((t) => t.toLowerCase());
  const title = article.title.toLowerCase();

  let dev = "Evaluate integration points for this technology in your current dev stack.";
  let founder = "Assess if this shifts the competitive dynamics in your market segment.";
  let investor = "Monitor adoption rate of this technology to evaluate funding readiness.";

  if (topics.some((t) => t.includes("agent") || t.includes("mcp"))) {
    dev = "Build a custom MCP server to hook your internal databases and APIs into Claude or Cursor.";
    founder = "Design agentic workflows to automate high-friction operational tasks in your startup.";
    investor = "Back infrastructure startups enabling secure, interoperable agent-to-agent transactions.";
  } else if (topics.some((t) => t.includes("model") || t.includes("llm") || t.includes("open source"))) {
    dev = "Benchmark this model locally to see if it can replace expensive cloud API calls.";
    founder = "Evaluate if this open model allows you to offer cheaper, faster user features.";
    investor = "Review if the commoditization of models impacts the pricing power of your portfolio.";
  } else if (topics.some((t) => t.includes("funding") || t.includes("startup") || t.includes("acquisition"))) {
    dev = "Analyze their engineering stack and architecture to learn how they scaled.";
    founder = "Examine their pricing tiers and messaging to capture underserved customer cohorts.";
    investor = "Examine the round size and valuation multiples to benchmark target deals.";
  } else if (topics.some((t) => t.includes("robotics") || t.includes("hardware"))) {
    dev = "Check open simulation platforms like Isaac Sim to write control logic for this hardware.";
    founder = "Identify manual logistical or sorting bottlenecks that can leverage this automation.";
    investor = "Invest in the software control layer which holds higher margins than raw hardware.";
  } else if (topics.some((t) => t.includes("voice") || t.includes("audio") || t.includes("speech"))) {
    dev = "Integrate low-latency WebSocket audio streams to design highly responsive voice nodes.";
    founder = "Introduce next-gen voice interfaces to lower bounce rates on your landing page.";
    investor = "Track emerging demand for voice watermarking and anti-deepfake security products.";
  } else if (article.kind === "paper") {
    dev = "Examine the reference implementation on GitHub; check for efficiency gains in inference.";
    founder = "Look past the academic jargon to build a practical product wrapper around this method.";
    investor = "Identify the research labs behind this paper to spot spin-off commercialization opportunities.";
  }

  return { dev, founder, investor };
}

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
  const [copied, setCopied] = useState(false);
  const insights = getActionableInsights(article);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(article.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color ranges for scores
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    if (score >= 45) return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  };

  return (
    <article className="group relative rounded-2xl border border-white/[0.05] bg-[#0c0c14]/40 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-[#0c0c14]/80 hover:shadow-[0_12px_30px_rgba(99,102,241,0.06)]">
      {/* Top Section: Badges & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Badge */}
          <span className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
            {article.kind === "paper" ? "📑 arXiv" : `🔥 ${article.source}`}
          </span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs text-zinc-500">{timeAgo(article.published_at)}</span>
          
          {/* Topic Badges */}
          <div className="flex flex-wrap items-center gap-1.5 ml-2">
            {(article.topics ?? []).map((t) => {
              const isFollowed = followed?.has(t.toLowerCase());
              if (authed && onToggleFollow) {
                return (
                  <button
                    key={t}
                    onClick={() => onToggleFollow(t)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all duration-200 ${
                      isFollowed
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:border-indigo-500/30 hover:text-zinc-300"
                    }`}
                  >
                    {isFollowed ? "✓ " : "+ "}
                    {t}
                  </button>
                );
              }
              return (
                <span
                  key={t}
                  className="rounded-full border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                >
                  {t}
                </span>
              );
            })}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {authed && (
            <button
              onClick={() => onToggleBookmark?.(article.id)}
              title={bookmarked ? "Unsave Brief" : "Save Brief"}
              className={`p-2 rounded-lg transition-colors border ${
                bookmarked
                  ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5"
                  : "text-zinc-400 border-transparent hover:border-white/[0.08] hover:bg-white/[0.03]"
              }`}
            >
              <svg className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          )}

          <button
            onClick={handleShare}
            title="Copy URL"
            className="p-2 rounded-lg transition-colors border text-zinc-400 border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] flex items-center gap-1"
          >
            {copied ? (
              <span className="text-[10px] text-indigo-400 font-semibold px-1">Copied!</span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l5.57 3.285m-5.57-3.285l5.57-3.285m0 0a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186zm0-2.186L12 14.83m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold tracking-tight text-white mb-2.5 leading-snug group-hover:text-indigo-300 transition-colors">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {article.title}
        </a>
      </h3>

      {/* 30-Second Summary */}
      {article.summary_30s && (
        <p className="text-sm leading-relaxed text-zinc-300 mb-4 font-normal">
          {article.summary_30s}
        </p>
      )}

      {/* Why it Matters (Highlighted Container) */}
      {article.why_it_matters && (
        <div className="bg-indigo-500/[0.03] border-l-2 border-indigo-500/80 px-4 py-3.5 rounded-r-xl mb-5">
          <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">
            Why it Matters
          </span>
          <p className="text-sm leading-relaxed text-zinc-300 font-medium">
            {article.why_it_matters}
          </p>
        </div>
      )}

      {/* Actionable Insights Grid */}
      <div className="mt-5 border-t border-white/[0.06] pt-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
            Actionable Insights
          </span>
          <div className="h-[1px] bg-white/[0.06] flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Developer Insight */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-xl transition-all hover:bg-white/[0.03] hover:border-white/[0.08]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                Developers
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              {insights.dev}
            </p>
          </div>

          {/* Founder Insight */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-xl transition-all hover:bg-white/[0.03] hover:border-white/[0.08]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Founders
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              {insights.founder}
            </p>
          </div>

          {/* Investor Insight */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-xl transition-all hover:bg-white/[0.03] hover:border-white/[0.08]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                Investors
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              {insights.investor}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Metrics & CTA */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
        {/* Scores */}
        <div className="flex items-center gap-3">
          {/* Impact Score */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getScoreColor(article.impact_score)}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span>Impact: {article.impact_score.toFixed(0)}</span>
          </div>

          {/* Trend Score */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getScoreColor(article.trend_score)}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            <span>Trend: {article.trend_score.toFixed(0)}</span>
          </div>

          {/* Engagement details */}
          <span className="text-xs text-zinc-500">
            {article.kind === "paper"
              ? `📑 ${article.citation_count} citations`
              : `▲ ${article.points} points · 💬 ${article.num_comments} comments`}
          </span>
        </div>

        {/* Read Original button */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Read Original
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </article>
  );
}
