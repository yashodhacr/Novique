"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { fetchFeed } from "@/lib/api";
import * as authApi from "@/lib/auth";
import type { Kind, Sort } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
import { AuthBar } from "@/components/AuthBar";
import { useAuth } from "./auth-context";

const SORTS: { key: Sort; label: string }[] = [
  { key: "impact", label: "🔥 Top Impact" },
  { key: "trend", label: "📈 Trending" },
  { key: "recent", label: "⏱️ Latest" },
];

const KINDS: { key: Kind; label: string }[] = [
  { key: "all", label: "All Items" },
  { key: "news", label: "General News" },
  { key: "paper", label: "Research Papers" },
];

type Mode = "discover" | "foryou";

export default function Home() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [sort, setSort] = useState<Sort>("impact");
  const [kind, setKind] = useState<Kind>("all");
  const [mode, setMode] = useState<Mode>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const effectiveMode: Mode = token ? mode : "discover";

  const feedRef = useRef<HTMLDivElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const companiesRef = useRef<HTMLDivElement>(null);
  const learningRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef<HTMLDivElement>(null);

  // Feed fetching
  const { data, isLoading, isError } = useQuery({
    queryKey: ["feed", effectiveMode, sort, kind, !!token],
    queryFn: () =>
      effectiveMode === "foryou" && token
        ? authApi.fetchMyFeed(token, sort === "recent" ? "impact" : sort, kind)
        : fetchFeed(sort, kind),
  });

  // Personalization signals
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

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Client-side search filtering
  const filteredArticles = data?.filter((a) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      a.title.toLowerCase().includes(query) ||
      a.source.toLowerCase().includes(query) ||
      (a.topics ?? []).some((t) => t.toLowerCase().includes(query)) ||
      (a.summary_30s ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#040408] text-[#eef0f6] relative font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Mesh Glow Background */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/3 blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-500/3 blur-[120px] pointer-events-none" />

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#05050a]/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse"></span>
              <span className="font-plus-jakarta text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                AI PULSE
              </span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-zinc-400">
              <button onClick={() => scrollTo(briefRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Daily Brief</button>
              <button onClick={() => scrollTo(feedRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">News</button>
              <button onClick={() => scrollTo(researchRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Research</button>
              <button onClick={() => scrollTo(companiesRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Companies</button>
              <button onClick={() => scrollTo(feedRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Models</button>
              <button onClick={() => scrollTo(learningRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Learning</button>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search AI companies, models, papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-full border border-white/[0.08] bg-[#0c0c14]/60 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white text-xs font-medium">
                Clear
              </button>
            )}
          </div>

          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-4">
            {/* Bookmarks Toggle (quick navigation) */}
            {token && (
              <button
                onClick={() => setMode(mode === "foryou" ? "discover" : "foryou")}
                title={mode === "foryou" ? "Show all stories" : "Show personalized feed"}
                className={`p-2 rounded-lg border transition-all ${
                  mode === "foryou"
                    ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                    : "text-zinc-400 border-white/[0.06] hover:bg-white/[0.02]"
                }`}
              >
                <svg className="w-4.5 h-4.5" fill={mode === "foryou" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </button>
            )}

            {/* Notification Mock Icon */}
            <div className="relative p-2 rounded-lg border border-white/[0.06] text-zinc-400 hover:bg-white/[0.02] cursor-pointer hidden sm:block">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>

            {/* Profile / Login Block */}
            <div className="pl-2 border-l border-white/[0.08] flex items-center">
              <AuthBar />
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-16 md:gap-24 relative z-10">
        
        {/* HERO SECTION */}
        <section ref={briefRef} className="flex flex-col lg:flex-row items-stretch gap-10 md:gap-12 animate-fade-in">
          {/* Hero Left: Title and Prompt */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-3 bg-indigo-500/10 px-3 py-1 rounded-full w-max">
              Executive Briefing
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-plus-jakarta font-extrabold tracking-tight text-white mb-4">
              Good Morning 👋
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 font-light mb-8 max-w-lg leading-relaxed">
              Understand today's AI landscape and key actions in under 5 minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollTo(feedRef)}
                className="px-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5 transition-all hover:scale-[1.02]"
              >
                Read Today's Brief
              </button>
              <button
                onClick={() => scrollTo(feedRef)}
                className="px-6 py-3 rounded-xl font-semibold border border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Explore News
              </button>
            </div>
          </div>

          {/* Hero Right: Brief Metrics Summary Card */}
          <div className="flex-1 bg-gradient-to-br from-indigo-500/[0.04] to-purple-500/[0.04] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
            
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                Today's AI Brief
              </h2>
              <p className="text-xs text-zinc-500 mt-1">July 5, 2026 · Automated Aggregator</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0e0e16]/60 border border-white/[0.04] p-4 rounded-2xl hover:border-indigo-500/20 transition-all group">
                <span className="block text-2xl font-bold font-plus-jakarta text-white group-hover:text-indigo-400 transition-colors">6</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5 block">Important Updates</span>
              </div>
              <div className="bg-[#0e0e16]/60 border border-white/[0.04] p-4 rounded-2xl hover:border-indigo-500/20 transition-all group">
                <span className="block text-2xl font-bold font-plus-jakarta text-white group-hover:text-indigo-400 transition-colors">2</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5 block">Model Releases</span>
              </div>
              <div className="bg-[#0e0e16]/60 border border-white/[0.04] p-4 rounded-2xl hover:border-indigo-500/20 transition-all group">
                <span className="block text-2xl font-bold font-plus-jakarta text-white group-hover:text-indigo-400 transition-colors">1</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5 block">Breakthrough</span>
              </div>
              <div className="bg-[#0e0e16]/60 border border-white/[0.04] p-4 rounded-2xl hover:border-indigo-500/20 transition-all group">
                <span className="block text-2xl font-bold font-plus-jakarta text-white group-hover:text-indigo-400 transition-colors">3</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5 block">Funding Rounds</span>
              </div>
              <div className="bg-[#0e0e16]/60 border border-white/[0.04] p-4 rounded-2xl hover:border-indigo-500/20 transition-all group">
                <span className="block text-2xl font-bold font-plus-jakarta text-white group-hover:text-indigo-400 transition-colors">4</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5 block">OS Launches</span>
              </div>
              <div className="bg-[#0e0e16]/60 border border-white/[0.04] p-4 rounded-2xl hover:border-indigo-500/20 transition-all group">
                <span className="block text-2xl font-bold font-plus-jakarta text-emerald-400">92%</span>
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5 block">Trend Momentum</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 border-t border-white/[0.05] pt-4 flex items-center justify-between">
              <span>Next update in 4 minutes</span>
              <span className="text-indigo-400 font-semibold cursor-pointer hover:underline" onClick={() => scrollTo(feedRef)}>Explore Details &rarr;</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: TRENDING TOPICS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Trending Topics</h3>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4"></div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "AI Agents", trend: "+14.2%" },
              { label: "MCP", trend: "+32.6%", highlight: true },
              { label: "Coding Models", trend: "+8.4%" },
              { label: "Voice AI", trend: "+12.1%" },
              { label: "Open Source", trend: "+5.9%" },
              { label: "Robotics", trend: "+18.7%" },
            ].map((topic) => (
              <button
                key={topic.label}
                onClick={() => setSearchQuery(topic.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-300 hover:scale-[1.02] ${
                  topic.highlight
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                    : "bg-[#0b0b12] border-white/[0.05] text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <span>🔥 {topic.label}</span>
                <span className={`text-[10px] ${topic.highlight ? "text-indigo-400" : "text-zinc-500"}`}>{topic.trend}</span>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 3: WHAT SHOULD I DO? (COLORED BORDER INSIGHTS) */}
        <section className="relative rounded-3xl p-0.5 overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_20px_50px_rgba(99,102,241,0.1)]">
          <div className="bg-[#06060c] p-6 md:p-8 rounded-[22px] flex flex-col md:flex-row gap-8">
            {/* Header info */}
            <div className="md:w-1/4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 mb-2 block">
                  Actionable Strategy
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white leading-tight">
                  What Should I Do Today?
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Executive actions mapped directly to high-impact developments detected in the last 24 hours.
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-2">
                  If you are a Data Engineer
                </span>
                <p className="text-sm font-medium text-white leading-snug">
                  Integrate the newly launched Model Context Protocol (MCP) filesystem server API.
                </p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Allows direct context piping from legacy databases to Claude-enabled environments safely.
                </p>
              </div>

              <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest block mb-2">
                  If you are a Founder
                </span>
                <p className="text-sm font-medium text-white leading-snug">
                  Track Cursor IDE adoption spikes. Transition engineering licenses.
                </p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Teams migrating to Composer-driven flows report up to 30% speedups in shipping vertical integrations.
                </p>
              </div>

              <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] font-bold text-pink-300 uppercase tracking-widest block mb-2">
                  If you are an AI Engineer
                </span>
                <p className="text-sm font-medium text-white leading-snug">
                  Benchmark KANs (Kolmogorov-Arnold Networks) against your standard MLPs.
                </p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Evaluate accuracy-to-compute ratio improvements in scientific machine learning pipelines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3b: TOP STORIES (REAL-TIME FEED) */}
        <section ref={feedRef} className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Feed Column */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Feed Header / Controllers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Top Intelligence</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Scored by Impact &amp; Trend Engine</p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mode Select */}
                {token && (
                  <div className="bg-[#0b0b14] border border-white/[0.06] rounded-xl p-1 flex">
                    <button
                      onClick={() => setMode("discover")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        effectiveMode === "discover" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      Discover
                    </button>
                    <button
                      onClick={() => setMode("foryou")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        effectiveMode === "foryou" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      For You
                    </button>
                  </div>
                )}

                {/* Sort controller */}
                <div className="bg-[#0b0b14] border border-white/[0.06] rounded-xl p-1 flex">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSort(s.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        sort === s.key ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kind Filter Buttons */}
            <div className="flex items-center gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-all ${
                    kind === k.key
                      ? "border-zinc-400 bg-white/[0.04] text-white"
                      : "border-white/[0.05] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {k.label}
                </button>
              ))}
              {searchQuery && (
                <span className="ml-auto text-xs text-zinc-400 flex items-center gap-2">
                  Filtering for: <strong className="text-indigo-400">"{searchQuery}"</strong>
                  <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-white font-bold">&times;</button>
                </span>
              )}
            </div>

            {/* Articles List */}
            {isLoading && <p className="text-zinc-500 text-sm">Loading feed...</p>}
            {isError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                Could not connect to the API. Make sure the backend service is running and seeded.
              </div>
            )}

            <div className="flex flex-col gap-6">
              {filteredArticles?.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  authed={!!token}
                  bookmarked={bookmarkedIds.has(article.id)}
                  onToggleBookmark={(id) => bookmarkMut.mutate(id)}
                  followed={followed}
                  onToggleFollow={(topic) => followMut.mutate(topic)}
                />
              ))}

              {filteredArticles?.length === 0 && (
                <div className="bg-[#0b0b14] border border-white/[0.05] p-8 rounded-2xl text-center text-zinc-500 text-sm">
                  No matching briefings found. Try resetting filters or adding more stories.
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Area (Bloomberg Terminal minimalist feed) */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
            <div className="bg-[#0c0c14]/40 border border-white/[0.05] rounded-2xl p-6 backdrop-blur-md sticky top-24">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Bloomberg Style Terminal Feed
              </h4>
              <div className="flex flex-col gap-4 text-xs">
                {[
                  { time: "20:12", source: "HN", text: "Cursor Composer mode usage doubles in tech sector surveys.", momentum: "High" },
                  { time: "19:45", source: "arXiv", text: "New transformer efficiency model reduces inference cost by 20%.", momentum: "Med" },
                  { time: "18:22", source: "Reddit", text: "OpenAI signs data partnerships with three major textbook creators.", momentum: "High" },
                  { time: "17:05", source: "Reuters", text: "Anthropic CEO talks compute scaling limitations at closed meeting.", momentum: "Low" },
                ].map((item, idx) => (
                  <div key={idx} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                      <span>[{item.time}] {item.source}</span>
                      <span className={item.momentum === "High" ? "text-indigo-400 font-bold" : "text-zinc-600"}>{item.momentum}</span>
                    </div>
                    <p className="text-zinc-300 font-medium leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* SECTION 4: RESEARCH WORTH READING */}
        <section ref={researchRef} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">Academic Contributions</span>
              <h2 className="text-3xl font-bold tracking-tight text-white">Research Worth Reading</h2>
            </div>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "KAN: Kolmogorov-Arnold Networks",
                explanation: "An alternative to Multi-Layer Perceptrons (MLPs). Uses spline-based activation functions on edges rather than nodes, improving interpretability.",
                citations: "1,240 citations",
                impact: "High — Potential successor to standard MLP layers in sci-ML.",
                url: "https://arxiv.org/abs/2404.19756"
              },
              {
                title: "Model Context Protocol (MCP)",
                explanation: "Anthropic's open-source architecture connecting AI agents to environments. Standardizes data query formatting to streamline workflows.",
                citations: "128 citations",
                impact: "Critical — The backbone of developer workbench orchestration.",
                url: "https://github.com/modelcontextprotocol"
              },
              {
                title: "Attention Is All You Need",
                explanation: "The foundational paper replacing sequential architectures (RNNs) with self-attention networks, forming the basis of modern generative models.",
                citations: "112,490 citations",
                impact: "Revolutionary — Groundwork for all modern generative Large Language Models.",
                url: "https://arxiv.org/abs/1706.03762"
              }
            ].map((paper, idx) => (
              <div key={idx} className="bg-[#0a0a12]/50 border border-white/[0.05] p-6 rounded-2xl hover:border-indigo-500/20 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3">
                    <span>Paper {idx + 1}</span>
                    <span className="text-zinc-500">{paper.citations}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors leading-snug">{paper.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{paper.explanation}</p>
                </div>
                <div className="border-t border-white/[0.04] pt-4 mt-auto">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Industry Impact:</div>
                  <div className="text-xs text-zinc-300 font-semibold mb-4 leading-relaxed">{paper.impact}</div>
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-indigo-500/30 rounded-lg text-xs font-bold text-zinc-300 hover:text-white transition-all block"
                  >
                    Read Paper &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: COMPANIES TO WATCH */}
        <section ref={companiesRef} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">Corporate Index</span>
              <h2 className="text-3xl font-bold tracking-tight text-white">Companies to Watch</h2>
            </div>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "OpenAI", momentum: "9.8/10", hiring: "52 roles", launch: "GPT-4o voice streams", trend: "Bullish" },
              { name: "Anthropic", momentum: "9.9/10", hiring: "34 roles", launch: "Claude 3.5 Sonnet & MCP", trend: "Bullish" },
              { name: "Google DeepMind", momentum: "9.4/10", hiring: "88 roles", launch: "AlphaFold 3 open release", trend: "Upward" },
              { name: "Cursor", momentum: "9.7/10", hiring: "12 roles", launch: "Composer tab & Agent loops", trend: "Surging" },
              { name: "Perplexity", momentum: "9.2/10", hiring: "20 roles", launch: "Pro Search deep answers", trend: "Bullish" },
              { name: "Meta AI", momentum: "9.5/10", hiring: "41 roles", launch: "Llama 3.1 405B base weight", trend: "Steady" },
            ].map((company) => (
              <div
                key={company.name}
                className="bg-[#08080f]/40 border border-white/[0.05] p-5 rounded-2xl hover:border-indigo-500/20 hover:bg-[#0c0c14] transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{company.name}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500">
                    <span>⚡ Momentum: {company.momentum}</span>
                    <span>·</span>
                    <span>💼 {company.hiring}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-snug">Recent: {company.launch}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    {company.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: TODAY'S LEARNING */}
        <section ref={learningRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left: Featured learning card */}
          <div className="bg-[#0b0b14]/50 border border-white/[0.05] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:border-indigo-500/20 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
            
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-2">Featured Education</span>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-3">What is MCP?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Model Context Protocol (MCP) is an open standard designed to solve the context connectivity problem for LLMs. Instead of writing custom integration scripts for every database and API, MCP provides a unified API interface.
              </p>
              
              <div className="bg-indigo-500/[0.03] border-l-2 border-indigo-400 px-4 py-3 rounded-r-xl mb-6">
                <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-0.5">Why it matters:</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                  It allows LLMs and IDE workspace agents (like Cursor, Claude Desktop) to safely query and edit files directly in local sandboxes without breaking container trust structures.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert("Redirecting to the 5-Minute MCP Explanation module...")}
              className="py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-indigo-500/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all text-center"
            >
              Start 5-Minute Lesson
            </button>
          </div>

          {/* SECTION 7: WEEKLY INTELLIGENCE (REPORT CARD) */}
          <div className="bg-gradient-to-br from-indigo-950/10 via-[#0a0a12]/80 to-purple-950/10 border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:border-indigo-500/20 transition-all shadow-xl">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-2">Weekly Synthesis</span>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-5">Weekly Intelligence</h3>
              
              <div className="flex flex-col gap-3.5 mb-6 text-xs text-zinc-300">
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Top Company</span>
                  <span className="font-semibold text-white">Anthropic</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Top Research Paper</span>
                  <span className="font-semibold text-white">KAN (Kolmogorov-Arnold Networks)</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Top Rising Startup</span>
                  <span className="font-semibold text-white">Cursor (Anysphere)</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Fastest Growing Developer Skill</span>
                  <span className="font-semibold text-white">MCP Integration Development</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-zinc-500 font-medium">Biggest Funding Round</span>
                  <span className="font-semibold text-emerald-400">xAI ($6B Series B)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Downloading Weekly Intelligence PDF Executive Summary...")}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all text-center shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30"
            >
              Download PDF Executive Summary
            </button>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-8 mt-16 bg-[#040408]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; 2026 AI Pulse. Scored and summarized under the proprietary AI Pulse Engine.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Statement</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">API Endpoint Documentation</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
