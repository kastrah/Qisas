"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface EventDetail {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  period: string;
  year_approx: number;
  year_label: string;
  significance: string;
  lessons: string;
  is_major_event: boolean;
  location: {
    name_en: string;
    name_ar: string;
    modern_name: string;
    latitude: number;
    longitude: number;
  } | null;
  tags: { slug: string; name_en: string }[];
  hadiths: {
    collection: string;
    hadith_number: string;
    narrator: string;
    text_en: string;
    text_ar: string;
    url: string;
  }[];
}

export default function EventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    fetchEvent(eventId);
  }, [eventId]);

  async function fetchEvent(id: string) {
    try {
      // Fetch event
      const { data: ev, error } = await supabase
        .from("seerah_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !ev) {
        setLoading(false);
        return;
      }

      // Fetch location
      let location = null;
      if (ev.location_id) {
        const { data: loc } = await supabase
          .from("seerah_locations")
          .select("*")
          .eq("id", ev.location_id)
          .single();
        location = loc;
      }

      // Fetch tags
      const { data: tagLinks } = await supabase
        .from("seerah_event_tags")
        .select("tag_id")
        .eq("event_id", id);

      let tags: { slug: string; name_en: string }[] = [];
      if (tagLinks && tagLinks.length > 0) {
        const tagIds = tagLinks.map((t) => t.tag_id);
        const { data: tagData } = await supabase
          .from("seerah_tags")
          .select("slug, name_en")
          .in("id", tagIds);
        tags = tagData || [];
      }

      // Fetch hadiths
      const { data: sourceLinks } = await supabase
        .from("seerah_event_sources")
        .select("source_id, relevance")
        .eq("event_id", id)
        .limit(10);

      let hadiths: EventDetail["hadiths"] = [];
      if (sourceLinks && sourceLinks.length > 0) {
        const sourceIds = sourceLinks.map((s) => s.source_id);
        const { data: sourceData } = await supabase
          .from("seerah_sources")
          .select("*")
          .in("id", sourceIds);
        hadiths = (sourceData || []).map((s) => ({
          collection: s.collection,
          hadith_number: s.hadith_number,
          narrator: s.notes,
          text_en: s.text_en,
          text_ar: s.text_ar,
          url: s.url,
        }));
      }

      setEvent({
        ...ev,
        location,
        tags,
        hadiths,
      });
    } catch (err) {
      console.error("Error fetching event:", err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-pulse-soft text-4xl mb-4">🌙</div>
        <p className="text-muted">Loading story...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Event not found.</p>
        <Link href="/" className="text-accent hover:underline mt-4 inline-block">
          Go back
        </Link>
      </div>
    );
  }

  const periodLabels: Record<string, string> = {
    pre_hijrah_makkah: "Meccan Period",
    hijrah: "The Hijrah",
    madinah: "Madinah Period",
    farewell: "Farewell Era",
  };

  return (
    <div className="animate-slide-up space-y-8">
      {/* Breadcrumb */}
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Back
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-accent font-medium">
            {periodLabels[event.period]}
            {event.year_label && ` · ${event.year_label}`}
          </span>
          {event.is_major_event && (
            <span className="text-xs bg-accent/10 text-accent rounded-full px-2 py-0.5">
              Major Event
            </span>
          )}
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          {event.title_en}
        </h1>
        {event.title_ar && (
          <p className="font-arabic text-xl text-verse" dir="rtl">
            {event.title_ar}
          </p>
        )}
      </div>

      {/* Tags */}
      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span
              key={tag.slug}
              className="text-sm bg-accent/5 border border-accent/20 rounded-full px-3 py-1 text-accent"
            >
              {tag.name_en}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {event.description_en && (
        <div className="bg-card border border-theme rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold mb-3">The Story</h2>
          <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-line">
            {event.description_en}
          </p>
        </div>
      )}

      {/* Significance */}
      {event.significance && (
        <div className="bg-card border border-theme rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold mb-3">Why It Matters</h2>
          <p className="text-[var(--color-text)] leading-relaxed">
            {event.significance}
          </p>
        </div>
      )}

      {/* Lessons */}
      {event.lessons && (
        <div className="bg-card border border-theme rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold mb-3">Lessons</h2>
          <p className="text-[var(--color-text)] leading-relaxed">
            {event.lessons}
          </p>
        </div>
      )}

      {/* Location */}
      {event.location && (
        <div className="bg-card border border-theme rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold mb-3">📍 Location</h2>
          <p className="text-[var(--color-text)]">
            {event.location.name_en}
            {event.location.name_ar && (
              <span className="font-arabic text-verse mr-2"> — {event.location.name_ar}</span>
            )}
          </p>
          {event.location.modern_name && (
            <p className="text-sm text-muted mt-1">
              Modern: {event.location.modern_name}
            </p>
          )}
          {event.location.latitude && (
            <a
              href={`https://www.google.com/maps?q=${event.location.latitude},${event.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline mt-2 inline-block"
            >
              View on map ↗
            </a>
          )}
        </div>
      )}

      {/* Hadiths */}
      {event.hadiths.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4">
            📖 Hadith References
          </h2>
          <div className="space-y-4">
            {event.hadiths.map((h, i) => (
              <div
                key={i}
                className="bg-card border border-theme rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-accent font-medium">
                    {h.collection} #{h.hadith_number}
                  </span>
                  {h.url && (
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
                    >
                      Sunnah.com ↗
                    </a>
                  )}
                </div>
                {h.narrator && (
                  <p className="text-sm text-muted mb-2 italic">{h.narrator}</p>
                )}
                {h.text_ar && (
                  <p
                    className="font-arabic text-lg text-verse leading-loose mb-3"
                    dir="rtl"
                  >
                    {h.text_ar.substring(0, 300)}
                    {h.text_ar.length > 300 && "..."}
                  </p>
                )}
                {h.text_en && (
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">
                    {h.text_en.substring(0, 400)}
                    {h.text_en.length > 400 && "..."}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back */}
      <div className="text-center pt-4">
        <Link href="/" className="text-accent hover:underline text-sm">
          ← Share something else
        </Link>
      </div>
    </div>
  );
}
