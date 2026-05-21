"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_PROMPTS = [
  "I lost someone close to me and I can't stop crying",
  "I feel like a failure, nothing I do works out",
  "I'm scared about my future",
  "I feel so alone, nobody understands me",
  "I can't forgive what they did to me",
  "I don't know why I'm here",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    // Encode the input and navigate to results
    router.push(`/result?q=${encodeURIComponent(text.trim())}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text)]">
          Qisas
        </h1>
        <p className="font-arabic text-2xl text-verse mb-3">قِصَص</p>
        <p className="text-lg text-muted max-w-md mx-auto">
          Find yourself in the stories of those who came before.
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-lg">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(input);
              }
            }}
            placeholder="What are you going through?"
            className="w-full bg-card border border-theme rounded-2xl px-5 py-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-muted transition-all"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || loading}
            className="absolute bottom-3 right-3 bg-accent hover:bg-accent/90 disabled:opacity-40 text-white rounded-xl px-5 py-2 text-sm font-medium transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
              </span>
            ) : (
              "Find my story"
            )}
          </button>
        </div>
      </div>

      {/* Example prompts */}
      <div className="mt-10 w-full max-w-lg">
        <p className="text-sm text-muted mb-3 text-center">Try sharing:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSubmit(prompt)}
              disabled={loading}
              className="text-sm bg-card border border-theme rounded-full px-4 py-2 text-muted hover:text-accent hover:border-accent/50 transition-all"
            >
              &ldquo;{prompt.substring(0, 40)}...&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-16 text-xs text-muted/60 text-center max-w-sm">
        Every story connects to a verse in the Quran and an event from the
        Prophet&apos;s life ﷺ. Your feelings are valid, and there is wisdom
        waiting for you.
      </p>
    </div>
  );
}
