import { z } from 'zod'

export const UploadVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  source_url: z.string().url('Invalid URL').optional().nullable(),
  storage_path: z.string().max(500).optional().nullable(),
})

export const TranscribeVideoSchema = z.object({
  video_id: z.string().uuid('Invalid video ID'),
  model: z.enum(['base', 'small', 'medium', 'large']).default('base'),
})

export const ClipVideoSchema = z.object({
  video_id: z.string().uuid('Invalid video ID'),
  start_second: z.number().min(0),
  end_second: z.number().min(0),
  label: z.string().max(100).optional(),
})

export type UploadVideoInput = z.infer<typeof UploadVideoSchema>
export type TranscribeVideoInput = z.infer<typeof TranscribeVideoSchema>
export type ClipVideoInput = z.infer<typeof ClipVideoSchema>
