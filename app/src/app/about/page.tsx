import Link from "next/link";

export default function About() {
  return (
    <div className="animate-fade-in space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">How Qisas Works</h1>
        <p className="font-arabic text-xl text-verse" dir="rtl">
          وَلَقَدْ ضَرَبْنَا لِلنَّاسِ فِي هَٰذَا الْقُرْآنِ مِن كُلِّ مَثَلٍ
        </p>
        <p className="text-sm text-muted mt-2 italic">
          &ldquo;We have certainly presented for the people in this Quran from every kind of
          example.&rdquo; — Quran 30:58
        </p>
      </div>

      <div className="space-y-6">
        <Section title="The Idea">
          <p>
            When you&apos;re going through something — grief, anxiety, doubt, gratitude,
            confusion — the Quran and the Prophet&apos;s life ﷺ contain stories that speak
            directly to your situation. Qisas connects your feelings to those stories.
          </p>
        </Section>

        <Section title="How It Works">
          <ol className="list-decimal list-inside space-y-3 text-[var(--color-text)]">
            <li>
              <strong>You share what you&apos;re going through</strong> — in your own words.
              No filters, no categories to pick from.
            </li>
            <li>
              <strong>Qisas understands your emotion</strong> — matching your words to themes
              like patience (sabr), trust (tawakkul), justice (adl), and more.
            </li>
            <li>
              <strong>A Quran verse speaks to you</strong> — found through semantic search
              from the Quran Foundation API, with Arabic text and English translation.
            </li>
            <li>
              <strong>A seerah story connects</strong> — from the Prophet&apos;s life ﷺ,
              showing how he and his companions faced similar struggles.
            </li>
          </ol>
        </Section>

        <Section title="The Data">
          <p>Qisas is built on three sources:</p>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text)] mt-2">
            <li>
              <strong>The Quran</strong> — via the{" "}
              <a
                href="https://api.quran.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Quran Foundation API
              </a>{" "}
              with 126+ translations
            </li>
            <li>
              <strong>Hadith collections</strong> — 857 authenticated references from Sahih
              Bukhari and Sahih Muslim
            </li>
            <li>
              <strong>Seerah events</strong> — 46 curated events from the Prophet&apos;s life,
              covering the Meccan period, Hijrah, Madinah, and the Farewell era
            </li>
          </ul>
        </Section>

        <Section title="What Qisas Is Not">
          <p>
            Qisas is not a fatwa engine, a replacement for scholars, or an Islamic Google.
            It&apos;s a reflective tool — a bridge between your feelings and the wisdom that
            already exists in the Quran and Sunnah. For serious religious questions, always
            consult a qualified scholar.
          </p>
        </Section>

        <Section title="Built With">
          <ul className="list-disc list-inside space-y-1 text-[var(--color-text)]">
            <li>Next.js + Tailwind CSS</li>
            <li>Supabase (PostgreSQL)</li>
            <li>Quran Foundation API</li>
            <li>Sahih Bukhari & Muslim (hadith-json dataset)</li>
          </ul>
        </Section>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-block bg-accent text-white rounded-xl px-6 py-3 font-medium hover:bg-accent/90 transition-colors"
        >
          Share what you&apos;re going through →
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-theme rounded-2xl p-6">
      <h2 className="font-heading text-lg font-semibold mb-3">{title}</h2>
      <div className="text-sm text-muted leading-relaxed">{children}</div>
    </div>
  );
}
