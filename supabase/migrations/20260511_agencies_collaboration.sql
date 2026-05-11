-- Create brands table for agencies
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    brand_color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add brand_id to ideas
ALTER TABLE public.ideas 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Add brand_id to posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Create comments table for collaboration
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'idea', 'post'
    entity_id UUID NOT NULL, -- References idea.id or post.id (polymorphic)
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT, -- Fallback if author_id is null or it's a guest/team member without a profile
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brands_workspace_id ON public.brands(workspace_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);

-- Row Level Security for brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage brands in their workspace"
    ON public.brands
    FOR ALL
    USING (workspace_id = (SELECT id FROM public.workspaces LIMIT 1));

-- Row Level Security for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage comments in their workspace"
    ON public.comments
    FOR ALL
    USING (workspace_id = (SELECT id FROM public.workspaces LIMIT 1));
