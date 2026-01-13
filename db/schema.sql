-- Create tables for the MusicVault application

-- Ragas Table
CREATE TABLE IF NOT EXISTS public.ragas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    thaat TEXT,
    time TEXT,
    vadi TEXT,
    samvadi TEXT,
    aroha TEXT,
    avroha TEXT,
    pakad TEXT,
    description TEXT,
    user_id UUID DEFAULT auth.uid() -- Can be null if not authenticated
);

-- Bandishes Table
CREATE TABLE IF NOT EXISTS public.bandishes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    raga_id UUID REFERENCES public.ragas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('khayal', 'dhrupad', 'thumri', 'bhajan', 'general_note', 'other')),
    tempo TEXT CHECK (tempo IN ('vilambit', 'madhya', 'drut')),
    tala TEXT,
    composer TEXT, -- New Column
    lyrics TEXT,
    audio_url TEXT,
    notation_image_url TEXT,
    user_id UUID DEFAULT auth.uid()
);

-- Diary Entries Table
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    user_id UUID DEFAULT auth.uid()
);

-- Karyakrams Table (Programs/Setlists)
CREATE TABLE IF NOT EXISTS public.karyakrams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE,
    venue TEXT,
    notes TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'draft')),
    user_id UUID DEFAULT auth.uid()
);

-- Karyakram Items Table (Songs in a setlist)
CREATE TABLE IF NOT EXISTS public.karyakram_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    karyakram_id UUID REFERENCES public.karyakrams(id) ON DELETE CASCADE,
    bandish_id UUID REFERENCES public.bandishes(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    notes TEXT -- Specific performance notes for this item
);


-- Enable Row Level Security (RLS)
ALTER TABLE public.ragas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bandishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karyakrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karyakram_items ENABLE ROW LEVEL SECURITY;

-- Policies for Ragas
CREATE POLICY "Allow anonymous read access to ragas"
    ON public.ragas FOR SELECT  USING (true);
CREATE POLICY "Allow anonymous insert access to ragas"
    ON public.ragas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access to ragas"
    ON public.ragas FOR DELETE USING (true);


-- Policies for Bandishes
CREATE POLICY "Allow anonymous read access to bandishes"
    ON public.bandishes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to bandishes"
    ON public.bandishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access to bandishes"
    ON public.bandishes FOR DELETE USING (true);


-- Policies for Diary
CREATE POLICY "Allow anonymous read access to diary"
    ON public.diary_entries FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to diary"
    ON public.diary_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access to diary"
    ON public.diary_entries FOR DELETE USING (true);


-- Policies for Karyakrams
CREATE POLICY "Allow anonymous read access to karyakrams"
    ON public.karyakrams FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to karyakrams"
    ON public.karyakrams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to karyakrams"
    ON public.karyakrams FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access to karyakrams"
    ON public.karyakrams FOR DELETE USING (true);

-- Policies for Karyakram Items
CREATE POLICY "Allow anonymous read access to karyakram_items"
    ON public.karyakram_items FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to karyakram_items"
    ON public.karyakram_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to karyakram_items"
    ON public.karyakram_items FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access to karyakram_items"
    ON public.karyakram_items FOR DELETE USING (true);

-- MIGRATIONS (Run these if tables exist)
-- ALTER TABLE public.bandishes ALTER COLUMN raga_id DROP NOT NULL;
-- ALTER TABLE public.bandishes ADD COLUMN IF NOT EXISTS composer TEXT;
