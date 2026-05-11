'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WORKSPACE_ID } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  content: string
  onChange: (content: string) => void
  onSave?: () => void
  saving?: boolean
}

// ─── Minimal inline SVG icons ─────────────────────────────────────────────────

const IcBold = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  </svg>
)
const IcItalic = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
  </svg>
)
const IcBulletList = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
)
const IcOrderedList = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
    <path d="M4 6h1v4" strokeWidth="1.5"/><path d="M4 10h2" strokeWidth="1.5"/>
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeWidth="1.5"/>
  </svg>
)
const IcImage = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IcPdf = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IcSave = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
)
const IcSpinner = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

// ─── Toolbar button ────────────────────────────────────────────────────────────

function ToolBtn({
  active, onClick, title, children,
}: {
  active?: boolean
  onClick: () => void
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center h-7 min-w-[28px] px-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-medium',
        active && 'bg-slate-200 text-slate-900'
      )}
    >
      {children}
    </button>
  )
}

const Divider = () => <div className="w-px h-4 bg-slate-200 mx-0.5 shrink-0" />

// ─── Editor component ──────────────────────────────────────────────────────────

export function IdeaEditor({ content, onChange, onSave, saving }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Write your script here — add headings, sections, and image references…' }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const handleImageUpload = useCallback(async (file: File) => {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `script-images/${WORKSPACE_ID}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('assets').upload(path, file, { upsert: false })

    if (error) {
      // Fallback: base64 inline
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        editor?.chain().focus().setImage({ src }).run()
      }
      reader.readAsDataURL(file)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path)
    editor?.chain().focus().setImage({ src: publicUrl }).run()
  }, [editor])

  const handleExportPDF = useCallback(() => {
    const html = editor?.getHTML() ?? ''
    const title = document.title.replace(' – Clavio', '')
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title} — Script</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; line-height: 1.7; color: #1a1a1a; max-width: 700px; margin: 2.5cm auto; padding: 0 1cm; }
    h1 { font-size: 22pt; font-weight: 700; margin: 1.5em 0 0.4em; line-height: 1.2; }
    h2 { font-size: 17pt; font-weight: 600; margin: 1.2em 0 0.35em; }
    h3 { font-size: 14pt; font-weight: 600; margin: 1em 0 0.3em; }
    p  { margin-bottom: 0.8em; }
    ul, ol { margin: 0.5em 0 0.8em 1.5em; }
    li { margin-bottom: 0.3em; }
    img { max-width: 100%; height: auto; border-radius: 6px; margin: 1em 0; display: block; }
    a  { color: #2563eb; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }
    blockquote { border-left: 3px solid #ddd; padding-left: 1em; color: #555; margin: 1em 0; }
  </style>
</head>
<body>${html}</body>
</html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white shadow-sm border-slate-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-slate-100 bg-slate-50/60 flex-wrap">
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* Headings */}
          <ToolBtn title="Heading 1 (H1)" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>H1</ToolBtn>
          <ToolBtn title="Heading 2 (H2)" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolBtn>
          <ToolBtn title="Heading 3 (H3)" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolBtn>

          <Divider />

          {/* Text style */}
          <ToolBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><IcBold /></ToolBtn>
          <ToolBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><IcItalic /></ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><IcBulletList /></ToolBtn>
          <ToolBtn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><IcOrderedList /></ToolBtn>

          <Divider />

          {/* Image reference */}
          <ToolBtn title="Insert image reference" onClick={() => fileInputRef.current?.click()}><IcImage /></ToolBtn>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Download script as PDF"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors font-medium"
          >
            <IcPdf />
            PDF
          </button>

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 h-7 px-3 rounded text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-60"
            >
              {saving ? <IcSpinner /> : <IcSave />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Document area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[700px] mx-auto px-10 py-10 min-h-[600px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .ProseMirror { outline: none; min-height: 500px; font-size: 15px; line-height: 1.75; color: #1e293b; }
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.5rem; line-height: 1.15; color: #0f172a; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 650; margin-top: 1.5rem; margin-bottom: 0.4rem; line-height: 1.25; color: #0f172a; }
        .ProseMirror h3 { font-size: 1.2rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.35rem; color: #0f172a; }
        .ProseMirror p { margin-bottom: 0.875rem; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 0.875rem; }
        .ProseMirror li { margin-bottom: 0.25rem; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 10px; margin: 1.25rem 0; border: 1px solid #e2e8f0; }
        .ProseMirror a { color: #3b82f6; text-decoration: underline; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
        .ProseMirror blockquote { border-left: 3px solid #cbd5e1; padding-left: 1rem; color: #64748b; margin: 1rem 0; }
      `}</style>
    </div>
  )
}
