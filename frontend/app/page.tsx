"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { fetchFeed } from "@/lib/api";
import * as authApi from "@/lib/auth";
import type { Kind, Sort } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
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
  const { token, user, login, register, logout, ready } = useAuth();
  const qc = useQueryClient();
  const [sort, setSort] = useState<Sort>("impact");
  const [kind, setKind] = useState<Kind>("all");
  const [mode, setMode] = useState<Mode>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const effectiveMode: Mode = token ? mode : "discover";

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Brief Countdown Timer State (5 minutes loop)
  const [secondsLeft, setSecondsLeft] = useState(300);

  // References for scrolling
  const feedRef = useRef<HTMLDivElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const companiesRef = useRef<HTMLDivElement>(null);
  const modelsRef = useRef<HTMLDivElement>(null);
  const learningRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef<HTMLDivElement>(null);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Feed Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["feed", effectiveMode, sort, kind, !!token],
    queryFn: () =>
      effectiveMode === "foryou" && token
        ? authApi.fetchMyFeed(token, sort === "recent" ? "impact" : sort, kind)
        : fetchFeed(sort, kind),
  });

  // Personalization Queries
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

  // Handle Auth Modal Submission
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
    <div className="min-h-screen bg-[#070711] text-[#F8FAFC] relative font-sans selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* Mesh Glow Background */}
      <div className="absolute top-0 left-0 right-0 h-[700px] bg-gradient-to-b from-[#8B5CF6]/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[12%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-[#8B5CF6]/4 blur-[130px] pointer-events-none" />
      <div className="absolute top-[38%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-[#22D3EE]/3 blur-[130px] pointer-events-none" />

      {/* TOP STICKY NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#070711]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] logo-pulse"></span>
              <span className="font-display text-xl font-extrabold tracking-tight text-[#F8FAFC]">
                Noviqe
              </span>
            </div>
            
            <nav className="hidden xl:flex items-center gap-2 text-xs font-semibold text-[#94A3B8] tracking-wide uppercase">
              <button onClick={() => scrollTo(briefRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Morning Brief</button>
              <button onClick={() => scrollTo(feedRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Signals</button>
              <button onClick={() => scrollTo(researchRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Research</button>
              <button onClick={() => scrollTo(companiesRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Companies</button>
              <button onClick={() => scrollTo(modelsRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Models</button>
              <button onClick={() => scrollTo(learningRef)} className="px-3 py-1.5 rounded-md hover:text-white transition-colors">Learning</button>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-lg relative hidden md:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search companies, models, papers, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-white/[0.06] bg-[#121625]/80 text-sm text-white placeholder-[#94A3B8]/50 outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3.5 flex items-center text-zinc-500 hover:text-white text-xs font-semibold">
                Clear
              </button>
            )}
          </div>

          {/* Right: User actions */}
          <div className="flex items-center gap-3">
            {/* Bookmarked Filter Button */}
            {token && (
              <button
                onClick={() => setMode(mode === "foryou" ? "discover" : "foryou")}
                title={mode === "foryou" ? "Discover Feed" : "Personalized Feed"}
                className={`p-2 rounded-xl border transition-all ${
                  mode === "foryou"
                    ? "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10"
                    : "text-zinc-400 border-white/[0.06] hover:bg-white/[0.02]"
                }`}
              >
                <svg className="w-4.5 h-4.5" fill={mode === "foryou" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </button>
            )}

            {/* Notification Badge Mock */}
            <div className="relative p-2 rounded-xl border border-white/[0.06] text-zinc-400 hover:bg-white/[0.02] cursor-pointer hidden sm:block">
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_4px_#22D3EE]"></span>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>

            {/* Authentication Action */}
            {ready && (
              user ? (
                <div className="flex items-center gap-3.5 pl-3 border-l border-white/[0.08]">
                  <span className="text-xs text-[#94A3B8] font-semibold hidden md:inline">
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
                  className="px-4.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] text-xs font-bold text-white transition-all hover:scale-[1.02] shadow-lg shadow-[#8B5CF6]/10"
                >
                  Sign In
                </button>
              )
            )}
          </div>

        </div>
      </header>

      {/* NOVIQE CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-16 md:gap-24 relative z-10">
        
        {/* HERO SECTION */}
        <section ref={briefRef} className="flex flex-col lg:flex-row items-stretch gap-10 md:gap-14 animate-fade-in">
          
          {/* Hero Left: Message & Actions */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22D3EE] mb-4 bg-[#22D3EE]/10 px-3.5 py-1 rounded-full w-max">
              Noviqe · AI Intelligence Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6.5xl font-display font-extrabold tracking-tight text-white mb-4 leading-[1.1]">
              Good Morning 👋
            </h1>
            <p className="text-lg md:text-xl text-[#F8FAFC] font-light mb-4">
              Understand today's AI landscape in under 5 minutes.
            </p>
            <p className="text-sm text-[#94A3B8] font-normal leading-relaxed mb-8 max-w-lg">
              The fastest way for engineers, founders, investors and AI professionals to understand what happened, why it matters and what action to take.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollTo(feedRef)}
                className="px-6 py-3 rounded-xl font-bold bg-[#8B5CF6] hover:bg-[#7c4dff] text-white transition-all hover:scale-[1.02] shadow-lg shadow-[#8B5CF6]/20"
              >
                Read Today's Brief
              </button>
              <button
                onClick={() => scrollTo(feedRef)}
                className="px-6 py-3 rounded-xl font-bold border border-white/[0.08] bg-white/[0.02] text-[#94A3B8] hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Explore Signals
              </button>
            </div>
          </div>

          {/* Hero Right: Today's AI Brief Card */}
          <div className="flex-1 bg-[#121625] border border-white/[0.06] rounded-3xl p-7 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_24px_55px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399] animate-pulse"></span>
                Today's AI Brief Card
              </h2>
              <span className="text-[10px] font-bold text-[#94A3B8] bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded uppercase tracking-wider">LIVE STATUS</span>
            </div>

            {/* List of briefs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
              {[
                { count: "6", label: "Major Updates" },
                { count: "2", label: "Model Launches" },
                { count: "1", label: "Breakthroughs" },
                { count: "3", label: "Funding Rounds" },
                { count: "4", label: "OS Launches" },
              ].map((item, idx) => (
                <div key={idx} className="bg-[#0C0F18]/50 border border-white/[0.04] p-4 rounded-2xl transition-all hover:border-[#8B5CF6]/30">
                  <span className="block text-2xl font-display font-extrabold text-white">{item.count}</span>
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5 block">{item.label}</span>
                </div>
              ))}
              
              {/* Trend Momentum Block */}
              <div className="bg-[#0C0F18]/50 border border-[#8B5CF6]/20 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-wider">Momentum</span>
                  <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
                  </svg>
                </div>
                <span className="text-xl font-display font-extrabold text-[#34D399] mt-1">94.8%</span>
              </div>
            </div>

            {/* Countdown bar */}
            <div className="text-[11px] text-[#94A3B8] border-t border-white/[0.05] pt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#22D3EE]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Next refresh in <strong className="text-white font-mono">{formatTime(secondsLeft)}</strong>
              </span>
              <span className="text-[#8B5CF6] font-bold cursor-pointer hover:underline" onClick={() => scrollTo(feedRef)}>Review details &rarr;</span>
            </div>
          </div>
        </section>

        {/* SIGNATURE FEATURE: AI INSIGHT OF THE DAY */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">AI Insight of the Day</span>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4"></div>
          </div>

          <div className="bg-[#121625] border-2 border-[#8B5CF6]/30 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col lg:flex-row gap-8 shadow-[0_20px_50px_rgba(139,92,246,0.08)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/3 rounded-full blur-3xl pointer-events-none" />
            
            {/* Left Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-0.5 rounded-full">
                    AI Insight
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                    High Confidence
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white mb-4">
                  Open-source coding models are improving faster than proprietary alternatives this week.
                </h3>
                
                <p className="text-sm md:text-base leading-relaxed text-[#94A3B8] mb-6 font-normal">
                  The acceleration of the Model Context Protocol (MCP) marks a major shift from centralized server model calls to localized context-directed agents. Developer IDE integrations (specifically Cursor and Claude Desktop) are driving massive adoption rates. Enterprises are beginning to deploy custom MCP servers rather than custom API orchestrators.
                </p>
              </div>

              {/* Grid detail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-white/[0.06] pt-5">
                <div>
                  <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-wider block mb-1">Why it matters</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    This commoditizes generic API wrappers and shifts value to private context and local data connections.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block mb-1">Who it impacts</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    Founders building wrappers lose pricing power; Engineers gain 30% speed; IT gains direct local data auditability.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider block mb-1">Recommended Action</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    Begin building custom private MCP servers for your internal database schemas rather than writing custom REST APIs.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Confidence Score Dial */}
            <div className="w-full lg:w-[240px] flex flex-col items-center justify-center border-l lg:border-l border-white/[0.06] pl-0 lg:pl-8 pt-6 lg:pt-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-4 block">Confidence Score</span>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#8B5CF6"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="263.89"
                    strokeDashoffset="10.55" // 96% confidence
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-display font-black text-white">96%</span>
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Assured</span>
                </div>
              </div>

              <span className="text-xs text-[#94A3B8] font-semibold text-center mt-4">
                Based on cross-source validation consensus
              </span>
            </div>

          </div>
        </section>

        {/* NEW FEATURE: AI OPPORTUNITY OF THE DAY */}
        <section className="relative rounded-3xl p-0.5 overflow-hidden bg-gradient-to-r from-[#8B5CF6] via-[#22D3EE] to-[#34D399] shadow-[0_20px_50px_rgba(139,92,246,0.1)]">
          <div className="bg-[#0C0F18] p-6 md:p-8 rounded-[22px] flex flex-col md:flex-row gap-8 justify-between">
            {/* Left */}
            <div className="md:w-1/3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22D3EE] mb-2 block">
                  AI Opportunity of the Day
                </span>
                <h3 className="text-2xl font-plus-jakarta font-extrabold tracking-tight text-white leading-tight">
                  Skill worth learning today
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed">
                Aggressive market search signals identifying technical proficiencies rising in enterprise demand.
              </p>
            </div>

            {/* Middle */}
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-widest block mb-1">Skill</span>
                <p className="text-base font-bold text-white">Model Context Protocol (MCP)</p>
                
                <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest block mb-1 mt-4">Reason</span>
                <p className="text-xs text-zinc-300">Mentions in enterprise developer postings increased 38% this week.</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest block mb-1">Adopters</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["Anthropic", "OpenAI", "Microsoft"].map((adopter) => (
                    <span key={adopter} className="text-[10px] font-semibold text-white bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
                      {adopter}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Est. Time</span>
                    <span className="text-xs font-semibold text-white">20 minutes</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Career Impact</span>
                    <span className="text-xs font-semibold text-[#34D399]">High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right CTA */}
            <div className="md:w-1/6 flex items-center justify-end">
              <button
                onClick={() => alert("Loading MCP quick-lesson module...")}
                className="w-full md:w-auto px-5 py-3 rounded-xl font-bold bg-[#8B5CF6] hover:bg-[#7c4dff] text-white transition-all text-xs text-center"
              >
                Start Learning
              </button>
            </div>

          </div>
        </section>

        {/* SECTION 2: MARKET SIGNALS (pills) */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Market Signals</h3>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4"></div>
          </div>
          
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 -my-2">
            {[
              { icon: "🤖", label: "AI Agents", trend: "+14.2%" },
              { icon: "⚡", label: "MCP", trend: "+32.6%", highlight: true },
              { icon: "💻", label: "Coding Models", trend: "+8.4%" },
              { icon: "🎙", label: "Voice AI", trend: "+5.9%" },
              { icon: "🦾", label: "Robotics", trend: "+18.7%" },
              { icon: "🧠", label: "Reasoning Models", trend: "+24.1%" },
              { icon: "🏢", label: "Enterprise AI", trend: "+9.3%" },
            ].map((topic) => (
              <button
                key={topic.label}
                onClick={() => setSearchQuery(topic.label)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold transition-all shrink-0 hover:scale-[1.02] ${
                  topic.highlight
                    ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#C084FC]"
                    : "bg-[#121625] border-white/[0.06] text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <span>{topic.icon} {topic.label}</span>
                <span className={`text-[10px] font-semibold ${topic.highlight ? "text-[#C084FC]" : "text-zinc-500"}`}>
                  {topic.trend}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* SIGNAL FEED SPLIT LAYOUT (FEED + SIDEBAR) */}
        <section ref={feedRef} className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Feed Left Column */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Feed Header / Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Signal Feed</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Scored by Noviqe proprietary engines</p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Personalization Selector */}
                {token && (
                  <div className="bg-[#121625] border border-white/[0.06] rounded-xl p-1 flex">
                    <button
                      onClick={() => setMode("discover")}
                      className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        effectiveMode === "discover" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      Discover
                    </button>
                    <button
                      onClick={() => setMode("foryou")}
                      className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        effectiveMode === "foryou" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      For You
                    </button>
                  </div>
                )}

                {/* Sort selector */}
                <div className="bg-[#121625] border border-white/[0.06] rounded-xl p-1 flex">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSort(s.key)}
                      className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        sort === s.key ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kind Pill Selectors */}
            <div className="flex items-center gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
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
                  Query: <strong className="text-[#C084FC]">"{searchQuery}"</strong>
                  <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-white font-bold">&times;</button>
                </span>
              )}
            </div>

            {/* Articles List */}
            {isLoading && <p className="text-zinc-500 text-sm">Synchronizing intelligence feed...</p>}
            {isError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                Noviqe Engine connection failure. Verify the API container is running and seeded.
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
                <div className="bg-[#121625] border border-white/[0.06] p-10 rounded-3xl text-center text-[#94A3B8] text-sm">
                  No briefings match your current active filters.
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
            
            {/* Sidebar Block 1: What's Happening */}
            <div className="bg-[#121625] border border-white/[0.06] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                What's Happening
              </h4>
              <div className="flex flex-col gap-4 text-xs font-normal">
                {[
                  { title: "Cursor Composer mode usage doubles in tech sector surveys.", velocity: "+22.4%" },
                  { title: "Meta leaks Llama 4 roadmap highlighting massive context window bounds.", velocity: "+18.1%" },
                  { title: "Standardizing MCP integrations receives support from tech leaders.", velocity: "+34.9%" },
                  { title: "Startup funding index spikes in robotics and physical automation.", velocity: "+12.2%" },
                ].map((item, idx) => (
                  <div key={idx} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <p className="text-zinc-300 font-semibold leading-relaxed hover:text-[#C084FC] cursor-pointer" onClick={() => setSearchQuery(item.title.substring(0, 10))}>
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                      <span>Ref #{idx + 104}</span>
                      <span className="text-[#34D399] font-bold">{item.velocity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Block 2: Top Contributors */}
            <div className="bg-[#121625] border border-white/[0.06] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                Top Contributors
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Hacker News Aggregator", articles: "24 articles today" },
                  { name: "arXiv Computer Science", articles: "18 papers today" },
                  { name: "Reddit AI Researchers", articles: "12 briefs today" },
                ].map((contrib, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="block font-bold text-zinc-200">{contrib.name}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">{contrib.articles}</span>
                    </div>
                    <span className="text-[#8B5CF6] text-[10px] font-bold">Active</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Block 3: Quick Links */}
            <div className="bg-[#121625] border border-white/[0.06] rounded-3xl p-6 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: "GitHub Trending", url: "https://github.com/trending" },
                  { name: "Product Hunt", url: "https://producthunt.com" },
                  { name: "Hugging Face", url: "https://huggingface.co" },
                  { name: "arXiv Research", url: "https://arxiv.org" },
                ].map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-[#0C0F18]/60 hover:bg-[#0C0F18] border border-white/[0.04] hover:border-[#8B5CF6]/30 rounded-xl font-semibold text-center text-zinc-300 hover:text-white transition-all"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 4: RESEARCH INTELLIGENCE */}
        <section ref={researchRef} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8B5CF6] block mb-1">Academic Contributions</span>
              <h2 className="text-3xl font-plus-jakarta font-extrabold tracking-tight text-white">Research Intelligence</h2>
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
                confidence: "98% Confidence",
                url: "https://arxiv.org/abs/2404.19756"
              },
              {
                title: "Model Context Protocol (MCP)",
                explanation: "Anthropic's open-source architecture connecting AI agents to environments. Standardizes data query formatting to streamline workflows.",
                citations: "128 citations",
                impact: "Critical — The backbone of developer workbench orchestration.",
                confidence: "96% Confidence",
                url: "https://github.com/modelcontextprotocol"
              },
              {
                title: "Attention Is All You Need",
                explanation: "The foundational paper replacing sequential architectures (RNNs) with self-attention networks, forming the basis of modern generative models.",
                citations: "112,490 citations",
                impact: "Revolutionary — Groundwork for all modern generative Large Language Models.",
                confidence: "100% Confidence",
                url: "https://arxiv.org/abs/1706.03762"
              }
            ].map((paper, idx) => (
              <div key={idx} className="bg-[#121625] border border-white/[0.06] p-6 rounded-3xl hover:border-[#8B5CF6]/30 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#C084FC] uppercase tracking-widest mb-4">
                    <span>{paper.confidence}</span>
                    <span className="text-zinc-500 font-semibold">{paper.citations}</span>
                  </div>
                  <h4 className="text-lg font-display font-extrabold text-white mb-2 group-hover:text-[#C084FC] transition-colors leading-snug">{paper.title}</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{paper.explanation}</p>
                </div>
                <div className="border-t border-white/[0.04] pt-4 mt-auto">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Industry Impact:</div>
                  <div className="text-xs text-zinc-300 font-semibold mb-4 leading-relaxed">{paper.impact}</div>
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 bg-[#0C0F18]/60 hover:bg-[#0C0F18] border border-white/[0.04] hover:border-[#8B5CF6]/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all block"
                  >
                    Read Paper &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: COMPANY WATCHLIST */}
        <section ref={companiesRef} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22D3EE] block mb-1">Corporate Tracker</span>
              <h2 className="text-3xl font-plus-jakarta font-extrabold tracking-tight text-white">Company Watchlist</h2>
            </div>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "OpenAI", momentum: "9.8/10", launch: "GPT-4o realtime API", hiring: "Accelerating", funding: "$6.6B raised", news: "Signed key news partnerships", focus: "General Intelligence" },
              { name: "Anthropic", momentum: "9.9/10", launch: "Claude 3.5 Sonnet & MCP", hiring: "High demand", funding: "$4B from Amazon", news: "Leading developer protocol standard", focus: "Safety & Agentic Workspaces" },
              { name: "Google DeepMind", momentum: "9.4/10", launch: "AlphaFold 3 code release", hiring: "Selective", funding: "Alphabet backed", news: "Focusing on science & biology integrations", focus: "Scientific & Foundational Models" },
              { name: "Meta AI", momentum: "9.5/10", launch: "Llama 3.1 405B base", hiring: "Steady", funding: "Meta backed", news: "Committed to open source releases", focus: "Open Access Systems" },
              { name: "Mistral", momentum: "8.9/10", launch: "Codestral 22B coder", hiring: "Moderate", funding: "$640M raised", news: "Strengthening EU partnerships", focus: "Efficient Edge Models" },
              { name: "Cursor", momentum: "9.7/10", launch: "Composer tab & loops", hiring: "Rapid", funding: "$30M Series A", news: "Surpassing traditional editor shares", focus: "AI Developer Tooling" },
            ].map((company) => (
              <div
                key={company.name}
                className="bg-[#121625] border border-white/[0.06] p-5 rounded-3xl hover:border-[#8B5CF6]/30 hover:bg-[#121625]/80 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#C084FC] transition-colors">{company.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-semibold">
                      <span>⚡ Momentum: {company.momentum}</span>
                      <span>·</span>
                      <span>💼 Hiring: {company.hiring}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {company.funding}
                  </span>
                </div>
                <div className="border-t border-white/[0.04] pt-3 text-[11px]">
                  <span className="text-zinc-500 block">AI Focus: <strong className="text-zinc-300 font-medium">{company.focus}</strong></span>
                  <span className="text-zinc-500 block mt-0.5">Latest: <strong className="text-zinc-300 font-medium">{company.launch}</strong></span>
                  <span className="text-zinc-500 block mt-0.5">Updates: <strong className="text-zinc-400 font-normal">{company.news}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: MODEL INTELLIGENCE (NEW MODELS SECTION) */}
        <section ref={modelsRef} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8B5CF6] block mb-1">Model Tracker</span>
              <h2 className="text-3xl font-plus-jakarta font-extrabold tracking-tight text-white">Model Intelligence</h2>
            </div>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Claude 3.5 Sonnet",
                maker: "Anthropic",
                version: "v3.5 Sonnet (June 2026)",
                capabilities: "State-of-the-art coding, logical reasoning, multi-step instruction compliance.",
                adoption: "Surging (+42% developer deployment)",
                community: "Bullish (Preferred for Cursor/copilots)",
                performance: "Top scoring on SWE-bench and human-eval logic tests."
              },
              {
                name: "GPT-4o",
                maker: "OpenAI",
                version: "gpt-4o-realtime (May 2026)",
                capabilities: "Low-latency voice/audio processing, real-time multimodal token streams.",
                adoption: "Stable (+18% production volume)",
                community: "High (Broad consumer & API base)",
                performance: "Leading response speeds and speech token synthesis quality."
              },
              {
                name: "Llama 3.1 405B",
                maker: "Meta AI",
                version: "3.1-405B-Instruct",
                capabilities: "Local fine-tuning, synthetic data generation generation pipelines, self-hosting.",
                adoption: "Surging (+31% enterprise local installations)",
                community: "Exponential open-weights ecosystem",
                performance: "Beats proprietary baselines when fine-tuned on custom domains."
              }
            ].map((model, idx) => (
              <div key={idx} className="bg-[#121625] border border-white/[0.06] p-6 rounded-3xl hover:border-[#8B5CF6]/30 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#C084FC] uppercase tracking-widest mb-3">
                    <span>{model.maker}</span>
                    <span className="text-zinc-500 font-semibold">{model.version}</span>
                  </div>
                  <h4 className="text-lg font-display font-extrabold text-white mb-2 group-hover:text-[#C084FC] transition-colors">{model.name}</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{model.capabilities}</p>
                </div>
                <div className="border-t border-white/[0.04] pt-4 mt-auto text-xs flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Adoption Trend:</span>
                    <span className="font-semibold text-white">{model.adoption}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Community Growth:</span>
                    <span className="font-semibold text-white">{model.community}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Performance:</span>
                    <span className="font-semibold text-[#34D399] text-right">{model.performance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: LEARN WHAT'S NEXT */}
        <section ref={learningRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Featured learning card */}
          <div className="bg-[#121625] border border-white/[0.06] rounded-3xl p-7 md:p-8 flex flex-col justify-between hover:border-[#8B5CF6]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/4 rounded-full blur-xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8B5CF6] bg-[#8B5CF6]/10 px-3.5 py-0.5 rounded-full">
                  Learn What's Next
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold">5 Minutes · Intermediate</span>
              </div>
              
              <h3 className="text-2xl font-display font-extrabold text-white mb-3">What is MCP?</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
                Model Context Protocol (MCP) is an open standard designed to solve the context connectivity problem for LLMs. Instead of writing custom integration scripts for every database and API, MCP provides a unified API interface.
              </p>
              
              <div className="bg-[#8B5CF6]/[0.02] border-l-2 border-[#8B5CF6] px-4.5 py-3.5 rounded-r-2xl mb-6">
                <span className="block text-[10px] font-bold text-[#C084FC] uppercase tracking-widest mb-0.5">Why it matters:</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                  It allows LLMs and IDE workspace agents (like Cursor, Claude Desktop) to safely query and edit files directly in local sandboxes without breaking container trust structures.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert("Loading Novique Learning Lesson: Introduction to MCP...")}
              className="py-2.5 px-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-[#8B5CF6]/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all text-center"
            >
              Start Learning
            </button>
          </div>

          {/* WEEKLY INTELLIGENCE REPORT */}
          <div className="bg-[#121625] border border-white/[0.06] rounded-3xl p-7 md:p-8 flex flex-col justify-between hover:border-[#8B5CF6]/30 transition-all shadow-xl">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22D3EE] block mb-2">Weekly Synthesis</span>
              <h3 className="text-2xl font-display font-extrabold text-white mb-5">Weekly Intelligence</h3>
              
              <div className="flex flex-col gap-3.5 mb-6 text-xs text-zinc-300">
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Top Company</span>
                  <span className="font-semibold text-[#C084FC]">Anthropic</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Top Research Paper</span>
                  <span className="font-semibold text-white">KAN (Kolmogorov-Arnold Networks)</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Top Startup</span>
                  <span className="font-semibold text-white">Cursor (Anysphere)</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-zinc-500 font-medium">Fastest Growing Skill</span>
                  <span className="font-semibold text-[#22D3EE]">MCP Integrations</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-zinc-500 font-medium">Biggest Funding</span>
                  <span className="font-semibold text-[#34D399]">xAI ($6B Series B)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Downloading Weekly Executive PDF...")}
              className="py-2.5 px-4 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white rounded-xl text-xs font-bold transition-all text-center shadow-lg shadow-[#8B5CF6]/10"
            >
              Download Report
            </button>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-10 mt-16 bg-[#070711]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#94A3B8]">
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">About</span>
            <span className="hover:text-white cursor-pointer transition-colors">API</span>
            <span className="hover:text-white cursor-pointer transition-colors">Blog</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
          <div>
            &copy; 2026 Novique. Scored and aggregated by the Novique AI platform.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">GitHub</span>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#121625] border border-white/[0.08] rounded-3xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span>
              <span className="font-display text-lg font-bold text-white">Noviqe Auth</span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-6">
              Access personalized briefings, bookmarks, and interest filters.
            </p>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder-zinc-500 outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder-zinc-500 outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
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
                className="w-full h-10 mt-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] text-xs font-bold text-white transition-all disabled:opacity-50"
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
                className="ml-1 text-[#8B5CF6] font-bold hover:underline"
              >
                {authMode === "login" ? "Register" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
