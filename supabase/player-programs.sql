-- Таблиця для відстеження програм користувачів
-- Зберігає дату початку програми для кожного гравця

CREATE TABLE IF NOT EXISTS public.player_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    program_id TEXT NOT NULL,
    started_at DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_id, program_id)
);

-- Enable RLS
ALTER TABLE public.player_programs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "player_programs_select" ON public.player_programs
    FOR SELECT TO authenticated USING (player_id = auth.uid());

CREATE POLICY "player_programs_insert" ON public.player_programs
    FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());

CREATE POLICY "player_programs_update" ON public.player_programs
    FOR UPDATE TO authenticated USING (player_id = auth.uid());

CREATE POLICY "player_programs_delete" ON public.player_programs
    FOR DELETE TO authenticated USING (player_id = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS idx_player_programs_player ON public.player_programs(player_id);
CREATE INDEX IF NOT EXISTS idx_player_programs_active ON public.player_programs(player_id, is_active);

