"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const models = [
    {
      name: "Claude 3.5 Sonnet",
      maker: "Anthropic",
      version: "v3.5 Sonnet (June 2026)",
      capabilities: "State-of-the-art coding, logical reasoning, multi-step instruction compliance, visual analysis.",
      adoption: "Surging (+42% developer deployment)",
      community: "Bullish (Preferred for Cursor/copilots)",
      performance: "Top scoring on SWE-bench and human-eval logic tests."
    },
    {
      name: "GPT-4o",
      maker: "OpenAI",
      version: "gpt-4o-realtime (May 2026)",
      capabilities: "Low-latency voice/audio processing, real-time multimodal token streams, visual reasoning.",
      adoption: "Stable (+18% production volume)",
      community: "High (Broad consumer & API base)",
      performance: "Leading response speeds and speech token synthesis quality."
    },
    {
      name: "Llama 3.1 405B",
      maker: "Meta AI",
      version: "3.1-405B-Instruct",
      capabilities: "Local fine-tuning, synthetic data generation pipelines, self-hosting, multilingual weights.",
      adoption: "Surging (+31% enterprise local installations)",
      community: "Exponential open-weights ecosystem",
      performance: "Beats proprietary baselines when fine-tuned on custom domains."
    },
    {
      name: "Gemini 1.5 Pro",
      maker: "Google",
      version: "Gemini 1.5 Pro-002",
      capabilities: "2-Million token context window, deep multimodal understanding across video/audio/files.",
      adoption: "Steady (+24% enterprise integration)",
      community: "Strong (Highly popular for long-context tasks)",
      performance: "Exceptional needle-in-a-haystack retrieval accuracy across long transcripts."
    }
  ];

  const filteredModels = models.filter((m) => {
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.capabilities.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-1.5 block">Model Tracker</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Model Intelligence</h1>
          <p className="text-sm text-textSecondary mt-1">Deep specifications, capability reviews, and adoption trend tracking for top LLMs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModels.map((model, idx) => (
            <Link
              key={idx}
              href={`/models/${model.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-panel border border-white/[0.05] p-7 md:p-8 rounded-3xl hover:border-accent/30 transition-all flex flex-col justify-between group shadow-md text-left"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-[#C084FC] uppercase tracking-widest mb-3">
                  <span>{model.maker}</span>
                  <span className="text-zinc-500 font-semibold">{model.version}</span>
                </div>
                <h4 className="text-xl font-display font-extrabold text-white mb-2 group-hover:text-accent transition-colors">{model.name}</h4>
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-6 font-normal">{model.capabilities}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-5 mt-auto text-xs flex flex-col gap-3">
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
                  <span className="font-semibold text-tealAccent text-right">{model.performance}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
