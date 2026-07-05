"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

interface CompanyDetail {
  name: string;
  momentum: string;
  focus: string;
  funding: string;
  hiring: string;
  overview: string;
  releases: string[];
  models: string[];
  research: string[];
  timeline: { year: string; event: string }[];
  competitors: string[];
}

const COMPANY_DATABASE: Record<string, CompanyDetail> = {
  "openai": {
    name: "OpenAI",
    momentum: "9.8/10",
    focus: "General Cognitive Intelligence Platforms",
    funding: "$6.6B raised",
    hiring: "Accelerating (50+ active positions)",
    overview: "OpenAI is an AI research and deployment company. Its mission is to ensure that artificial general intelligence benefits all of humanity. Known for pioneering GPT models and scaling multimodal interfaces.",
    releases: ["GPT-4o Realtime Audio API", "Sora Video Generation Beta", "SearchGPT Search Prototype"],
    models: ["GPT-4o", "GPT-4", "o1-preview"],
    research: ["GPT-4 Technical Report", "Scaling Laws for Autoregressive Generative Models", "Introducing Superalignment Projects"],
    timeline: [
      { year: "2015", event: "Founded as a non-profit artificial intelligence research lab." },
      { year: "2019", event: "Transitioned to a capped-profit model and partnered with Microsoft." },
      { year: "2022", event: "Launched ChatGPT, igniting the global generative AI wave." },
      { year: "2024", event: "Launched o1 reasoning models and raised $6.6B at a $157B valuation." }
    ],
    competitors: ["Anthropic", "Google DeepMind", "Meta AI"]
  },
  "anthropic": {
    name: "Anthropic",
    momentum: "9.9/10",
    focus: "Safety & Agentic Developer Environments",
    funding: "$4B Amazon backing",
    hiring: "High demand (34 positions open)",
    overview: "Anthropic is an AI safety and research company that builds reliable, beneficial, and controllable AI systems. Known for its Claude model series and pioneering constitutional AI alignment.",
    releases: ["Claude 3.5 Sonnet", "Model Context Protocol (MCP) Standard", "Claude Computer Use Beta"],
    models: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3.5 Haiku"],
    research: ["Constitutional AI: Harmlessness from AI Feedback", "Scaling Monosemanticity in Claude 3", "Toy Models of Superposition"],
    timeline: [
      { year: "2021", event: "Founded by former OpenAI members, focusing on alignment research." },
      { year: "2023", event: "Released the Claude chatbot interface and partnered with AWS." },
      { year: "2024", event: "Introduced Claude 3.5 Sonnet and standard-setting Computer Use API." }
    ],
    competitors: ["OpenAI", "Google DeepMind", "Meta AI"]
  },
  "google-deepmind": {
    name: "Google DeepMind",
    momentum: "9.4/10",
    focus: "Scientific Breakthrough & Foundational Models",
    funding: "Parent-Alphabet backed",
    hiring: "Selective (88 active postings)",
    overview: "Google DeepMind combines deep reinforcement learning and neural networks to solve intelligence and scientific challenges, notably protein folding, climate modeling, and foundational Gemini models.",
    releases: ["AlphaFold 3 open source release", "Gemini 1.5 Pro 2M Context", "AlphaProof math solver"],
    models: ["Gemini 1.5 Pro", "Gemini 1.5 Flash", "Gemma 2"],
    research: ["AlphaFold 3 Molecular Structure In Nature", "Gemini: A Family of Highly Capable Multimodal Models", "Mastering Chess and Go without Human Knowledge"],
    timeline: [
      { year: "2010", event: "DeepMind Technologies founded in London." },
      { year: "2014", event: "Acquired by Google and integrated into core search & research." },
      { year: "2020", event: "Solved the 50-year-old protein folding challenge with AlphaFold." },
      { year: "2023", event: "Merged Google Brain and DeepMind into Google DeepMind under Demis Hassabis." }
    ],
    competitors: ["OpenAI", "Anthropic", "Meta AI"]
  },
  "meta-ai": {
    name: "Meta AI",
    momentum: "9.5/10",
    focus: "Open Weights & Decentralized Architectures",
    funding: "Parent-Meta backed",
    hiring: "Steady (41 positions)",
    overview: "Meta AI conducts foundational AI research and releases open weights models to foster decentralized innovation, believing open source is safer and accelerates global developer tooling.",
    releases: ["Llama 3.1 405B base model weights", "Segment Anything Model v2", "Meta AI WhatsApp/IG Chatbot"],
    models: ["Llama 3.1 405B", "Llama 3 70B", "Llama 3.2 3B"],
    research: ["Llama 3.1 Model Architecture Report", "Segment Anything Technical Whitepaper", "Self-Supervised Learning with DINOv2"],
    timeline: [
      { year: "2013", event: "FAIR (Facebook Artificial Intelligence Research) founded by Yann LeCun." },
      { year: "2023", event: "Released original Llama weights, triggering the open-source community." },
      { year: "2024", event: "Shipped Llama 3.1 405B, rivaling top proprietary models." }
    ],
    competitors: ["OpenAI", "Anthropic", "Google DeepMind"]
  },
  "mistral": {
    name: "Mistral",
    momentum: "8.9/10",
    focus: "Efficient, Highly Parameter-dense Edge Models",
    funding: "$640M raised",
    hiring: "Moderate (12 positions)",
    overview: "Mistral AI is a European AI startup focused on high-performance, cost-effective models. They prioritize open-weights releases with commercial API options.",
    releases: ["Codestral 22B Developer Assistant", "Mistral Large v2", "Pixtral 12B Multimodal"],
    models: ["Mistral Large 2", "Codestral 22B", "Mistral 7B"],
    research: ["Mixture-of-Experts with Mixtral 8x7B", "Mistral 7B Architecture Specifications"],
    timeline: [
      { year: "2023", event: "Founded in Paris by researchers from Meta and Google DeepMind." },
      { year: "2023", event: "Released Mixtral 8x7B, proving MoE efficiency on standard GPUs." },
      { year: "2024", event: "Partnered with Microsoft Azure and released Mistral Large 2." }
    ],
    competitors: ["Meta AI", "OpenAI", "Anthropic"]
  },
  "cursor": {
    name: "Cursor (Anysphere)",
    momentum: "9.7/10",
    focus: "AI-Augmented Developer Environments",
    funding: "$30M Series A",
    hiring: "Rapid (15 positions)",
    overview: "Anysphere builds Cursor, a fork of VS Code tailored for deep AI pair-programming. Features include Composer for multi-file agent edits and custom tab prediction models.",
    releases: ["Composer multi-file edit mode", "Local MCP server integrations", "Fast Tab-Prediction engine"],
    models: ["Cursor Tab Engine", "Claude 3.5 Custom API Endpoint"],
    research: ["Speculative Decoding for Code Completion", "User intent modeling in IDE loops"],
    timeline: [
      { year: "2022", event: "Founded by MIT graduates focusing on IDE-level AI integration." },
      { year: "2023", event: "Launched Cursor editor, gaining rapid traction with developers." },
      { year: "2024", event: "Released Composer mode and raised Series A from Andreessen Horowitz." }
    ],
    competitors: ["GitHub Copilot", "Replit Agent", "VS Code AI"]
  },
  "perplexity": {
    name: "Perplexity",
    momentum: "9.2/10",
    focus: "AI-Driven Search & Information Indexing",
    funding: "$250M raised",
    hiring: "Steady (20 positions)",
    overview: "Perplexity is a conversational search engine that answers queries using natural language predictive text combined with web search results, citing references directly.",
    releases: ["Pro Search Deep Query Mode", "Publish Pages feature", "Perplexity Finance Indexer"],
    models: ["Sonar Large", "Sonar Medium"],
    research: ["Evaluating citations in LLM search queries", "Low latency web scraping pipelines"],
    timeline: [
      { year: "2022", event: "Founded by researchers from OpenAI and UC Berkeley." },
      { year: "2023", event: "Shipped core search product, challenging traditional search models." },
      { year: "2024", event: "Launched publisher revenue-share and valuation reached $3B." }
    ],
    competitors: ["Google Search", "ChatGPT Search", "You.com"]
  }
};

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const companyKey = String(slug || "").toLowerCase();
  const company = COMPANY_DATABASE[companyKey];

  if (!company) {
    return (
      <div className="min-h-screen bg-ink text-textPrimary relative flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold mb-4">Company Profile Not Found</h1>
          <p className="text-textSecondary mb-6">The requested index target could not be verified.</p>
          <Link href="/companies" className="px-6 py-2.5 bg-accent rounded-xl text-xs font-bold text-white">
            Return to Watchlist
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
        <Link href="/companies" className="text-xs text-textSecondary hover:text-accent font-bold flex items-center gap-1">
          &larr; Back to Company Watchlist
        </Link>

        {/* Company Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
          <div>
            <div className="flex items-center gap-3.5">
              <h1 className="text-4xl font-display font-extrabold text-white">{company.name}</h1>
              <span className="text-xs font-extrabold text-tealAccent bg-tealAccent/10 border border-tealAccent/20 px-3.5 py-0.5 rounded-full uppercase tracking-wider">
                {company.funding}
              </span>
            </div>
            <p className="text-sm text-textSecondary mt-2">Core Focus: {company.focus}</p>
          </div>
          <div className="flex flex-col items-start md:items-end text-xs">
            <span className="text-[#F6C453] font-bold">⚡ Momentum: {company.momentum}</span>
            <span className="text-textSecondary mt-1">Hiring: {company.hiring}</span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Main Info Columns */}
          <div className="md:col-span-2 flex flex-col gap-8">
            {/* Overview */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-3">Overview</h3>
              <p className="text-sm text-textSecondary leading-relaxed font-normal">{company.overview}</p>
            </div>

            {/* Releases */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Latest Releases</h3>
              <div className="flex flex-col gap-3">
                {company.releases.map((rel, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-tealAccent"></span>
                    <span>{rel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-6">Milestones Timeline</h3>
              <div className="relative border-l border-white/[0.08] ml-2 pl-6 flex flex-col gap-6">
                {company.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-9 top-1 w-2.5 h-2.5 rounded-full bg-accent border border-ink"></span>
                    <strong className="text-xs text-accent block">{step.year}</strong>
                    <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{step.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Columns */}
          <div className="flex flex-col gap-6">
            
            {/* Models Sidebar */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Core Model Suite</h3>
              <div className="flex flex-wrap gap-2">
                {company.models.map((mod) => (
                  <Link
                    key={mod}
                    href={`/models/${mod.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-accent hover:text-white bg-white/[0.02] transition-all"
                  >
                    {mod}
                  </Link>
                ))}
              </div>
            </div>

            {/* Research Contributions */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Key Research Papers</h3>
              <div className="flex flex-col gap-3.5">
                {company.research.map((paper, idx) => (
                  <div key={idx} className="text-xs pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <span className="font-bold text-zinc-300 block leading-tight">{paper}</span>
                    <Link href="/research" className="text-[10px] text-accent font-semibold hover:underline block mt-1">Read Review &rarr;</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitors */}
            <div className="bg-panel border border-white/[0.05] p-6 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9AA8BD] mb-4">Tracked Competitors</h3>
              <div className="flex flex-col gap-2">
                {company.competitors.map((comp) => (
                  <Link
                    key={comp}
                    href={`/companies/${comp.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs font-semibold p-2.5 rounded-xl border border-white/[0.06] hover:border-tealAccent bg-white/[0.02] transition-all flex items-center justify-between"
                  >
                    <span>{comp}</span>
                    <span className="text-[9px] text-[#9AA8BD]">&rarr;</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
