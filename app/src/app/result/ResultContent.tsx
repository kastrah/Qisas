"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { qisasLookup, QisasResult, SeerahEvent, QuranVerse } from "@/lib/qisas-engine";

export default function ResultContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [result, setResult] = useState<QisasResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    qisasLookup(query).then((r) => {
      setResult(r);
      setLoading(false);
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

      {/* Quran Verse */}
      {result.verse && <VerseCard verse={result.verse} />}

      {/* Seerah Stories */}
      {result.seerah && result.seerah.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-semibold mb-4 text-center">
            From the Prophet&apos;s life ﷺ
          </h2>
          <div className="space-y-4">
            {result.seerah.map((event, i) => (
              <EventCard key={event.event_id || i} event={event} />
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
    <div className="bg-card border border-theme rounded-2xl p-6 md:p-8">
      <div className="text-center mb-4">
        <span className="text-xs text-muted uppercase tracking-wider">
          Quran {verse.verse_key}
        </span>
      </div>
      <p
        className="font-arabic text-2xl md:text-3xl leading-loose text-verse text-center mb-6"
        dir="rtl"
      >
        {verse.arabic}
      </p>
      <p className="text-base md:text-lg text-center text-[var(--color-text)] leading-relaxed mb-4 italic">
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

function EventCard({ event }: { event: SeerahEvent }) {
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
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs text-accent font-medium">
            {periodLabels[event.event_period] || event.event_period}
            {event.event_year_label && ` · ${event.event_year_label}`}
          </span>
          {event.event_is_major && (
            <span className="ml-2 text-xs bg-accent/10 text-accent rounded-full px-2 py-0.5">
              Major Event
            </span>
          )}
        </div>
      </div>
      <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
        {event.event_title}
      </h3>
      {event.event_title_ar && (
        <p className="font-arabic text-base text-verse mb-2" dir="rtl">
          {event.event_title_ar}
        </p>
      )}
      <p className="text-sm text-muted leading-relaxed mb-3">
        {event.event_description?.substring(0, 200)}
        {event.event_description && event.event_description.length > 200 && "..."}
      </p>
      {event.event_lessons && (
        <div className="bg-[var(--color-bg)] rounded-lg p-3 mb-3">
          <p className="text-xs text-muted font-medium mb-1">Lessons</p>
          <p className="text-sm text-[var(--color-text)] leading-relaxed">
            {event.event_lessons}
          </p>
        </div>
      )}
      {event.location_name && (
        <p className="text-xs text-muted">📍 {event.location_name}</p>
      )}
      {event.matched_tags && event.matched_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {event.matched_tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-accent/5 border border-accent/20 rounded-full px-2.5 py-0.5 text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {event.hadith_refs && event.hadith_refs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-theme">
          <p className="text-xs text-muted font-medium mb-1">
            📖 {event.hadith_refs[0].collection} #{event.hadith_refs[0].hadith_number}
          </p>
          <p className="text-xs text-muted leading-relaxed">
            {event.hadith_refs[0].text_en?.substring(0, 150)}
            {event.hadith_refs[0].text_en && event.hadith_refs[0].text_en.length > 150 && "..."}
          </p>
        </div>
      )}
      <p className="text-xs text-accent mt-3 group-hover:underline">Read full story →</p>
    </Link>
  );
}
