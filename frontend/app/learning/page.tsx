"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";

export default function LearningPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const lessons = [
    {
      title: "What is MCP?",
      description: "Model Context Protocol (MCP) is an open-standard communication protocol developed by Anthropic. It standardizes how AI applications connect with local databases, dev filesystems, and third-party APIs.",
      why: "Allows workspace assistants like Cursor or Claude Desktop to safely execute command hooks and fetch custom context without custom code interfaces.",
      time: "5 minutes",
      difficulty: "Intermediate",
      icon: "⚡"
    },
    {
      title: "What is RAG?",
      description: "Retrieval-Augmented Generation (RAG) is a pipeline technique that fetches relevant private context from custom databases or documents and embeds it into the prompt context prior to calling LLMs.",
      why: "Drastically reduces model hallucinations and grounds responses in factual, enterprise-specific data without retraining weights.",
      time: "10 minutes",
      difficulty: "Beginner",
      icon: "📚"
    },
    {
      title: "What is Agentic AI?",
      description: "Agentic AI refers to systems where LLMs are wrapped in execution loops, memory graphs, and tools, allowing them to plan, verify, and execute multi-step workflows autonomously.",
      why: "Shifts models from passive text prediction tools to active decision-makers that can write code, run tests, and fix bugs.",
      time: "15 minutes",
      difficulty: "Advanced",
      icon: "🤖"
    },
    {
      title: "What is LoRA?",
      description: "Low-Rank Adaptation (LoRA) is a parameter-efficient fine-tuning (PEFT) method that freezes pre-trained model weights and injects trainable rank decomposition matrices into layers.",
      why: "Reduces the number of trainable parameters by up to 99%, lowering compute requirements and allowing custom styling or alignment.",
      time: "8 minutes",
      difficulty: "Advanced",
      icon: "🧠"
    }
  ];

  const filteredLessons = lessons.filter((l) => {
    const q = searchQuery.toLowerCase();
    return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans selection:bg-accent/30 selection:text-white">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10 relative z-10 animate-fade-in">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-tealAccent mb-1.5 block">Noviqe Academy</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Learn What's Next</h1>
          <p className="text-sm text-textSecondary mt-1">Modular developer-focused micro-lessons detailing emerging protocols, techniques, and model parameters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLessons.map((lesson, idx) => (
            <div
              key={idx}
              className="bg-panel border border-white/[0.05] p-7 md:p-8 rounded-3xl hover:border-accent/30 transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-tealAccent uppercase tracking-widest mb-4">
                  <span>{lesson.difficulty}</span>
                  <span className="text-zinc-500 font-semibold">{lesson.time} read</span>
                </div>
                <h3 className="text-2xl font-display font-extrabold text-white mb-3 flex items-center gap-2 group-hover:text-accent transition-colors">
                  <span>{lesson.icon}</span>
                  {lesson.title}
                </h3>
                <p className="text-sm text-textSecondary leading-relaxed mb-4">{lesson.description}</p>
                <div className="bg-white/[0.01] border-l-2 border-accent px-4 py-2.5 rounded-r-xl mb-6">
                  <span className="block text-[9px] font-bold text-[#C084FC] uppercase tracking-widest mb-0.5">Why it matters:</span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">{lesson.why}</p>
                </div>
              </div>

              <button
                onClick={() => alert(`Starting lesson: ${lesson.title}`)}
                className="w-full text-center py-2.5 bg-secondaryBg/60 hover:bg-secondaryBg border border-white/[0.05] hover:border-accent/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all"
              >
                Start Learning &rarr;
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
