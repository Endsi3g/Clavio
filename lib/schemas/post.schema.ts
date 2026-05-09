import { z } from 'zod'

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  caption: z.string().max(2200).optional().nullable(),
  hashtags: z.string().max(500).optional().nullable(),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter']),
  media_url: z.string().url('Invalid media URL').optional().nullable(),
  scheduled_for: z.string().datetime().optional().nullable(),
  idea_id: z.string().uuid().optional().nullable(),
})

export const SchedulePostSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  scheduled_for: z.string().datetime('Invalid datetime'),
})

export const PublishPostSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
})

export const BulkScheduleSchema = z.object({
  post_ids: z.array(z.string().uuid()).min(1).max(50),
  scheduled_for: z.string().datetime(),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type SchedulePostInput = z.infer<typeof SchedulePostSchema>
export type PublishPostInput = z.infer<typeof PublishPostSchema>
