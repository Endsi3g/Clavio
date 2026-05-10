export const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

export type Status =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'completed'
  | 'failed'
  | 'archived'

export type Severity = 'info' | 'warning' | 'error' | 'debug'

export type Priority = 'low' | 'medium' | 'high'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error'

export interface Idea {
  id: string
  workspace_id: string
  title: string
  description: string | null
  format: string | null
  platform: string | null
  pillar: string | null
  status: Status
  priority: Priority | null
  source_type: string | null
  source_ref: string | null
  prompt: string | null
  script: string | null
  created_at: string
  updated_at: string
}

export interface IdeaVariant {
  id: string
  workspace_id: string
  idea_id: string
  variant_type: string | null
  hook: string | null
  script: string | null
  cta: string | null
  status: Status
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  workspace_id: string
  title: string
  source_url: string | null
  storage_path: string | null
  duration_seconds: number | null
  processing_status: Status
  transcription_status: Status
  status: Status
  created_at: string
  updated_at: string
}

export interface Transcript {
  id: string
  workspace_id: string
  video_id: string
  language: string
  content: string
  segments_json: unknown
  created_at: string
}

export interface Clip {
  id: string
  workspace_id: string
  video_id: string
  title: string
  start_ms: number
  end_ms: number
  caption: string | null
  aspect_ratio: string | null
  status: Status
  created_at: string
  updated_at: string
}

export interface RenderJob {
  id: string
  workspace_id: string
  clip_id: string
  engine: string
  composition_name: string | null
  status: Status
  input_json: unknown
  output_url: string | null
  error_message: string | null
  started_at: string | null
  finished_at: string | null
}

export interface Post {
  id: string
  workspace_id: string
  idea_id: string | null
  clip_id: string | null
  platform: string
  title: string
  caption: string | null
  hashtags: string | null
  media_url: string | null
  status: Status
  scheduled_for: string | null
  published_at: string | null
  published_url: string | null
  approval_status: 'none' | 'pending_review' | 'changes_requested' | 'approved' | null
  reviewer_id: string | null
  created_at: string
  updated_at: string
}

export interface PostMetrics {
  id: string
  workspace_id: string
  post_id: string
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  clicks: number | null
  watch_time_seconds: number | null
  retention_rate: number | null
  collected_at: string
}

export interface Asset {
  id: string
  workspace_id: string
  asset_type: string
  name: string
  url: string
  mime_type: string | null
  size_bytes: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface WorkflowRun {
  id: string
  workspace_id: string
  workflow_name: string
  entity_type: string | null
  entity_id: string | null
  status: Status
  input_json: unknown
  output_json: unknown
  error_message: string | null
  started_at: string | null
  finished_at: string | null
}

export interface Integration {
  id: string
  workspace_id: string
  provider: string
  status: IntegrationStatus
  config_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Log {
  id: string
  workspace_id: string
  severity: Severity
  source: string
  entity_type: string | null
  entity_id: string | null
  message: string
  payload_json: unknown
  created_at: string
}

export interface Setting {
  id: string
  workspace_id: string
  key: string
  value_json: unknown
  updated_at: string
}

export type ActionResult<T> = { data: T; error: null } | { data: null; error: string }
