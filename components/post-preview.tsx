'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, Youtube, Instagram, Linkedin, Twitter } from 'lucide-react'
import type { Post } from '@/lib/types'

const PLATFORMS = ['instagram', 'youtube', 'linkedin', 'twitter', 'tiktok'] as const
type Platform = (typeof PLATFORMS)[number]

function InstagramPreview({ post }: { post: Post }) {
  return (
    <div className="mx-auto max-w-[360px] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-slate-100">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" />
        <div>
          <p className="text-xs font-semibold text-slate-900">your_workspace</p>
          <p className="text-[10px] text-slate-500">Sponsored</p>
        </div>
      </div>
      <div className="aspect-square bg-slate-100 flex items-center justify-center">
        {post.media_url ? (
          <img src={post.media_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 text-sm">Image / Vidéo</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs font-semibold text-slate-900">your_workspace</p>
        <p className="text-xs text-slate-700 line-clamp-3">{post.caption || post.title}</p>
        {post.hashtags && (
          <p className="text-xs text-blue-500 line-clamp-1">{post.hashtags}</p>
        )}
      </div>
    </div>
  )
}

function LinkedInPreview({ post }: { post: Post }) {
  return (
    <div className="mx-auto max-w-[400px] rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 pb-2">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">CL</div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Creator Workspace</p>
          <p className="text-xs text-slate-500">Content Creator · 1st</p>
          <p className="text-[10px] text-slate-400">Just now · 🌍</p>
        </div>
      </div>
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{post.caption || post.title}</p>
      </div>
      {post.media_url && (
        <div className="border-t border-slate-100 aspect-video bg-slate-100 flex items-center justify-center">
          <p className="text-xs text-slate-400">Média</p>
        </div>
      )}
      <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-4 text-xs text-slate-500">
        <span>👍 Like</span><span>💬 Comment</span><span>🔁 Repost</span><span>📤 Send</span>
      </div>
    </div>
  )
}

function TwitterPreview({ post }: { post: Post }) {
  const text = post.caption || post.title
  const charCount = text?.length ?? 0
  return (
    <div className="mx-auto max-w-[360px] rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">CL</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold text-slate-900">Creator Workspace</p>
            <p className="text-sm text-slate-500">@workspace</p>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">{text}</p>
          {post.media_url && (
            <div className="mt-2 rounded-xl border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
              <p className="text-xs text-slate-400">Média</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
        <div className="flex gap-4"><span>💬 0</span><span>🔁 0</span><span>❤️ 0</span></div>
        <span className={charCount > 280 ? 'text-red-500' : ''}>{charCount}/280</span>
      </div>
    </div>
  )
}

function YouTubePreview({ post }: { post: Post }) {
  return (
    <div className="mx-auto max-w-[400px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
        {post.media_url ? (
          <img src={post.media_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-600 text-xs">Thumbnail</div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1 rounded">12:34</div>
      </div>
      <div className="p-3 flex gap-2">
        <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{post.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">Creator Workspace · 0 views · Just now</p>
        </div>
      </div>
    </div>
  )
}

function TikTokPreview({ post }: { post: Post }) {
  return (
    <div className="mx-auto max-w-[220px] bg-black rounded-2xl overflow-hidden border border-slate-800 aspect-[9/16] relative flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {post.media_url ? (
          <img src={post.media_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-600 text-xs">Vidéo verticale</div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-xs font-semibold">@workspace</p>
        <p className="text-white/80 text-[10px] line-clamp-2 mt-0.5">{post.caption || post.title}</p>
        {post.hashtags && <p className="text-white/60 text-[10px] mt-0.5 line-clamp-1">{post.hashtags}</p>}
      </div>
      <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3">
        {['❤️', '💬', '🔁', '📤'].map((e) => (
          <div key={e} className="flex flex-col items-center">
            <span className="text-lg">{e}</span>
            <span className="text-white text-[9px]">0</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  instagram: <Instagram className="h-3.5 w-3.5" />,
  youtube: <Youtube className="h-3.5 w-3.5" />,
  linkedin: <Linkedin className="h-3.5 w-3.5" />,
  twitter: <Twitter className="h-3.5 w-3.5" />,
  tiktok: <span className="text-xs font-bold">TT</span>,
}

export function PostPreview({ post }: { post: Post }) {
  const [platform, setPlatform] = useState<Platform>((post.platform as Platform) || 'instagram')

  const previews: Record<Platform, React.ReactNode> = {
    instagram: <InstagramPreview post={post} />,
    youtube: <YouTubePreview post={post} />,
    linkedin: <LinkedInPreview post={post} />,
    twitter: <TwitterPreview post={post} />,
    tiktok: <TikTokPreview post={post} />,
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post preview</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1.5 justify-center flex-wrap">
          {PLATFORMS.map((p) => (
            <Button
              key={p}
              variant={platform === p ? 'default' : 'outline'}
              size="sm"
              className={`h-7 px-2 gap-1 text-xs capitalize ${platform === p ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
              onClick={() => setPlatform(p)}
            >
              {PLATFORM_ICONS[p]}
              {p}
            </Button>
          ))}
        </div>
        <div className="py-2 overflow-y-auto max-h-[65vh]">
          {previews[platform]}
        </div>
      </DialogContent>
    </Dialog>
  )
}
