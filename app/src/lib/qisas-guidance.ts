// Qisas Guidance — LLM-powered personalized interpretation

interface GuidanceInput {
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

export async function fetchGuidance(input: GuidanceInput): Promise<string> {
  try {
    const response = await fetch("/api/guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput: input.userInput,
        emotion: input.emotion,
        tags: input.tags,
        verse: input.verse,
        seerah: {
          title: input.seerah.title,
          title_ar: input.seerah.title_ar,
          description: input.seerah.description,
          period: input.seerah.period,
          year: input.seerah.year,
          lessons: input.seerah.lessons,
          location: input.seerah.location,
          significance: input.seerah.significance,
        },
        hadith: input.hadith,
      }),
    });

    if (!response.ok) {
      throw new Error("Guidance API failed");
    }

    const data = await response.json();
    return data.guidance || "";
  } catch (err) {
    console.error("Guidance fetch error:", err);
    return "";
  }
}
