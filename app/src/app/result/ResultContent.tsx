"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { qisasLookup, QisasResult, SeerahEvent, QuranVerse } from "@/lib/qisas-engine";
import { fetchGuidance } from "@/lib/qisas-guidance";

export default function ResultContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [result, setResult] = useState<QisasResult | null>(null);
  const [guidance, setGuidance] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [guidanceLoading, setGuidanceLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    qisasLookup(query).then((r) => {
      setResult(r);
      setLoading(false);

      // Fetch LLM guidance if we have a match
      if (r.matched && r.verse && r.seerah && r.seerah.length > 0) {
        setGuidanceLoading(true);
        const primaryEvent = r.seerah[0];
        fetchGuidance({
          userInput: query,
          emotion: r.emotion || "",
          tags: r.tags || [],
          verse: {
            verse_key: r.verse.verse_key,
            arabic: r.verse.arabic,
            translation: r.verse.translation,
          },
          seerah: {
            title: primaryEvent.event_title,
            title_ar: primaryEvent.event_title_ar,
            description: primaryEvent.event_description || "",
            period: primaryEvent.event_period,
            year: primaryEvent.event_year_label || "",
            lessons: primaryEvent.event_lessons || "",
            location: primaryEvent.location_name || "",
            significance: primaryEvent.event_significance || "",
          },
          hadith: primaryEvent.hadith_refs?.[0]
            ? {
                collection: primaryEvent.hadith_refs[0].collection,
                narrator: primaryEvent.hadith_refs[0].narrator,
                text: primaryEvent.hadith_refs[0].text_en,
              }
            : undefined,
        }).then((g) => {
          setGuidance(g);
          setGuidanceLoading(false);
        });
      }
    });
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">No input provided.</p>
        <Link href="/" className="text-accent hover:underline mt-4 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-pulse-soft text-4xl mb-4">🌙</div>
        <p className="text-muted text-lg">Finding your story...</p>
      </div>
    );
  }

  if (!result?.matched) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <p className="text-xl mb-4">{result?.message}</p>
        {result?.suggestions && (
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {result.suggestions.map((s) => (
              <Link
                key={s}
                href={`/result?q=${encodeURIComponent(s)}`}
                className="bg-card border border-theme rounded-full px-4 py-2 text-sm text-muted hover:text-accent hover:border-accent/50 transition-all"
              >
                {s}
              </Link>
            ))}
          </div>
        )}
        <Link href="/" className="text-accent hover:underline mt-8 inline-block">
          Try again
        </Link>
      </div>
    );
  }

  const primaryEvent = result.seerah?.[0];

  return (
    <div className="animate-slide-up space-y-8">
      {/* Emotion tag */}
      <div className="text-center">
        <span className="inline-block bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-medium">
          {result.emotion}
        </span>
        {result.tags && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-2">
            {result.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-card border border-theme rounded-full px-3 py-1 text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* LLM Guidance — the main content */}
      {guidanceLoading ? (
        <div className="bg-card border border-theme rounded-2xl p-6 md:p-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[var(--color-border)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--color-border)] rounded w-full"></div>
            <div className="h-4 bg-[var(--color-border)] rounded w-5/6"></div>
            <div className="h-4 bg-[var(--color-border)] rounded w-2/3"></div>
          </div>
          <p className="text-xs text-muted mt-4 text-center">Reflecting on your situation...</p>
        </div>
      ) : guidance ? (
        <div className="bg-card border border-theme rounded-2xl p-6 md:p-8">
          <p className="text-base md:text-lg leading-relaxed text-[var(--color-text)] whitespace-pre-line">
            {guidance}
          </p>
        </div>
      ) : null}

      {/* Quran Verse — reference card */}
      {result.verse && <VerseCard verse={result.verse} />}

      {/* Seerah Story — reference card */}
      {primaryEvent && <EventReference event={primaryEvent} />}

      {/* Other seerah stories */}
      {result.seerah && result.seerah.length > 1 && (
        <div>
          <h3 className="font-heading text-base font-semibold mb-3 text-center text-muted">
            More stories that connect
          </h3>
          <div className="space-y-3">
            {result.seerah.slice(1).map((event, i) => (
              <Link
                key={event.event_id || i}
                href={`/event/${event.event_id}`}
                className="block bg-card border border-theme rounded-xl p-4 hover:border-accent/30 transition-all group"
              >
                <h4 className="font-heading text-sm font-semibold group-hover:text-accent transition-colors">
                  {event.event_title}
                </h4>
                <p className="text-xs text-muted mt-1">
                  {event.event_description?.substring(0, 120)}...
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Try another */}
      <div className="text-center pt-4">
        <Link href="/" className="text-accent hover:underline text-sm">
          ← Share something else
        </Link>
      </div>
    </div>
  );
}

function VerseCard({ verse }: { verse: QuranVerse }) {
  return (
    <div className="bg-card border border-theme rounded-2xl p-5 md:p-6">
      <div className="text-center mb-3">
        <span className="text-xs text-muted uppercase tracking-wider">
          Quran {verse.verse_key}
        </span>
      </div>
      <p
        className="font-arabic text-xl md:text-2xl leading-loose text-verse text-center mb-4"
        dir="rtl"
      >
        {verse.arabic}
      </p>
      <p className="text-sm md:text-base text-center text-[var(--color-text)] leading-relaxed mb-3 italic">
        &ldquo;{verse.translation}&rdquo;
      </p>
      <div className="text-center">
        <span className="text-xs text-muted">{verse.resource}</span>
        <span className="text-xs text-muted mx-2">·</span>
        <a
          href={verse.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline"
        >
          Read on Quran.com ↗
        </a>
      </div>
    </div>
  );
}

function EventReference({ event }: { event: SeerahEvent }) {
  const periodLabels: Record<string, string> = {
    pre_hijrah_makkah: "Meccan Period",
    hijrah: "The Hijrah",
    madinah: "Madinah Period",
    farewell: "Farewell Era",
  };

  return (
    <Link
      href={`/event/${event.event_id}`}
      className="block bg-card border border-theme rounded-2xl p-5 hover:border-accent/30 transition-all group"
    >
      <span className="text-xs text-accent font-medium">
        {periodLabels[event.event_period] || event.event_period}
        {event.event_year_label && ` · ${event.event_year_label}`}
      </span>
      <h3 className="font-heading text-base font-semibold mt-1 group-hover:text-accent transition-colors">
        {event.event_title}
      </h3>
      {event.event_title_ar && (
        <p className="font-arabic text-sm text-verse mt-1" dir="rtl">
          {event.event_title_ar}
        </p>
      )}
      {event.event_lessons && (
        <p className="text-xs text-muted mt-2 leading-relaxed">
          {event.event_lessons}
        </p>
      )}
      <p className="text-xs text-accent mt-2 group-hover:underline">
        Read full story →
      </p>
    </Link>
  );
}
