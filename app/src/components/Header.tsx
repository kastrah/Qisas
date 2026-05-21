"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-qisas-dark-bg/80 dark:bg-qisas-dark-bg/80 bg-qisas-light-bg/80 border-b border-qisas-dark-border dark:border-qisas-dark-border border-qisas-light-border">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          <span className="font-heading text-xl font-bold text-qisas-dark-text dark:text-qisas-dark-text text-qisas-light-text">
            Qisas
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm text-qisas-dark-textMuted dark:text-qisas-dark-textMuted text-qisas-light-textMuted hover:text-qisas-dark-accent dark:hover:text-qisas-dark-accent hover:text-qisas-light-accent transition-colors"
          >
            How it works
          </Link>
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-qisas-dark-card dark:bg-qisas-dark-card bg-qisas-light-card hover:bg-qisas-dark-border dark:hover:bg-qisas-dark-border hover:bg-qisas-light-border transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </nav>
      </div>
    </header>
  );
}
