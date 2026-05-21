# Qisas — Project Description

## The Problem

Muslims face everyday emotional struggles — grief, anxiety, doubt, loneliness — and they know the Quran and the Prophet's life ﷺ hold answers. But the path from "I'm hurting" to "here's what Allah says" is broken.

**What happens today:**
- You Google "Quran about patience" and get a list of 50 verses with no context
- You open a Quran app but don't know where to start
- You ask a scholar but they're not available at 2am
- You read seerah books but they're organized chronologically, not by what you're going through

**The gap:** No tool takes your *feeling* as input and gives you *relevant* Islamic wisdom as output.

## The Solution

Qisas makes the Quran *responsive*. Instead of you finding the verse, the verse finds you.

1. You share what you're going through in your own words
2. Qisas matches your emotion to themes like patience (sabr), trust (tawakkul), justice (adl)
3. A Quran verse is found via semantic search — Arabic text, English translation
4. A seerah story connects with lessons, location, and authenticated hadith references

**Three layers of engagement:**
- **The verse** — Allah's words speaking directly to your situation
- **The seerah story** — how the Prophet ﷺ lived through something similar
- **The hadith** — authenticated source so you trust what you're reading

## Primary Audience

**Young Muslims (18-35) who are spiritually curious but emotionally overwhelmed.**

- Has access to every Islamic app and lecture — but still feels disconnected
- Grew up learning to recite Quran but never taught how to *apply* it
- Faces modern struggles their parents' generation didn't have language for
- Turns to social media or therapy when things get hard — not because they don't believe, but because they don't know where to start with Islamic sources

**Specifically:**
- The 2am Muslim — lying awake with anxiety, scrolling, wishing for something meaningful
- The revert — just accepted Islam, no idea where to find relevant verses
- The struggling student — studying Islam but finding it dry and disconnected
- The parent — trying to explain patience to their child with a real story

## The Data

| Entity | Count | Description |
|--------|-------|-------------|
| Seerah events | 46 | From Birth to Burial, all four periods |
| Thematic tags | 30 | Virtues, leadership, lessons |
| Historical persons | 30 | Prophet, wives, caliphs, companions |
| Locations | 18 | With GPS coordinates |
| Hadith sources | 857 | Sahih Bukhari + Muslim |
| Event-tag links | 123 | 2-5 themes per event |
| Event-source links | 818 | Hadith references |
| Event-person links | 80 | Person-event connections |

## How It Works

```
User: "I lost someone and I can't stop crying"
  → Emotion: grief → Tags: sabr, sabr_jamil, tawakkul
  → Quran 70:5: "So, observe patience, a good patience."
  → Seerah: Death of Aminah — orphanhood shaped the Prophet ﷺ
  → Hadith: Bukhari on patience during loss
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS + dark/light mode
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Quran API:** api.quran.com (no auth, 126+ translations)
- **Deployment:** Cloudflare Pages (edge functions)
- **Data:** hadith-json dataset (Bukhari + Muslim)

## What It's Not

Qisas is not a fatwa engine, a replacement for scholars, or an Islamic Google. It's a bridge between your feelings and the wisdom that already exists in the Quran and Sunnah.
