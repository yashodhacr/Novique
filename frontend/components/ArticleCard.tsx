import type { Article } from "@/lib/types";
import { useState } from "react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Tailored Noviqe role-specific recommended actions
function getRecommendedActions(article: Article) {
  const topics = (article.topics ?? []).map((t) => t.toLowerCase());
  const title = article.title.toLowerCase();

  let engineer = "Analyze code repositories or documentation for implementation patterns of this technology.";
  let founder = "Look at integration opportunities to enhance user workflows and team productivity.";
  let researcher = "Track how this theoretical contribution or tool performs under standard benchmarks.";

  if (topics.some((t) => t.includes("agent") || t.includes("mcp"))) {
    engineer = "Build a custom MCP server to securely expose local databases or dev environments to Cursor/Claude.";
    founder = "Identify business workflows where autonomous agents can eliminate high-friction manual data entry.";
    researcher = "Study tool-calling architectures and planning mechanisms to reduce recursive loop hallucination.";
  } else if (topics.some((t) => t.includes("model") || t.includes("llm") || t.includes("open source"))) {
    engineer = "Benchmark local inference models against hosted cloud APIs. Test performance in GGUF/llama.cpp format.";
    founder = "Evaluate replacing premium proprietary APIs with fine-tuned open-source alternatives to increase margins.";
    researcher = "Compare the architecture alterations (activation functions, attention heads) against base models.";
  } else if (topics.some((t) => t.includes("funding") || t.includes("startup") || t.includes("acquisition"))) {
    engineer = "Analyze their technical stack, API latency, and scale challenges; monitor hiring portals.";
    founder = "Examine their product differentiation and pricing strategy to target gaps in their offerings.";
    researcher = "Identify commercial applications of theoretical frameworks driving venture funding.";
  } else if (topics.some((t) => t.includes("robotics") || t.includes("hardware"))) {
    engineer = "Explore ROS2, Isaac Sim, and web controllers for interfacing hardware pipelines with remote agents.";
    founder = "Evaluate automating physical warehousing, packaging, or manual tasks using vision-guided robots.";
    researcher = "Analyze vision-language-action (VLA) models and their transfer learning limits in real-world environments.";
  } else if (topics.some((t) => t.includes("voice") || t.includes("audio") || t.includes("speech"))) {
    engineer = "Implement low-latency WebSocket connections for real-time speech-to-speech pipelines.";
    founder = "Deploy voice agents to intercept inbound leads or handle simple customer support queries.";
    researcher = "Investigate acoustic feature extraction and watermarking to prevent voice forgery.";
  } else if (article.kind === "paper") {
    engineer = "Examine the reference implementation on GitHub; check for efficiency gains in inference.";
    founder = "Determine if this theoretical improvement can be turned into a commercial model wrapper.";
    researcher = "Identify the university labs and researchers behind this paper for potential incubator spin-offs.";
  }

  return { engineer, founder, researcher };
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
  const actions = getRecommendedActions(article);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(article.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine category badge icon
  const getCategoryBadge = () => {
    const topics = (article.topics ?? []).map((t) => t.toLowerCase());
    if (article.kind === "paper") return "📚 Research Paper";
    if (topics.some((t) => t.includes("agent"))) return "🤖 AI Agents";
    if (topics.some((t) => t.includes("mcp"))) return "⚡ MCP";
    if (topics.some((t) => t.includes("model"))) return "🧠 LLMs / Models";
    if (topics.some((t) => t.includes("robot"))) return "🦾 Robotics";
    if (topics.some((t) => t.includes("voice") || t.includes("audio"))) return "🎙️ Voice AI";
    if (topics.some((t) => t.includes("funding") || t.includes("startup"))) return "🚀 Startups";
    return "💡 General AI";
  };

  return (
    <article className="group relative rounded-3xl border border-white/[0.06] bg-[#0F101A] p-7 md:p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#8B5CF6]/30 hover:bg-[#0F101A]/90 hover:shadow-[0_16px_36px_rgba(139,92,246,0.06)]">
      
      {/* Top Header: Category, Source & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Badge */}
          <span className="inline-flex items-center rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-3.5 py-1 text-xs font-semibold text-[#C084FC]">
            {getCategoryBadge()}
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-xs font-medium text-zinc-400">{article.source}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-xs text-zinc-500">{timeAgo(article.published_at)}</span>

          {/* Topic Pills */}
          <div className="flex flex-wrap items-center gap-1.5 ml-2">
            {(article.topics ?? []).map((t) => {
              const isFollowed = followed?.has(t.toLowerCase());
              if (authed && onToggleFollow) {
                return (
                  <button
                    key={t}
                    onClick={() => onToggleFollow(t)}
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide transition-all ${
                      isFollowed
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/20 text-[#C084FC]"
                        : "border-white/[0.04] bg-white/[0.02] text-zinc-400 hover:border-[#8B5CF6]/30 hover:text-zinc-300"
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
                  className="rounded-full border border-white/[0.04] bg-white/[0.02] px-2.5 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wide"
                >
                  {t}
                </span>
              );
            })}
          </div>
        </div>

        {/* Action Buttons (Bookmark & Share) */}
        <div className="flex items-center gap-1.5">
          {authed && (
            <button
              onClick={() => onToggleBookmark?.(article.id)}
              title={bookmarked ? "Remove Bookmark" : "Bookmark Brief"}
              className={`p-2 rounded-xl transition-all border ${
                bookmarked
                  ? "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10"
                  : "text-zinc-400 border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]"
              }`}
            >
              <svg className="w-4.5 h-4.5" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          )}

          <button
            onClick={handleShare}
            title="Share Brief URL"
            className="p-2 rounded-xl transition-all border text-zinc-400 border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] flex items-center gap-1"
          >
            {copied ? (
              <span className="text-[10px] text-[#22D3EE] font-bold px-1">Copied!</span>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l5.57 3.285m-5.57-3.285l5.57-3.285m0 0a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186zm0-2.186L12 14.83m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Middle: Title */}
      <h3 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-[#F8FAFC] mb-3 leading-snug group-hover:text-[#C084FC] transition-colors">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {article.title}
        </a>
      </h3>

      {/* 30-Second Summary */}
      {article.summary_30s && (
        <p className="text-sm md:text-base leading-relaxed text-[#94A3B8] mb-5 font-normal">
          {article.summary_30s}
        </p>
      )}

      {/* Why it Matters (Highlighted Container) */}
      {article.why_it_matters && (
        <div className="bg-[#8B5CF6]/[0.03] border-l-2 border-[#8B5CF6] px-5 py-4 rounded-r-2xl mb-6">
          <span className="block text-[10px] font-bold text-[#C084FC] uppercase tracking-widest mb-1.5">
            Why it Matters
          </span>
          <p className="text-sm md:text-[15px] leading-relaxed text-[#F8FAFC] font-medium">
            {article.why_it_matters}
          </p>
        </div>
      )}

      {/* Recommended Action Grid (Visually Distinct Container) */}
      <div className="mt-6 border-t border-white/[0.06] pt-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
            Recommended Action
          </span>
          <div className="h-[1px] bg-white/[0.06] flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Software Engineer */}
          <div className="bg-[#161A2A]/40 border border-white/[0.04] p-4 rounded-2xl transition-all hover:bg-[#161A2A]/80 hover:border-[#8B5CF6]/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
              <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-wider">
                Software Engineers
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">
              {actions.engineer}
            </p>
          </div>

          {/* Founder */}
          <div className="bg-[#161A2A]/40 border border-white/[0.04] p-4 rounded-2xl transition-all hover:bg-[#161A2A]/80 hover:border-[#8B5CF6]/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]"></span>
              <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider">
                Founders
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">
              {actions.founder}
            </p>
          </div>

          {/* AI Researcher */}
          <div className="bg-[#161A2A]/40 border border-white/[0.04] p-4 rounded-2xl transition-all hover:bg-[#161A2A]/80 hover:border-[#8B5CF6]/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
              <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider">
                AI Researchers
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed font-normal">
              {actions.researcher}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Scores & Original Link */}
      <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Impact Score Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-xs font-semibold text-[#C084FC]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span>Impact: {article.impact_score.toFixed(0)}</span>
          </div>

          {/* Trend Score Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/5 text-xs font-semibold text-[#22D3EE]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            <span>Trend: {article.trend_score.toFixed(0)}</span>
          </div>

          {/* Stats fallback */}
          <span className="text-xs text-zinc-500 font-medium">
            {article.kind === "paper"
              ? `📑 ${article.citation_count} citations`
              : `▲ ${article.points} · 💬 ${article.num_comments}`}
          </span>
        </div>

        {/* Read Original button */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#8B5CF6] hover:text-[#C084FC] transition-colors"
        >
          Read Original
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </a>
      </div>
    </article>
  );
}
