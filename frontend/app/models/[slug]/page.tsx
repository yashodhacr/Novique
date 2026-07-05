"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

interface ModelDetail {
  name: string;
  maker: string;
  version: string;
  contextWindow: string;
  pricing: string;
  capabilities: string;
  benchmarks: { name: string; score: string }[];
  updates: string[];
  timeline: { date: string; update: string }[];
  papers: string[];
}

const MODEL_DATABASE: Record<string, ModelDetail> = {
  "claude-3-5-sonnet": {
    name: "Claude 3.5 Sonnet",
    maker: "Anthropic",
    version: "v3.5 Sonnet (June 2026)",
    contextWindow: "200,000 tokens (~150,000 words)",
    pricing: "$3.00 / million input, $15.00 / million output tokens",
    capabilities: "Leading logical reasoning, complex code generation, multi-step instruction execution, and detailed visual data parsing.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "59.4%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "88.7%" },
      { name: "SWE-bench Verified (Software Coding)", score: "49.0%" }
    ],
    updates: [
      "Released Computer Use API integration (Beta)",
      "Improved instruction formatting compliance",
      "Accelerated latency processing speeds by 2x"
    ],
    timeline: [
      { date: "June 2024", update: "Claude 3.5 Sonnet released, establishing new benchmarks in reasoning." },
      { date: "October 2024", update: "Claude 3.5 Sonnet upgraded with computer-use API and agent capabilities." }
    ],
    papers: ["Scaling Monosemanticity in Claude 3", "Constitutional AI Alignment Guidelines"]
  },
  "gpt-4o": {
    name: "GPT-4o",
    maker: "OpenAI",
    version: "gpt-4o-2024-05-13",
    contextWindow: "128,000 tokens",
    pricing: "$2.50 / million input, $10.00 / million output tokens",
    capabilities: "Real-time multimodal synthesis across text, vision, and low-latency voice, enabling conversational streams.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "53.6%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "88.7%" },
      { name: "Math Reasoning (MATH)", score: "76.6%" }
    ],
    updates: [
      "Realtime WebSocket Voice API released",
      "Sora Video generator prompt endpoints integrated",
      "Advanced SearchGPT search features made default"
    ],
    timeline: [
      { date: "May 2024", update: "GPT-4o announced with native multimodal capabilities." },
      { date: "October 2024", update: "Realtime API released to public beta, decreasing voice latency." }
    ],
    papers: ["GPT-4o Multimodal Capabilities Report", "Direct Preference Optimization in Conversation"]
  },
  "llama-3-1-405b": {
    name: "Llama 3.1 405B",
    maker: "Meta AI",
    version: "Llama-3.1-405B-Instruct",
    contextWindow: "128,000 tokens",
    pricing: "Free open-weights download ($0/token local inference)",
    capabilities: "Superb synthetic data generation pipeline backing, multilingual translations, deep safety fine-tuning parameters.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "51.1%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "88.6%" },
      { name: "GSM8k (Math Reasoning)", score: "96.8%" }
    ],
    updates: [
      "Released quantizations to fit model on consumer hardware",
      "Improved tools agent-loop capabilities",
      "Optimized context attention window heads"
    ],
    timeline: [
      { date: "July 2024", update: "Llama 3.1 405B released as first competitive open model weights." },
      { date: "November 2024", update: "Meta released Llama 3.2 edge models extending multimodality." }
    ],
    papers: ["Llama 3.1 Model Architecture Specifications", "PEFT Training Methods with LoRA"]
  },
  "gemini-1-5-pro": {
    name: "Gemini 1.5 Pro",
    maker: "Google",
    version: "Gemini 1.5 Pro-002",
    contextWindow: "2,000,000 tokens",
    pricing: "$1.25 / million input, $5.00 / million output tokens",
    capabilities: "Massive context window loading entire codebases, audio documents, or hours of video natively in a single query.",
    benchmarks: [
      { name: "GPQA (Graduate-Level Reasoning)", score: "54.0%" },
      { name: "MMLU (Undergraduate Knowledge)", score: "86.5%" },
      { name: "Needle In A Haystack Retrieval", score: "99.9%" }
    ],
    updates: [
      "Context caching API released, reducing token pricing by 50%",
      "Faster audio reasoning models integrated",
      "Integrated into Workspace sidebar defaults"
    ],
    timeline: [
      { date: "February 2024", update: "Gemini 1.5 Pro announced with 1-Million token context." },
      { date: "May 2024", update: "Google I/O doubled context window to 2-Million tokens." }
    ],
    papers: ["Gemini: A Family of Highly Capable Multimodal Models", "Context Caching for Autoregressive Generation"]
  }
};

export default function ModelDetailPage() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const modelKey = String(slug || "").toLowerCase();
  const model = MODEL_DATABASE[modelKey];

  if (!model) {
    return (
      <div className="min-h-screen bg-ink text-textPrimary relative flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold mb-4">Model Specification Not Found</h1>
          <p className="text-textSecondary mb-6">The requested index target could not be verified.</p>
          <Link href="/models" className="px-6 py-2.5 bg-accent rounded-xl text-xs font-bold text-white">
            Return to Models list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        
        {/* Header Back Link */}
        <Link href="/models" className="text-xs text-textSecondary hover:text-accent font-bold flex items-center gap-1">
          &larr; Back to Model Intelligence
        </Link>

        {/* Model Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
          <div>
            <div className="flex items-center gap-3.5">
              <h1 className="text-4xl font-display font-extrabold text-white">{model.name}</h1>
              <span className="text-xs font-semibold text-zinc-500">v: {model.version}</span>
            </div>
            <p className="text-sm text-textSecondary mt-2">Developed by: <Link href={`/companies/${model.maker.toLowerCase().replace(/\s+/g, "-")}`} className="text-accent hover:underline font-bold">{model.maker}</Link></p>
          </div>
          <div className="text-xs flex flex-col items-start md:items-end">
            <span className="text-tealAccent font-bold">Context: {model.contextWindow}</span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Main Info Columns */}
          <div className="md:col-span-2 flex flex-col gap-8">
            {/* Capabilities */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-3">Model Capabilities</h3>
              <p className="text-sm text-textSecondary leading-relaxed font-normal">{model.capabilities}</p>
            </div>

            {/* Pricing */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-3">Pricing Tier</h3>
              <p className="text-sm text-white font-semibold leading-relaxed">{model.pricing}</p>
            </div>

            {/* Updates list */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Latest Updates</h3>
              <div className="flex flex-col gap-3">
                {model.updates.map((update, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    <span>{update}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-6">Model Launch Timeline</h3>
              <div className="relative border-l border-white/[0.08] ml-2 pl-6 flex flex-col gap-6">
                {model.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-9 top-1 w-2.5 h-2.5 rounded-full bg-tealAccent border border-ink"></span>
                    <strong className="text-xs text-tealAccent block">{step.date}</strong>
                    <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{step.update}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Columns */}
          <div className="flex flex-col gap-6">
            
            {/* Benchmarks */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Key Benchmarks</h3>
              <div className="flex flex-col gap-4">
                {model.benchmarks.map((bench) => (
                  <div key={bench.name} className="flex justify-between items-center text-xs pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <span className="text-zinc-500 font-medium">{bench.name}</span>
                    <span className="font-bold text-white bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">{bench.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Research Papers */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Related Research</h3>
              <div className="flex flex-col gap-3.5">
                {model.papers.map((paper, idx) => (
                  <div key={idx} className="text-xs pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <span className="font-bold text-zinc-300 block leading-tight">{paper}</span>
                    <Link href="/research" className="text-[10px] text-accent font-semibold hover:underline block mt-1">Read Review &rarr;</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Developer Company Card */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-1">Developer Firm</h3>
              <span className="text-sm font-bold text-white">{model.maker}</span>
              <Link
                href={`/companies/${model.maker.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-center py-2 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all block mt-2"
              >
                Inspect Firm &rarr;
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
