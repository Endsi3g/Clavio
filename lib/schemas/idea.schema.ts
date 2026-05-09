import { z } from 'zod'

export const CreateIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional().nullable(),
  format: z.enum(['short_video', 'long_video', 'article', 'carousel', 'reel', 'story', 'podcast']).optional().nullable(),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter']).optional().nullable(),
  pillar: z.string().max(100).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional().nullable(),
  source_type: z.string().max(50).optional().nullable(),
  source_ref: z.string().max(500).optional().nullable(),
})

export const UpdateIdeaSchema = CreateIdeaSchema.partial()

export const GenerateIdeaSchema = z.object({
  topic: z.string().min(1).max(300),
  format: z.string().max(50).optional(),
  platform: z.string().max(30).optional(),
  count: z.number().int().min(1).max(10).default(3),
})

export type CreateIdeaInput = z.infer<typeof CreateIdeaSchema>
export type UpdateIdeaInput = z.infer<typeof UpdateIdeaSchema>
export type GenerateIdeaInput = z.infer<typeof GenerateIdeaSchema>
