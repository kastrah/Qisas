/**
 * QISAS — Emotion → Verse → Story Engine
 * 
 * Flow:
 * 1. User shares what they're going through
 * 2. Match emotion to theme tags (using emotion_tag_map.json)
 * 3. Fetch relevant Quran verse from api.quran.com
 * 4. Fetch matching seerah event from Supabase
 * 5. Return unified response
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zotiumqmmsuokbnsvmgr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Emotion-to-tag mapping (inline for portability, or load from emotion_tag_map.json)
const EMOTION_MAP = [
  { emotion: "grief", aliases: ["loss", "mourning", "sadness", "lost someone", "died", "passed away", "grieving", "bereaved", "funeral", "miss them", "death"], tags: ["sabr", "sabr_jamil", "tawakkul"], quranTerms: ["patience", "loss", "grief", "death"] },
  { emotion: "anxiety", aliases: ["scared", "anxious", "worried", "fear", "uncertain", "future", "panic", "overwhelmed", "stressed", "nervous", "afraid"], tags: ["tawakkul", "taqwa", "sabr"], quranTerms: ["fear", "anxiety", "trust in Allah", "do not despair"] },
  { emotion: "anger", aliases: ["angry", "unfair", "injustice", "oppression", "betrayed", "furious", "rage", "frustrated", "wronged"], tags: ["adl", "sabr", "courage"], quranTerms: ["justice", "patience", "oppression", "restraint"] },
  { emotion: "loneliness", aliases: ["alone", "lonely", "isolated", "abandoned", "no one", "nobody cares", "left out", "excluded"], tags: ["brotherhood", "muwasat", "karam"], quranTerms: ["brotherhood", "Allah is with you", "companionship"] },
  { emotion: "failure", aliases: ["failing", "doubt", "not good enough", "hopeless", "worthless", "useless", "inadequate", "failure"], tags: ["sabr", "tawakkul", "ikhlas"], quranTerms: ["despair", "hope", "Allah mercy", "never give up"] },
  { emotion: "gratitude", aliases: ["grateful", "happy", "blessed", "thankful", "content", "alhamdulillah", "appreciative", "joyful"], tags: ["shukr", "tawadu", "taqwa"], quranTerms: ["gratitude", "thankful", "blessings"] },
  { emotion: "family", aliases: ["marriage", "divorce", "parent", "child", "family", "spouse", "husband", "wife", "mother", "father", "kids"], tags: ["family", "sabr", "adl"], quranTerms: ["family", "marriage", "parents", "children"] },
  { emotion: "purpose", aliases: ["lost", "purpose", "direction", "meaning", "why am I here", "what's the point", "empty", "void"], tags: ["ikhlas", "tawhid", "taqwa"], quranTerms: ["purpose of creation", "meaning of life", "worship"] },
  { emotion: "temptation", aliases: ["sin", "temptation", "mistake", "guilty", "shame", "wrongdoing", "regret"], tags: ["taqwa", "ikhlas", "forgiveness"], quranTerms: ["repentance", "forgiveness", "Allah forgives", "mercy"] },
  { emotion: "persecution", aliases: ["persecuted", "oppressed", "bullied", "targeted", "discriminated", "hated", "attacked"], tags: ["sabr", "sabr_jamil", "courage"], quranTerms: ["persecution", "patience", "Allah is with the patient"] },
  { emotion: "wealth", aliases: ["money", "rich", "poor", "greed", "poverty", "wealth", "debt", "financial", "broke"], tags: ["karam", "tawakkul", "tawadu"], quranTerms: ["wealth", "charity", "provision", "Allah provides"] },
  { emotion: "mortality", aliases: ["dying", "death", "afterlife", "what happens", "mortality", "hereafter", "akhira"], tags: ["taqwa", "tawhid", "sabr"], quranTerms: ["death", "afterlife", "hereafter", "paradise"] },
  { emotion: "community", aliases: ["community", "friends", "belonging", "ummah", "together", "solidarity", "support"], tags: ["brotherhood", "muwasat", "equality"], quranTerms: ["brotherhood", "believers are brothers", "unity"] },
  { emotion: "leadership", aliases: ["leader", "responsibility", "decision", "authority", "boss", "managing", "team"], tags: ["leadership", "shura", "adl", "amanah"], quranTerms: ["leadership", "consultation", "justice", "trust"] },
  { emotion: "change", aliases: ["moving", "new place", "leaving", "change", "starting over", "transition", "relocation"], tags: ["migration", "tawakkul", "sabr"], quranTerms: ["migration", "Allah earth is spacious", "new beginning"] },
  { emotion: "forgiveness", aliases: ["forgive", "forgave", "can't forgive", "grudge", "bitter", "resentment", "let go"], tags: ["forgiveness", "mercy", "sabr"], quranTerms: ["forgiveness", "pardon", "mercy", "Allah loves the forgivers"] },
  { emotion: "justice", aliases: ["justice", "fair", "accountability", "rights", "equality", "equity", "wronged", "unjust"], tags: ["adl", "huquq", "shura"], quranTerms: ["justice", "fairness", "stand for justice", "rights"] },
  { emotion: "sacrifice", aliases: ["sacrifice", "giving up", "hard choice", "dunya", "letting go", "trade-off"], tags: ["sacrifice", "ikhlas", "tawakkul"], quranTerms: ["sacrifice", "sincerity", "Allah compensates"] },
  { emotion: "dawah", aliases: ["sharing Islam", "calling others", "dawah", "message", "spread the word", "invite", "convey"], tags: ["da_wah", "wisdom", "sabr_jamil"], quranTerms: ["invite to Allah", "wisdom", "beautiful preaching"] },
  { emotion: "conflict", aliases: ["war", "battle", "fight", "conflict", "enemy", "attack", "defense", "struggle"], tags: ["jihad", "courage", "tawakkul"], quranTerms: ["struggle", "fight in Allah way", "victory", "courage"] },
];

/**
 * Step 1: Match user input to emotions/tags
 */
function matchEmotion(userInput) {
  const input = userInput.toLowerCase();
  const matches = [];

  for (const entry of EMOTION_MAP) {
    let score = 0;
    
    // Check aliases
    for (const alias of entry.aliases) {
      if (input.includes(alias.toLowerCase())) {
        score = Math.max(score, 0.9);
      }
    }
    
    // Check emotion name
    if (input.includes(entry.emotion)) {
      score = Math.max(score, 1.0);
    }

    if (score > 0) {
      matches.push({ ...entry, score });
    }
  }

  // Sort by score, take top 3
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3);
}

/**
 * Step 2: Fetch Quran verse from api.quran.com
 */
async function fetchQuranVerse(searchTerm, translationId = 131) {
  try {
    const url = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(searchTerm)}&language=en&size=3&translations=${translationId}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.search?.results?.length > 0) {
      const verse = data.search.results[0];
      return {
        verse_key: verse.verse_key,
        arabic: verse.text || '',
        translation: verse.translations?.[0]?.text || '',
        resource: verse.translations?.[0]?.name || '',
      };
    }
    return null;
  } catch (err) {
    console.error('Quran API error:', err);
    return null;
  }
}

/**
 * Step 3: Fetch seerah events from Supabase
 */
async function fetchSeerahEvents(tagSlugs) {
  try {
    const { data, error } = await supabase.rpc('get_events_by_tags', {
      tag_slugs: tagSlugs
    });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Supabase error:', err);
    return [];
  }
}

/**
 * Main Qisas flow: emotion → verse + story
 */
async function qisasLookup(userInput) {
  // Step 1: Match emotion
  const emotions = matchEmotion(userInput);
  
  if (emotions.length === 0) {
    return {
      input: userInput,
      matched: false,
      message: "I couldn't identify a specific emotion. Try describing how you feel — for example: 'I'm grieving', 'I feel lost', 'I'm struggling with patience'.",
      suggestions: ["grief", "anxiety", "loneliness", "failure", "gratitude", "purpose"]
    };
  }

  // Collect all tag slugs and quran terms
  const allTags = [...new Set(emotions.flatMap(e => e.tags))];
  const allQuranTerms = [...new Set(emotions.flatMap(e => e.quranTerms))];

  // Step 2: Fetch Quran verse (try first term, fall back to others)
  let verse = null;
  for (const term of allQuranTerms) {
    verse = await fetchQuranVerse(term);
    if (verse) break;
  }

  // Step 3: Fetch seerah events
  const events = await fetchSeerahEvents(allTags);

  // Step 4: Build response
  const primaryEmotion = emotions[0];
  
  return {
    input: userInput,
    matched: true,
    emotion: primaryEmotion.emotion,
    tags: allTags,
    verse: verse ? {
      reference: verse.verse_key,
      arabic: verse.arabic,
      translation: verse.translation.replace(/<[^>]*>/g, ''), // strip HTML tags
      source: verse.resource,
      link: `https://quran.com/${verse.verse_key.replace(':', '/')}`
    } : null,
    seerah: events.slice(0, 3).map(e => ({
      title: e.event_title,
      title_ar: e.event_title_ar,
      period: e.event_period,
      year: e.event_year_label,
      description: e.event_description?.substring(0, 300),
      lessons: e.event_lessons,
      location: e.location_name,
      themes: e.matched_tags,
      is_major: e.event_is_major,
      hadiths: (e.hadith_refs || []).slice(0, 2).map(h => ({
        narrator: h.narrator,
        text: h.text_en?.substring(0, 200),
        url: h.url
      }))
    })),
    all_emotions: emotions.map(e => ({
      emotion: e.emotion,
      tags: e.tags,
      score: e.score
    }))
  };
}

// Export for use in app/API
export { qisasLookup, matchEmotion, fetchQuranVerse, fetchSeerahEvents, EMOTION_MAP };
