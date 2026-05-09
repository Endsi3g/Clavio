'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Save, Palette, Type, Hash, Mic, Image } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandKit {
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  font_heading?: string
  font_body?: string
  voice_tone?: string
  hashtag_sets?: { name: string; tags: string }[]
}

const DEFAULT_BRAND: BrandKit = {
  primary_color: '#3B82F6',
  secondary_color: '#0F172A',
  accent_color: '#10B981',
  font_heading: 'Geist',
  font_body: 'Geist',
  voice_tone: 'professional',
  hashtag_sets: [{ name: 'Default', tags: '' }],
}

const VOICE_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'bold', label: 'Bold & Direct' },
]

const FONT_OPTIONS = [
  'Geist', 'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Playfair Display', 'Space Grotesk',
]

function ColorSwatch({ color, onChange }: { color: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 rounded-lg border border-slate-200 cursor-pointer overflow-hidden shrink-0"
        style={{ backgroundColor: color }}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 w-full h-full cursor-pointer"
        />
      </div>
      <Input
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs h-8 w-32"
        maxLength={7}
      />
    </div>
  )
}

export default function BrandKitPage() {
  const [brand, setBrand] = useState<BrandKit>(DEFAULT_BRAND)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('settings')
      .select('value_json')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('key', 'brand_kit')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value_json) {
          setBrand({ ...DEFAULT_BRAND, ...(data.value_json as BrandKit) })
        }
      })
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('settings').upsert(
      { workspace_id: WORKSPACE_ID, key: 'brand_kit', value_json: brand, updated_at: new Date().toISOString() },
      { onConflict: 'workspace_id,key' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${WORKSPACE_ID}/logo-${Date.now()}.${ext}`
    const { data } = await supabase.storage.from('assets').upload(path, file, { upsert: true })
    if (data) {
      const { data: urlData } = supabase.storage.from('assets').getPublicUrl(path)
      setBrand((b) => ({ ...b, logo_url: urlData.publicUrl }))
    }
    setUploading(false)
  }

  const updateHashtagSet = (idx: number, field: 'name' | 'tags', value: string) => {
    setBrand((b) => {
      const sets = [...(b.hashtag_sets ?? [])]
      sets[idx] = { ...sets[idx], [field]: value }
      return { ...b, hashtag_sets: sets }
    })
  }

  const addHashtagSet = () => {
    setBrand((b) => ({
      ...b,
      hashtag_sets: [...(b.hashtag_sets ?? []), { name: `Set ${(b.hashtag_sets?.length ?? 0) + 1}`, tags: '' }],
    }))
  }

  const removeHashtagSet = (idx: number) => {
    setBrand((b) => ({ ...b, hashtag_sets: b.hashtag_sets?.filter((_, i) => i !== idx) }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Brand Kit</h1>
          <p className="mt-0.5 text-sm text-slate-500">Logo, colors, fonts, voice tone, and hashtag sets.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-1.5 bg-blue-500 hover:bg-blue-600"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save brand kit'}
        </Button>
      </div>

      {/* Logo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Image className="h-4 w-4 text-slate-400" />
            Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {brand.logo_url && (
            <img
              src={brand.logo_url}
              alt="Brand logo"
              className="h-16 w-auto rounded-lg border border-slate-200 object-contain bg-slate-50 p-2"
            />
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Uploading…' : 'Upload logo'}
          </Button>
          <p className="text-xs text-slate-400">PNG, SVG, or WEBP recommended. Stored in Supabase Storage.</p>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4 text-slate-400" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Primary</Label>
              <ColorSwatch
                color={brand.primary_color ?? '#3B82F6'}
                onChange={(v) => setBrand((b) => ({ ...b, primary_color: v }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Secondary</Label>
              <ColorSwatch
                color={brand.secondary_color ?? '#0F172A'}
                onChange={(v) => setBrand((b) => ({ ...b, secondary_color: v }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Accent</Label>
              <ColorSwatch
                color={brand.accent_color ?? '#10B981'}
                onChange={(v) => setBrand((b) => ({ ...b, accent_color: v }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
            <div className="flex gap-2">
              {[brand.primary_color, brand.secondary_color, brand.accent_color].map((c, i) => (
                <div key={i} className="h-8 w-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-xs text-slate-500 ml-2">Preview</span>
          </div>
        </CardContent>
      </Card>

      {/* Fonts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Type className="h-4 w-4 text-slate-400" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Heading font</Label>
              <Select
                value={brand.font_heading}
                onValueChange={(v) => setBrand((b) => ({ ...b, font_heading: v }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Body font</Label>
              <Select
                value={brand.font_body}
                onValueChange={(v) => setBrand((b) => ({ ...b, font_body: v }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice & Tone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Mic className="h-4 w-4 text-slate-400" />
            Voice & Tone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {VOICE_TONES.map((tone) => (
              <button
                key={tone.value}
                type="button"
                onClick={() => setBrand((b) => ({ ...b, voice_tone: tone.value }))}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-sm font-medium text-left transition-all',
                  brand.voice_tone === tone.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hashtag sets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400" />
            Hashtag Sets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(brand.hashtag_sets ?? []).map((set, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={set.name}
                  onChange={(e) => updateHashtagSet(idx, 'name', e.target.value)}
                  placeholder="Set name"
                  className="h-7 text-xs font-medium"
                />
                {(brand.hashtag_sets?.length ?? 0) > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-400 hover:text-red-500"
                    onClick={() => removeHashtagSet(idx)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <Textarea
                value={set.tags}
                onChange={(e) => updateHashtagSet(idx, 'tags', e.target.value)}
                placeholder="#contentstrategy #socialmedia #creator"
                className="text-xs min-h-[72px] font-mono"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={addHashtagSet}>
            + Add hashtag set
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
