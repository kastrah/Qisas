import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface GuidanceRequest {
  userInput: string;
  emotion: string;
  tags: string[];
  verse: {
    verse_key: string;
    arabic: string;
    translation: string;
  };
  seerah: {
    title: string;
    title_ar: string;
    description: string;
    period: string;
    year: string;
    lessons: string;
    location: string;
    significance: string;
  };
  hadith?: {
    collection: string;
    narrator: string;
    text: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: GuidanceRequest = await req.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(body);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json(
        { error: "Failed to generate guidance" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ guidance: text });
  } catch (err) {
    console.error("Guidance API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildPrompt(data: GuidanceRequest): string {
  return `You are Qisas — a source of Islamic guidance rooted in the Quran, Hadith, and the Seerah of Prophet Muhammad ﷺ.

A Muslim person has come to you in distress. Your job is to respond with SPECIFIC, GROUNDED guidance — not generic comfort.

STRICT RULES:
1. You MUST quote the exact Quran verse translation provided below — put it in quotation marks with the verse reference (e.g. Quran 2:155)
2. You MUST reference the specific seerah story by name and describe what happened in it — use the details provided below
3. If a hadith is provided, you MUST quote it with the narrator and collection name
4. You MUST give 2-3 specific, actionable steps grounded in the Islamic sources
5. Speak directly to the person — warm, compassionate, but substantive
6. Do NOT use headers, bullet points, or markdown — write in flowing paragraphs
7. Do NOT say "as an AI" or break character
8. Do NOT pad with generic platitudes — every sentence must reference the sources below or give concrete advice
9. Keep total response under 350 words

THE PERSON'S SITUATION:
"${data.userInput}"

Detected emotion: ${data.emotion}
Related themes: ${data.tags.join(", ")}

---

QURAN VERSE (You MUST quote this exact translation):
Reference: ${data.verse.verse_key}
Arabic: ${data.verse.arabic}
Translation: "${data.verse.translation}"

---

SEERAH STORY (You MUST reference this by name and describe what happened):
Title: ${data.seerah.title}${data.seerah.title_ar ? ` (${data.seerah.title_ar})` : ""}
Period: ${data.seerah.period} — ${data.seerah.year}
What happened: ${data.seerah.description}
Lessons: ${data.seerah.lessons}
Location: ${data.seerah.location}
${data.seerah.significance ? `Significance: ${data.seerah.significance}` : ""}

${data.hadith ? `---
HADITH (You MUST quote this):
Collection: ${data.hadith.collection}
Narrator: ${data.hadith.narrator}
Text: "${data.hadith.text}"` : ""}

---

Now write your response. Start by briefly acknowledging their pain (1-2 sentences max), then immediately move to the Quran verse — quote it, explain what it means in their context. Then connect it to the seerah story — describe what the Prophet ﷺ went through and how it mirrors their situation. ${data.hadith ? "Then share the hadith. " : ""}End with concrete things they can do. Every part of your response must reference the specific sources above.`;
}
