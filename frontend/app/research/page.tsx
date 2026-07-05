"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const papers = [
    {
      title: "KAN: Kolmogorov-Arnold Networks",
      maker: "Ziming Liu, et al. (MIT, Caltech)",
      explanation: "An alternative neural network architecture replacing Multi-Layer Perceptrons (MLPs). KANs place learnable activation functions on edges (weights) rather than nodes, achieving superior accuracy and interpretability for scientific machine learning.",
      citations: "1,240 citations",
      impact: "High — Successor candidate for MLPs in scientific models and computing.",
      confidence: "98% Confidence",
      url: "https://arxiv.org/abs/2404.19756"
    },
    {
      title: "Model Context Protocol (MCP) Specifications",
      maker: "Anthropic Engineering Group",
      explanation: "A standard client-server protocol enabling LLMs and workspace tools (like Cursor, Claude Desktop) to securely query local databases, inspect systems, and connect with third-party tools via uniform APIs.",
      citations: "128 citations",
      impact: "Critical — Standardizing the integration layer for agentic workspaces.",
      confidence: "96% Confidence",
      url: "https://github.com/modelcontextprotocol"
    },
    {
      title: "Attention Is All You Need",
      maker: "Vaswani, et al. (Google Brain)",
      explanation: "The foundational paper introducing the Transformer architecture, replacing sequential recurrence models with parallel self-attention networks, forming the basis of all modern generative Large Language Models.",
      citations: "112,490 citations",
      impact: "Revolutionary — The baseline architecture of the generative AI revolution.",
      confidence: "100% Confidence",
      url: "https://arxiv.org/abs/1706.03762"
    },
    {
      title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
      maker: "Rafailov, et al. (Stanford)",
      explanation: "An elegant alternative to RLHF (Reinforcement Learning from Human Feedback) that optimizes language model alignment directly on preference data without training a separate reward model.",
      citations: "820 citations",
      impact: "Very High — Simplifies model alignment pipelines for open weights.",
      confidence: "94% Confidence",
      url: "https://arxiv.org/abs/2305.18290"
    }
  ];

  const filteredPapers = papers.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.explanation.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent mb-1.5 block">Academic Index</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Research Intelligence</h1>
          <p className="text-sm text-textSecondary mt-1">Deep analysis of academic papers, citation momentum, and theoretical breakthroughs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPapers.map((paper, idx) => (
            <div key={idx} className="bg-panel border border-white/[0.05] p-7 md:p-8 rounded-3xl hover:border-accent/30 hover:shadow-[0_12px_36px_rgba(109,93,246,0.06)] transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-tealAccent uppercase tracking-widest mb-4">
                  <span>{paper.confidence}</span>
                  <span className="text-zinc-500 font-semibold">{paper.citations}</span>
                </div>
                <h4 className="text-xl font-display font-extrabold text-white mb-1 group-hover:text-accent transition-colors leading-snug">{paper.title}</h4>
                <span className="text-xs text-zinc-500 font-medium block mb-4">Authors: {paper.maker}</span>
                <p className="text-sm text-textSecondary leading-relaxed mb-6 font-normal">{paper.explanation}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-5 mt-auto">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Industry Impact:</div>
                <div className="text-xs text-zinc-200 font-semibold mb-6 leading-relaxed">{paper.impact}</div>
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all block"
                >
                  Read Paper &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
