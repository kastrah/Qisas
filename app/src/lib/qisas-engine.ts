// Qisas Engine — Emotion → Tag → Verse + Story
// Client-side emotion matching, Supabase event fetch, Quran API verse fetch

export interface EmotionMatch {
  emotion: string;
  tags: string[];
  quranTerms: string[];
  score: number;
}

export interface QuranVerse {
  verse_key: string;
  arabic: string;
  translation: string;
  resource: string;
  link: string;
}

export interface HadithRef {
  collection: string;
  hadith_number: string;
  narrator: string;
  text_en: string;
  text_ar: string;
  url: string;
  relevance: string;
}

export interface SeerahEvent {
  event_id: string;
  event_title: string;
  event_title_ar: string;
  event_description: string;
  event_period: string;
  event_year_label: string;
  event_significance: string;
  event_lessons: string;
  event_is_major: boolean;
  location_name: string;
  location_lat: number;
  location_lng: number;
  matched_tags: string[];
  hadith_refs: HadithRef[];
}

export interface QisasResult {
  input: string;
  matched: boolean;
  emotion?: string;
  tags?: string[];
  verse?: QuranVerse;
  seerah?: SeerahEvent[];
  message?: string;
  suggestions?: string[];
}

// Emotion mapping — aliases map user language to emotion categories
const EMOTION_MAP: { emotion: string; aliases: string[]; tags: string[]; quranTerms: string[] }[] = [
  { emotion: "grief", aliases: ["loss", "mourning", "sadness", "lost someone", "died", "passed away", "grieving", "bereaved", "funeral", "miss them", "lost", "losing", "miss", "death"], tags: ["sabr", "sabr_jamil", "tawakkul"], quranTerms: ["patience", "loss", "grief"] },
  { emotion: "anxiety", aliases: ["scared", "anxious", "worried", "fear", "uncertain", "future", "panic", "overwhelmed", "stressed", "nervous", "afraid", "worry"], tags: ["tawakkul", "taqwa", "sabr"], quranTerms: ["fear", "trust in Allah", "do not despair"] },
  { emotion: "anger", aliases: ["angry", "unfair", "injustice", "oppression", "betrayed", "furious", "rage", "frustrated", "wronged"], tags: ["adl", "sabr", "courage"], quranTerms: ["justice", "patience", "oppression"] },
  { emotion: "loneliness", aliases: ["alone", "lonely", "isolated", "abandoned", "no one", "nobody cares", "left out", "excluded"], tags: ["brotherhood", "muwasat", "karam"], quranTerms: ["brotherhood", "Allah is with you"] },
  { emotion: "failure", aliases: ["failing", "doubt", "not good enough", "hopeless", "worthless", "useless", "inadequate", "failure", "failing"], tags: ["sabr", "tawakkul", "ikhlas"], quranTerms: ["despair", "hope", "Allah mercy"] },
  { emotion: "gratitude", aliases: ["grateful", "happy", "blessed", "thankful", "content", "alhamdulillah", "appreciative", "joyful"], tags: ["shukr", "tawadu", "taqwa"], quranTerms: ["gratitude", "thankful", "blessings"] },
  { emotion: "family", aliases: ["marriage", "divorce", "parent", "child", "family", "spouse", "husband", "wife", "mother", "father", "kids", "son", "daughter"], tags: ["family", "sabr", "adl"], quranTerms: ["family", "marriage", "parents", "children"] },
  { emotion: "purpose", aliases: ["purpose", "direction", "meaning", "why am I here", "what's the point", "empty", "void", "existential"], tags: ["ikhlas", "tawhid", "taqwa"], quranTerms: ["purpose of creation", "meaning of life"] },
  { emotion: "temptation", aliases: ["sin", "temptation", "mistake", "guilty", "shame", "wrongdoing", "regret"], tags: ["taqwa", "ikhlas", "forgiveness"], quranTerms: ["repentance", "forgiveness", "Allah forgives"] },
  { emotion: "persecution", aliases: ["persecuted", "oppressed", "bullied", "targeted", "discriminated", "hated", "attacked"], tags: ["sabr", "sabr_jamil", "courage"], quranTerms: ["persecution", "patience", "Allah is with the patient"] },
  { emotion: "wealth", aliases: ["money", "rich", "poor", "greed", "poverty", "wealth", "debt", "financial", "broke"], tags: ["karam", "tawakkul", "tawadu"], quranTerms: ["wealth", "charity", "provision"] },
  { emotion: "mortality", aliases: ["dying", "afterlife", "what happens", "mortality", "hereafter", "akhira"], tags: ["taqwa", "tawhid", "sabr"], quranTerms: ["death", "afterlife", "hereafter", "paradise"] },
  { emotion: "community", aliases: ["community", "friends", "belonging", "ummah", "together", "solidarity", "support"], tags: ["brotherhood", "muwasat", "equality"], quranTerms: ["brotherhood", "believers are brothers", "unity"] },
  { emotion: "leadership", aliases: ["leader", "responsibility", "decision", "authority", "boss", "managing", "team"], tags: ["leadership", "shura", "adl", "amanah"], quranTerms: ["leadership", "consultation", "justice"] },
  { emotion: "change", aliases: ["moving", "new place", "leaving", "change", "starting over", "transition", "relocation"], tags: ["migration", "tawakkul", "sabr"], quranTerms: ["migration", "Allah earth is spacious"] },
  { emotion: "forgiveness", aliases: ["forgive", "forgave", "can't forgive", "grudge", "bitter", "resentment", "let go"], tags: ["forgiveness", "mercy", "sabr"], quranTerms: ["forgiveness", "pardon", "mercy"] },
  { emotion: "justice", aliases: ["justice", "fair", "accountability", "rights", "equity", "unjust"], tags: ["adl", "huquq", "shura"], quranTerms: ["justice", "fairness", "stand for justice"] },
  { emotion: "sacrifice", aliases: ["sacrifice", "giving up", "hard choice", "letting go", "trade-off"], tags: ["sacrifice", "ikhlas", "tawakkul"], quranTerms: ["sacrifice", "sincerity", "Allah compensates"] },
  { emotion: "dawah", aliases: ["sharing Islam", "calling others", "dawah", "message", "spread the word", "invite", "convey"], tags: ["da_wah", "wisdom", "sabr_jamil"], quranTerms: ["invite to Allah", "wisdom", "beautiful preaching"] },
  { emotion: "conflict", aliases: ["war", "battle", "fight", "conflict", "enemy", "attack", "struggle"], tags: ["jihad", "courage", "tawakkul"], quranTerms: ["struggle", "fight in Allah way", "victory"] },
];

/**
 * Step 1: Match user input to emotions
 */
export function matchEmotion(userInput: string): EmotionMatch[] {
  const input = userInput.toLowerCase();
  const matches: EmotionMatch[] = [];

  for (const entry of EMOTION_MAP) {
    let score = 0;
    for (const alias of entry.aliases) {
      if (input.includes(alias.toLowerCase())) {
        score = Math.max(score, 0.9);
      }
    }
    if (input.includes(entry.emotion)) {
      score = Math.max(score, 1.0);
    }
    if (score > 0) {
      matches.push({ ...entry, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3);
}

/**
 * Step 2: Fetch Quran verse from api.quran.com
 */
export async function fetchQuranVerse(
  searchTerm: string,
  translationId: number = 131
): Promise<QuranVerse | null> {
  try {
    const url = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(
      searchTerm
    )}&language=en&size=3&translations=${translationId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.search?.results?.length > 0) {
      const verse = data.search.results[0];
      return {
        verse_key: verse.verse_key,
        arabic: verse.text || "",
        translation: (verse.translations?.[0]?.text || "").replace(/<[^>]*>/g, ""),
        resource: verse.translations?.[0]?.name || "",
        link: `https://quran.com/${verse.verse_key.replace(":", "/")}`,
      };
    }
    return null;
  } catch (err) {
    console.error("Quran API error:", err);
    return null;
  }
}

/**
 * Step 3: Fetch seerah events from Supabase
 */
export async function fetchSeerahEvents(
  tagSlugs: string[]
): Promise<SeerahEvent[]> {
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase.rpc("get_events_by_tags", {
      tag_slugs: tagSlugs,
    });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase error:", err);
    return [];
  }
}

/**
 * Main Qisas flow: emotion → verse + story
 */
export async function qisasLookup(userInput: string): Promise<QisasResult> {
  const emotions = matchEmotion(userInput);

  if (emotions.length === 0) {
    return {
      input: userInput,
      matched: false,
      message:
        "I couldn't identify a specific emotion. Try describing how you feel — for example: 'I'm grieving', 'I feel lost', 'I'm struggling with patience'.",
      suggestions: ["grief", "anxiety", "loneliness", "failure", "gratitude", "purpose"],
    };
  }

  const allTags = [...new Set(emotions.flatMap((e) => e.tags))];
  const allQuranTerms = [...new Set(emotions.flatMap((e) => e.quranTerms))];

  // Fetch Quran verse (try terms in order)
  let verse: QuranVerse | null = null;
  for (const term of allQuranTerms) {
    verse = await fetchQuranVerse(term);
    if (verse) break;
  }

  // Fetch seerah events
  const events = await fetchSeerahEvents(allTags);

  const primaryEmotion = emotions[0];

  return {
    input: userInput,
    matched: true,
    emotion: primaryEmotion.emotion,
    tags: allTags,
    verse: verse
      ? {
          verse_key: verse.verse_key,
          arabic: verse.arabic,
          translation: verse.translation,
          resource: verse.resource,
          link: verse.link,
        }
      : undefined,
    seerah: events.slice(0, 3),
  };
}
