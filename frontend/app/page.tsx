"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchFeed } from "@/lib/api";
import * as authApi from "@/lib/auth";
import { ArticleCard } from "@/components/ArticleCard";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "./auth-context";

export default function Home() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Brief Countdown Timer State (5 minutes loop)
  const [secondsLeft, setSecondsLeft] = useState(300);

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

  // Fetch Signals (Discover default on home)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["feed", "discover", "impact", "all", !!token],
    queryFn: () => fetchFeed("impact", "all"),
  });

  // Bookmark & interest states for cards
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

  // Filter and show top 5 only for the homepage
  const topFiveArticles = data
    ?.filter((a) => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        (a.topics ?? []).some((t) => t.toLowerCase().includes(q))
      );
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] relative font-sans selection:bg-[#6D5DF6]/30 selection:text-white">
      {/* Mesh Glow Background */}
      <div className="absolute top-0 left-0 right-0 h-[700px] bg-gradient-to-b from-[#6D5DF6]/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[12%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-[#6D5DF6]/4 blur-[130px] pointer-events-none" />
      <div className="absolute top-[38%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-[#14B8A6]/3 blur-[130px] pointer-events-none" />

      {/* Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Homepage Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-16 md:gap-24 relative z-10">
        
        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row items-stretch gap-10 md:gap-14 animate-fade-in">
          {/* Hero Left */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#14B8A6] mb-4 bg-[#14B8A6]/10 px-3.5 py-1 rounded-full w-max">
              Understand what matters in AI—in under 5 minutes.
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6.5xl font-display font-extrabold tracking-tight text-textPrimary mb-4 leading-[1.1]">
              Good Morning 👋
            </h1>
            <p className="text-lg md:text-xl text-textSecondary font-light mb-4">
              Understand today's AI landscape in under 5 minutes.
            </p>
            <p className="text-sm text-textSecondary font-normal leading-relaxed mb-8 max-w-lg">
              The fastest way for engineers, founders, investors and AI professionals to understand what happened, why it matters and what action to take.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/signals"
                className="px-6 py-3 rounded-xl font-bold bg-[#6D5DF6] hover:bg-[#5a4cdb] text-white transition-all hover:scale-[1.02] shadow-lg shadow-[#6D5DF6]/20"
              >
                Read Today's Brief
              </a>
              <a
                href="/signals"
                className="px-6 py-3 rounded-xl font-bold border border-white/[0.08] bg-white/[0.02] text-textSecondary hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Explore Signals
              </a>
            </div>
          </div>

          {/* Hero Right: Today's AI Brief Card */}
          <div className="flex-1 bg-[#111827] border border-white/[0.05] rounded-3xl p-7 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_24px_55px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#6D5DF6]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-textPrimary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10b981] animate-pulse"></span>
                Today's Intelligence
              </h2>
              <span className="text-[10px] font-bold text-textSecondary bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded uppercase tracking-wider">LIVE STATUS</span>
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
                <div key={idx} className="bg-[#0B1220]/50 border border-white/[0.04] p-4 rounded-2xl transition-all hover:border-[#6D5DF6]/30">
                  <span className="block text-2xl font-display font-extrabold text-white">{item.count}</span>
                  <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mt-0.5 block">{item.label}</span>
                </div>
              ))}
              
              {/* Trend Momentum Block */}
              <div className="bg-[#0B1220]/50 border border-[#6D5DF6]/20 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-[#6D5DF6] uppercase tracking-wider">Momentum</span>
                  <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
                  </svg>
                </div>
                <span className="text-xl font-display font-extrabold text-[#10B981] mt-1">94.8%</span>
              </div>
            </div>

            {/* Countdown bar */}
            <div className="text-[11px] text-[#94A3B8] border-t border-white/[0.05] pt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#14B8A6]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Next refresh in <strong className="text-white font-mono">{formatTime(secondsLeft)}</strong>
              </span>
              <a href="/signals" className="text-[#6D5DF6] font-bold cursor-pointer hover:underline">Review details &rarr;</a>
            </div>
          </div>
        </section>

        {/* SIGNATURE FEATURE: AI INSIGHT OF THE DAY (Visually Different - Gold Highlighted) */}
        <section className="flex flex-col gap-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">AI Insight of the Day</span>
            <div className="h-[1px] bg-white/[0.06] flex-1 ml-4"></div>
          </div>

          <div className="bg-[#111827] border-2 border-[#F4B740]/40 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col lg:flex-row gap-8 shadow-[0_20px_50px_rgba(244,183,64,0.06)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B740]/2 rounded-full blur-3xl pointer-events-none" />
            
            {/* Left Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-black bg-[#F4B740] px-3.5 py-0.5 rounded-full">
                    Signature Insight
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#F4B740] bg-[#F4B740]/10 border border-[#F4B740]/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4B740] shadow-[0_0_4px_#f4b740]" />
                    96% Confidence Score
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white mb-4">
                  Open-source coding models are improving faster than proprietary alternatives this week.
                </h3>
                
                <p className="text-sm md:text-base leading-relaxed text-[#94A3B8] mb-6 font-normal">
                  The acceleration of open-source coding integrations (specifically via MCP servers and direct local context tools) has created a significant surge in workflow velocity. Small, fine-tuned developer-centric models are matching GPT-4 class systems on logical reasoning tasks while bypassing external latency.
                </p>
              </div>

              {/* Grid detail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-white/[0.06] pt-5">
                <div>
                  <span className="text-[10px] font-bold text-[#F4B740] uppercase tracking-wider block mb-1">Why it matters</span>
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
                  <span className="text-[10px] font-bold text-[#14B8A6] uppercase tracking-wider block mb-1">Recommended Action</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    Begin building custom private MCP servers for your internal database schemas rather than writing custom REST APIs.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Confidence Score Dial */}
            <div className="w-full lg:w-[240px] flex flex-col items-center justify-center border-l lg:border-l border-white/[0.06] pl-0 lg:pl-8 pt-6 lg:pt-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F4B740] mb-4 block">Confidence Rating</span>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#F4B740"
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
                  <span className="text-[9px] uppercase font-bold text-[#F4B740] tracking-wider">Confirmed</span>
                </div>
              </div>

              <span className="text-xs text-[#94A3B8] font-semibold text-center mt-4">
                Validated across all reference nodes
              </span>
            </div>

          </div>
        </section>

        {/* SECTION 2: MARKET MOMENTUM (Pills) */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-textSecondary">Market Momentum</h3>
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
                    ? "bg-[#6D5DF6]/10 border-[#6D5DF6]/30 text-[#C084FC]"
                    : "bg-[#111827] border-white/[0.05] text-zinc-300 hover:border-zinc-700 hover:text-white"
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

        {/* TODAY'S SIGNALS (TOP FIVE ONLY!) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Today's Signals</h2>
              <p className="text-xs text-textSecondary mt-0.5">Top five executive analysis logs</p>
            </div>
            <a href="/signals" className="text-xs font-semibold text-[#6D5DF6] hover:text-[#5a4cdb] flex items-center gap-1.5">
              Explore All Signals
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </div>

          {isLoading && <p className="text-zinc-500 text-sm">Querying signals...</p>}
          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              Error connecting to the Novique pipeline engine.
            </div>
          )}

          <div className="flex flex-col gap-6">
            {topFiveArticles?.map((article) => (
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

            {topFiveArticles?.length === 0 && (
              <div className="bg-[#111827] border border-white/[0.05] p-10 rounded-3xl text-center text-[#94A3B8] text-sm">
                No matching briefings found on the active stack.
              </div>
            )}
          </div>
        </section>

        {/* AI OPPORTUNITY OF THE DAY (GOLD HIGHLIGHTED OPPORTUNITY) */}
        <section className="relative rounded-3xl p-0.5 overflow-hidden bg-gradient-to-r from-[#F4B740] via-[#6D5DF6] to-[#14B8A6] shadow-[0_20px_50px_rgba(244,183,64,0.08)]">
          <div className="bg-[#0B1220] p-6 md:p-8 rounded-[22px] flex flex-col md:flex-row gap-8 justify-between">
            {/* Left */}
            <div className="md:w-1/3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F4B740] mb-2 block">
                  AI Opportunity of the Day
                </span>
                <h3 className="text-2xl font-plus-jakarta font-extrabold tracking-tight text-white leading-tight">
                  Model Context Protocol
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed">
                Mentions increased 38% this week. Rapidly standardizing database connections.
              </p>
            </div>

            {/* Middle */}
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-[#F4B740] uppercase tracking-widest block mb-1">Career Impact</span>
                <p className="text-base font-bold text-white">High (Enterprise Integrators)</p>
                
                <span className="text-[10px] font-bold text-[#14B8A6] uppercase tracking-widest block mb-1 mt-4">Estimated Learning Time</span>
                <p className="text-xs text-zinc-300">20 minutes module</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest block mb-1.5">Companies Adopting It</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Anthropic", "OpenAI", "Microsoft"].map((adopter) => (
                    <span key={adopter} className="text-[10px] font-semibold text-white bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
                      {adopter}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right CTA */}
            <div className="md:w-1/6 flex items-center justify-end">
              <a
                href="/opportunities"
                className="w-full md:w-auto px-5 py-3 rounded-xl font-bold bg-[#F4B740] hover:bg-[#e0a230] text-black transition-all text-xs text-center"
              >
                Start Learning
              </a>
            </div>

          </div>
        </section>

        {/* WEEKLY INTELLIGENCE REPORT */}
        <section className="bg-[#111827] border border-white/[0.05] rounded-3xl p-7 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6D5DF6] block mb-2">Weekly Synthesis</span>
            <h3 className="text-2xl font-display font-extrabold text-white mb-2">Weekly Intelligence</h3>
            <p className="text-xs text-textSecondary max-w-xl leading-relaxed">
              Consolidated executive intelligence report on rising stars, breakthroughs, and enterprise shifts across the entire AI landscape. Download the full PDF synthesis.
            </p>
          </div>

          <button
            onClick={() => alert("Downloading Weekly Executive PDF...")}
            className="py-3 px-6 bg-[#6D5DF6] hover:bg-[#5a4cdb] text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-lg shadow-[#6D5DF6]/10"
          >
            Download PDF Report
          </button>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] py-10 mt-16 bg-[#050816]">
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

    </div>
  );
}
