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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
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
  return `You are Qisas, a warm and compassionate Islamic guidance assistant. Your role is to help a Muslim person who is going through a difficult time by connecting their situation to the wisdom of the Quran and the Prophet's life (peace be upon him).

RULES:
- Speak directly to the person with warmth and empathy, like a wise friend
- Use ONLY the data provided below — do not add outside knowledge, hadiths, or verses
- Write in clear, accessible English — avoid academic or overly formal language
- Be practical — suggest 2-3 specific, actionable things the person can do RIGHT NOW
- Ground your advice in the Islamic sources provided (Quran verse, seerah story, hadith)
- Keep the total response under 400 words
- Do NOT use headers, bullet points, or markdown formatting — write in flowing paragraphs
- Do NOT say "as an AI" or break character

THE PERSON'S SITUATION:
"${data.userInput}"

Detected emotion: ${data.emotion}
Related themes: ${data.tags.join(", ")}

QURAN VERSE (${data.verse.verse_key}):
Arabic: ${data.verse.arabic}
Translation: ${data.verse.translation}

SEERAH STORY:
Title: ${data.seerah.title} (${data.seerah.title_ar || ""})
Period: ${data.seerah.period} — ${data.seerah.year}
Description: ${data.seerah.description}
Lessons: ${data.seerah.lessons}
Location: ${data.seerah.location}
${data.seerah.significance ? `Significance: ${data.seerah.significance}` : ""}

${data.hadith ? `HADITH (${data.hadith.collection}):
Narrator: ${data.hadith.narrator}
Text: ${data.hadith.text}` : ""}

Now write your response to this person. Start by acknowledging what they're going through, then connect it to the verse and the seerah story, and end with practical things they can do. Write as if you're speaking to them directly.`;
}
