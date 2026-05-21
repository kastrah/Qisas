-- QISAS — Seerah Database Schema
-- Created: 2026-05-21
-- Target: Supabase (existing project, separate tables)
-- Migration path: move to dedicated Supabase project when ready

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_locations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en         TEXT NOT NULL,
    name_ar         TEXT,
    modern_name     TEXT,           -- current city/region if different
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seerah_locations_name ON seerah_locations (name_en);

-- ============================================================
-- PERSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_persons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en         TEXT NOT NULL,
    name_ar         TEXT,
    kunyah          TEXT,           -- e.g. Abu Bakr, Umm Salama
    laqab           TEXT,           -- e.g. al-Siddiq, al-Faruq
    lineage         TEXT,           -- e.g. ibn Abi Quhafah
    gender          TEXT CHECK (gender IN ('male', 'female')),
    birth_year_hijri TEXT,
    death_year_hijri TEXT,
    is_sahabi       BOOLEAN DEFAULT FALSE,
    is_prophet      BOOLEAN DEFAULT FALSE,
    biography_short TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seerah_persons_name ON seerah_persons (name_en);
CREATE INDEX idx_seerah_persons_sahabi ON seerah_persons (is_sahabi) WHERE is_sahabi = TRUE;

-- ============================================================
-- THEMATIC TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,   -- e.g. 'sabr', 'leadership', 'da_wah'
    name_en         TEXT NOT NULL,
    name_ar         TEXT,
    description     TEXT,
    category        TEXT,                   -- e.g. 'virtue', 'event_type', 'lesson'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seerah_tags_slug ON seerah_tags (slug);

-- ============================================================
-- SOURCES (hadith refs, sira books, Quran ayat)
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_sources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type     TEXT NOT NULL CHECK (source_type IN ('hadith', 'sira', 'quran', 'other')),
    collection      TEXT,           -- e.g. 'Sahih Bukhari', 'Ibn Hisham', 'Quran'
    book_number     TEXT,
    hadith_number   TEXT,
    chapter_name    TEXT,
    verse_ref       TEXT,           -- e.g. '96:1-5' for Quran
    text_ar         TEXT,
    text_en         TEXT,
    grade           TEXT,           -- hadith grading: sahih, hasan, da'if
    url             TEXT,           -- link to sunnah.com, quran.com, etc.
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seerah_sources_type ON seerah_sources (source_type);
CREATE INDEX idx_seerah_sources_collection ON seerah_sources (collection);

-- ============================================================
-- EVENTS (core table)
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en        TEXT NOT NULL,
    title_ar        TEXT,
    description_en  TEXT,
    description_ar  TEXT,
    period          TEXT NOT NULL CHECK (period IN (
                        'pre_hijrah_makkah',    -- before 622 CE
                        'hijrah',               -- the migration itself
                        'madinah',              -- 622-632 CE
                        'farewell'              -- farewell era
                    )),
    year_approx     INTEGER,        -- approximate Hijri year (-53 for birth year, etc.)
    year_label      TEXT,           -- e.g. 'Year of the Elephant', '3 BH', '2 AH'
    sequence_order  INTEGER,        -- for chronological ordering within period
    location_id     UUID REFERENCES seerah_locations(id),
    significance    TEXT,           -- why this event matters
    lessons         TEXT,           -- key takeaways
    is_major_event  BOOLEAN DEFAULT FALSE,
    status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seerah_events_period ON seerah_events (period);
CREATE INDEX idx_seerah_events_year ON seerah_events (year_approx);
CREATE INDEX idx_seerah_events_status ON seerah_events (status);
CREATE INDEX idx_seerah_events_major ON seerah_events (is_major_event) WHERE is_major_event = TRUE;

-- ============================================================
-- JUNCTION: Events ↔ Tags (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_event_tags (
    event_id        UUID NOT NULL REFERENCES seerah_events(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES seerah_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

-- ============================================================
-- JUNCTION: Events ↔ Persons (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_event_persons (
    event_id        UUID NOT NULL REFERENCES seerah_events(id) ON DELETE CASCADE,
    person_id       UUID NOT NULL REFERENCES seerah_persons(id) ON DELETE CASCADE,
    role            TEXT,           -- e.g. 'protagonist', 'mentioned', 'witness'
    PRIMARY KEY (event_id, person_id)
);

-- ============================================================
-- JUNCTION: Events ↔ Sources (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS seerah_event_sources (
    event_id        UUID NOT NULL REFERENCES seerah_events(id) ON DELETE CASCADE,
    source_id       UUID NOT NULL REFERENCES seerah_sources(id) ON DELETE CASCADE,
    relevance       TEXT DEFAULT 'primary',  -- 'primary', 'supporting', 'reference'
    PRIMARY KEY (event_id, source_id)
);

-- ============================================================
-- RLS: public read, service role write
-- ============================================================
ALTER TABLE seerah_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_event_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_event_sources ENABLE ROW LEVEL SECURITY;

-- Public read access (for the app)
CREATE POLICY "Public read seerah_locations" ON seerah_locations FOR SELECT USING (true);
CREATE POLICY "Public read seerah_persons" ON seerah_persons FOR SELECT USING (true);
CREATE POLICY "Public read seerah_tags" ON seerah_tags FOR SELECT USING (true);
CREATE POLICY "Public read seerah_sources" ON seerah_sources FOR SELECT USING (true);
CREATE POLICY "Public read seerah_events" ON seerah_events FOR SELECT USING (true);
CREATE POLICY "Public read seerah_event_tags" ON seerah_event_tags FOR SELECT USING (true);
CREATE POLICY "Public read seerah_event_persons" ON seerah_event_persons FOR SELECT USING (true);
CREATE POLICY "Public read seerah_event_sources" ON seerah_event_sources FOR SELECT USING (true);

-- Service role full access (for admin/API)
CREATE POLICY "Service role full seerah_locations" ON seerah_locations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full seerah_persons" ON seerah_persons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full seerah_tags" ON seerah_tags FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full seerah_sources" ON seerah_sources FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full seerah_events" ON seerah_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full seerah_event_tags" ON seerah_event_tags FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full seerah_event_persons" ON seerah_event_persons FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full seerah_event_sources" ON seerah_event_sources FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seerah_events_updated_at
    BEFORE UPDATE ON seerah_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
