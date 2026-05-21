/**
 * Qisas Engine — Test Script
 * Run: node --experimental-fetch qisas_engine.test.js
 */

const SUPABASE_URL = 'https://zotiumqmmsuokbnsvmgr.supabase.co';

// Inline emotion map for testing without Supabase
const EMOTION_MAP = [
  { emotion: "grief", aliases: ["loss", "mourning", "sadness", "lost someone", "died", "passed away", "grieving", "bereaved"], tags: ["sabr", "sabr_jamil", "tawakkul"], quranTerms: ["patience", "loss", "grief"] },
  { emotion: "anxiety", aliases: ["scared", "anxious", "worried", "fear", "uncertain", "future", "panic", "overwhelmed"], tags: ["tawakkul", "taqwa", "sabr"], quranTerms: ["fear", "trust in Allah", "do not despair"] },
  { emotion: "failure", aliases: ["failing", "doubt", "not good enough", "hopeless", "worthless", "failure"], tags: ["sabr", "tawakkul", "ikhlas"], quranTerms: ["despair", "hope", "Allah mercy"] },
  { emotion: "loneliness", aliases: ["alone", "lonely", "isolated", "abandoned", "no one"], tags: ["brotherhood", "muwasat", "karam"], quranTerms: ["brotherhood", "Allah is with you"] },
  { emotion: "anger", aliases: ["angry", "unfair", "injustice", "oppression", "betrayed"], tags: ["adl", "sabr", "courage"], quranTerms: ["justice", "patience", "oppression"] },
  { emotion: "gratitude", aliases: ["grateful", "happy", "blessed", "thankful", "content"], tags: ["shukr", "tawadu", "taqwa"], quranTerms: ["gratitude", "thankful", "blessings"] },
  { emotion: "purpose", aliases: ["lost", "purpose", "direction", "meaning", "why am I here", "empty"], tags: ["ikhlas", "tawhid", "taqwa"], quranTerms: ["purpose of creation", "meaning of life"] },
  { emotion: "forgiveness", aliases: ["forgive", "can't forgive", "grudge", "resentment"], tags: ["forgiveness", "mercy", "sabr"], quranTerms: ["forgiveness", "pardon", "mercy"] },
];

function matchEmotion(userInput) {
  const input = userInput.toLowerCase();
  const matches = [];
  for (const entry of EMOTION_MAP) {
    let score = 0;
    for (const alias of entry.aliases) {
      if (input.includes(alias.toLowerCase())) score = Math.max(score, 0.9);
    }
    if (input.includes(entry.emotion)) score = Math.max(score, 1.0);
    if (score > 0) matches.push({ ...entry, score });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3);
}

async function fetchQuranVerse(searchTerm) {
  const url = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(searchTerm)}&language=en&size=1&translations=131`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.search?.results?.length > 0) {
    const v = data.search.results[0];
    return {
      key: v.verse_key,
      arabic: v.text || '',
      translation: (v.translations?.[0]?.text || '').replace(/<[^>]*>/g, ''),
      link: `https://quran.com/${v.verse_key.replace(':', '/')}`
    };
  }
  return null;
}

// Test cases
const testInputs = [
  "I lost my mother last month and I can't stop crying",
  "I feel like a failure, nothing I do works out",
  "I'm scared about my future, everything is uncertain",
  "I feel so alone, nobody understands me",
  "I'm so grateful for everything Allah has given me",
  "I can't forgive what they did to me",
  "I don't know why I'm here, what's the point of all this",
  "Someone wronged me and I'm so angry"
];

async function runTests() {
  console.log("═══════════════════════════════════════");
  console.log("  QISAS ENGINE — Test Run");
  console.log("═══════════════════════════════════════\n");

  for (const input of testInputs) {
    console.log(`💬 "${input}"`);
    
    const emotions = matchEmotion(input);
    if (emotions.length === 0) {
      console.log("  ❌ No emotion matched\n");
      continue;
    }

    const primary = emotions[0];
    const tags = [...new Set(emotions.flatMap(e => e.tags))];
    console.log(`  🏷️  Emotion: ${primary.emotion} | Tags: ${tags.join(', ')}`);

    // Fetch verse for first quran term
    let verse = null;
    for (const term of primary.quranTerms) {
      verse = await fetchQuranVerse(term);
      if (verse) break;
    }

    if (verse) {
      console.log(`  📖 ${verse.key} — ${verse.translation.substring(0, 120)}...`);
      console.log(`  🔗 ${verse.link}`);
    } else {
      console.log("  📖 No verse found");
    }
    
    console.log();
    
    // Small delay to respect API rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log("═══════════════════════════════════════");
  console.log("  Test complete");
  console.log("═══════════════════════════════════════");
}

runTests().catch(console.error);
