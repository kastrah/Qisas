-- QISAS API Functions
-- Emotion → Tag → Event → Source lookup chain

-- 1. Match user input text to tags
CREATE OR REPLACE FUNCTION match_emotions_to_tags(input_text TEXT)
RETURNS TABLE(tag_id UUID, tag_slug TEXT, tag_name_en TEXT, tag_description TEXT, match_score FLOAT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (t.id)
        t.id as tag_id,
        t.slug as tag_slug,
        t.name_en as tag_name_en,
        t.description as tag_description,
        CASE
            WHEN input_text ILIKE '%' || t.slug || '%' THEN 1.0
            WHEN input_text ILIKE '%' || t.name_en || '%' THEN 0.9
            WHEN input_text ILIKE '%' || t.description || '%' THEN 0.7
            ELSE 0.5
        END as match_score
    FROM seerah_tags t
    WHERE input_text ILIKE '%' || t.slug || '%'
       OR input_text ILIKE '%' || t.name_en || '%'
       OR input_text ILIKE '%' || t.description || '%'
    ORDER BY t.id, match_score DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Get events by tag slugs (the main query function)
CREATE OR REPLACE FUNCTION get_events_by_tags(tag_slugs TEXT[])
RETURNS TABLE(
    event_id UUID,
    event_title TEXT,
    event_title_ar TEXT,
    event_description TEXT,
    event_period TEXT,
    event_year_label TEXT,
    event_significance TEXT,
    event_lessons TEXT,
    event_is_major BOOLEAN,
    location_name TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    matched_tags TEXT[],
    hadith_refs JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as event_id,
        e.title_en as event_title,
        e.title_ar as event_title_ar,
        e.description_en as event_description,
        e.period as event_period,
        e.year_label as event_year_label,
        e.significance as event_significance,
        e.lessons as event_lessons,
        e.is_major_event as event_is_major,
        l.name_en as location_name,
        l.latitude as location_lat,
        l.longitude as location_lng,
        ARRAY(
            SELECT DISTINCT t2.name_en 
            FROM seerah_event_tags et2 
            JOIN seerah_tags t2 ON et2.tag_id = t2.id 
            WHERE et2.event_id = e.id
        ) as matched_tags,
        COALESCE(
            (
                SELECT jsonb_agg(DISTINCT jsonb_build_object(
                    'collection', s.collection,
                    'hadith_number', s.hadith_number,
                    'narrator', s.notes,
                    'text_en', s.text_en,
                    'text_ar', s.text_ar,
                    'url', s.url,
                    'relevance', es.relevance
                ))
                FROM seerah_event_sources es
                JOIN seerah_sources s ON es.source_id = s.id
                WHERE es.event_id = e.id
                LIMIT 5
            ),
            '[]'::jsonb
        ) as hadith_refs
    FROM seerah_events e
    JOIN seerah_event_tags et ON e.id = et.event_id
    JOIN seerah_tags t ON et.tag_id = t.id
    LEFT JOIN seerah_locations l ON e.location_id = l.id
    WHERE t.slug = ANY(tag_slugs)
      AND e.status = 'published'
    GROUP BY e.id, e.title_en, e.title_ar, e.description_en, e.period, 
             e.year_label, e.significance, e.lessons, e.is_major_event,
             l.name_en, l.latitude, l.longitude
    ORDER BY e.is_major_event DESC, e.sequence_order ASC;
END;
$$ LANGUAGE plpgsql;

-- 3. Full Qisas lookup: input text → events with verses
CREATE OR REPLACE FUNCTION qisas_lookup(input_text TEXT)
RETURNS JSONB AS $$
DECLARE
    matched_tag_slugs TEXT[];
    result JSONB;
BEGIN
    -- Step 1: Get matching tag slugs
    SELECT ARRAY_AGG(tag_slug) INTO matched_tag_slugs
    FROM match_emotions_to_tags(input_text);
    
    -- If no matches, return empty
    IF matched_tag_slugs IS NULL OR array_length(matched_tag_slugs, 1) = 0 THEN
        RETURN jsonb_build_object(
            'input', input_text,
            'matched_tags', '[]'::jsonb,
            'events', '[]'::jsonb,
            'quran_search_hint', 'Try searching for: patience, trust, gratitude, forgiveness, justice'
        );
    END IF;
    
    -- Step 2: Get events and build response
    SELECT jsonb_build_object(
        'input', input_text,
        'matched_tags', (
            SELECT jsonb_agg(jsonb_build_object(
                'slug', tag_slug,
                'name', tag_name_en,
                'score', match_score
            ))
            FROM match_emotions_to_tags(input_text)
        ),
        'events', (
            SELECT jsonb_agg(jsonb_build_object(
                'title', event_title,
                'title_ar', event_title_ar,
                'description', event_description,
                'period', event_period,
                'year', event_year_label,
                'significance', event_significance,
                'lessons', event_lessons,
                'is_major', event_is_major,
                'location', jsonb_build_object(
                    'name', location_name,
                    'lat', location_lat,
                    'lng', location_lng
                ),
                'themes', matched_tags,
                'hadiths', hadith_refs
            ))
            FROM get_events_by_tags(matched_tag_slugs)
        ),
        'quran_search_terms', (
            SELECT jsonb_agg(DISTINCT term)
            FROM seerah_tags t,
                 jsonb_array_elements_text(
                     CASE 
                         WHEN t.slug = 'sabr' THEN '["patience","patient","endure","steadfast"]'::jsonb
                         WHEN t.slug = 'tawakkul' THEN '["trust in Allah","rely on Allah","Allah is sufficient"]'::jsonb
                         WHEN t.slug = 'adl' THEN '["justice","fairness","equity","just"]'::jsonb
                         WHEN t.slug = 'forgiveness' THEN '["forgive","pardon","excuse"]'::jsonb
                         WHEN t.slug = 'mercy' THEN '["mercy","compassion","merciful"]'::jsonb
                         WHEN t.slug = 'shukr' THEN '["gratitude","thankful","blessings"]'::jsonb
                         WHEN t.slug = 'taqwa' THEN '["God-consciousness","fear of Allah","righteousness"]'::jsonb
                         WHEN t.slug = 'ikhlas' THEN '["sincerity","pure intention","for Allah"]'::jsonb
                         WHEN t.slug = 'brotherhood' THEN '["brotherhood","believers are brothers","unity"]'::jsonb
                         WHEN t.slug = 'family' THEN '["family","marriage","parents","children"]'::jsonb
                         WHEN t.slug = 'courage' THEN '["courage","brave","stand firm"]'::jsonb
                         WHEN t.slug = 'migration' THEN '["migration","hijrah","Allah's earth is spacious"]'::jsonb
                         ELSE '["Allah","mercy","patience"]'::jsonb
                     END
                 ) as term
            WHERE t.slug = ANY(matched_tag_slugs)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Simple event search by keyword
CREATE OR REPLACE FUNCTION search_events(search_text TEXT)
RETURNS TABLE(
    event_id UUID,
    event_title TEXT,
    event_description TEXT,
    event_period TEXT,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title_en,
        e.description_en,
        e.period,
        CASE
            WHEN e.title_en ILIKE '%' || search_text || '%' THEN 1.0
            WHEN e.description_en ILIKE '%' || search_text || '%' THEN 0.8
            WHEN e.significance ILIKE '%' || search_text || '%' THEN 0.6
            WHEN e.lessons ILIKE '%' || search_text || '%' THEN 0.5
            ELSE 0.3
        END as relevance_score
    FROM seerah_events e
    WHERE e.title_en ILIKE '%' || search_text || '%'
       OR e.description_en ILIKE '%' || search_text || '%'
       OR e.significance ILIKE '%' || search_text || '%'
       OR e.lessons ILIKE '%' || search_text || '%'
    ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Set all events to published so the functions work
UPDATE seerah_events SET status = 'published' WHERE status = 'draft';
