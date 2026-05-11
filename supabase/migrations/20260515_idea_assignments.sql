-- ============================================================
-- Clavio — Idea Assignments
-- ============================================================

-- Add assigned_to to ideas
ALTER TABLE public.ideas 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add assigned_to to idea_variants
ALTER TABLE public.idea_variants 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_assigned_to ON public.ideas(assigned_to);
CREATE INDEX IF NOT EXISTS idx_idea_variants_assigned_to ON public.idea_variants(assigned_to);
