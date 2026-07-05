"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const companies = [
    { name: "OpenAI", momentum: "9.8/10", launch: "GPT-4o realtime API", hiring: "Accelerating (50+ roles)", funding: "$6.6B raised", news: "Expanding enterprise partnerships", focus: "General Cognitive Intelligence Platforms" },
    { name: "Anthropic", momentum: "9.9/10", launch: "Claude 3.5 Sonnet & MCP", hiring: "High demand (34 roles)", funding: "$4B Amazon backing", news: "Leading developer context standardizations", focus: "Safety & Agentic Developer Environments" },
    { name: "Google DeepMind", momentum: "9.4/10", launch: "AlphaFold 3 code release", hiring: "Selective (88 roles)", funding: "Parent-Alphabet backed", news: "Focusing on science & biology integrations", focus: "Scientific Breakthrough & Foundational Models" },
    { name: "Meta AI", momentum: "9.5/10", launch: "Llama 3.1 405B base weights", hiring: "Steady (41 roles)", funding: "Parent-Meta backed", news: "Committed to open source releases", focus: "Open Weights & Decentralized Architectures" },
    { name: "Mistral", momentum: "8.9/10", launch: "Codestral 22B coder", hiring: "Moderate (12 roles)", funding: "$640M raised", news: "Strengthening EU partnerships", focus: "Efficient, Highly Parameter-dense Edge Models" },
    { name: "Cursor (Anysphere)", momentum: "9.7/10", launch: "Composer tab & Agent loops", hiring: "Rapid (15 roles)", funding: "$30M Series A", news: "Surpassing traditional editor shares", focus: "AI-Augmented Developer Environments" },
    { name: "Perplexity", momentum: "9.2/10", launch: "Pro Search deep queries", hiring: "Steady (20 roles)", funding: "$250M raised", news: "Testing revenue share models for creators", focus: "AI-Driven Search & Information Indexing" },
  ];

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.focus.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] relative font-sans selection:bg-[#6D5DF6]/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#6D5DF6]/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22D3EE] mb-1.5 block">Corporate Tracker</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Company Watchlist</h1>
          <p className="text-sm text-textSecondary mt-1">Real-time indices tracking traction, funding rounds, hiring sprees, and focuses of AI firms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, idx) => (
            <div
              key={idx}
              className="bg-[#111827] border border-white/[0.05] p-6 rounded-3xl hover:border-[#6D5DF6]/30 hover:bg-[#111827]/80 transition-all flex flex-col justify-between gap-6 group shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{company.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500 font-semibold">
                    <span>⚡ Momentum: {company.momentum}</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-tealAccent bg-tealAccent/10 border border-tealAccent/20 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {company.funding}
                </span>
              </div>
              <div className="border-t border-white/[0.04] pt-4 text-xs flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">AI Focus:</span>
                  <span className="font-semibold text-zinc-300 text-right">{company.focus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Hiring:</span>
                  <span className="font-semibold text-zinc-300">{company.hiring}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Latest Launch:</span>
                  <span className="font-semibold text-white">{company.launch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Updates:</span>
                  <span className="font-semibold text-textSecondary text-right">{company.news}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
