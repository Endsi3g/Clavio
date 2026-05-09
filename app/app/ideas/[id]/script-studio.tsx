'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Clock,
  FileText,
  RotateCcw,
} from 'lucide-react'

interface ScriptStudioProps {
  initialScript?: string | null
  ideaTitle: string
}

const WORDS_PER_MINUTE = 130

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function estimateReadingTime(wordCount: number): string {
  const minutes = wordCount / WORDS_PER_MINUTE
  if (minutes < 1) return `${Math.round(minutes * 60)}s`
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export function ScriptStudio({ initialScript, ideaTitle }: ScriptStudioProps) {
  const [script, setScript] = useState(initialScript ?? '')
  const [teleprompterActive, setTeleprompterActive] = useState(false)
  const [speed, setSpeed] = useState(40)
  const [copied, setCopied] = useState(false)
  const teleprompterRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)
  const positionRef = useRef(0)

  const wordCount = countWords(script)
  const readingTime = estimateReadingTime(wordCount)
  const charCount = script.length

  const stopScroll = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    lastTimestampRef.current = null
  }, [])

  const startScroll = useCallback(() => {
    const el = teleprompterRef.current
    if (!el) return

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp
      }
      const delta = timestamp - lastTimestampRef.current
      lastTimestampRef.current = timestamp

      positionRef.current += (speed / 60) * (delta / 16.67)
      el.scrollTop = positionRef.current

      if (positionRef.current >= el.scrollHeight - el.clientHeight) {
        setTeleprompterActive(false)
        positionRef.current = 0
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [speed])

  useEffect(() => {
    if (teleprompterActive) {
      startScroll()
    } else {
      stopScroll()
    }
    return stopScroll
  }, [teleprompterActive, startScroll, stopScroll])

  const handleTeleprompterToggle = () => {
    if (!teleprompterActive) {
      positionRef.current = teleprompterRef.current?.scrollTop ?? 0
    }
    setTeleprompterActive((v) => !v)
  }

  const resetTeleprompter = () => {
    setTeleprompterActive(false)
    positionRef.current = 0
    if (teleprompterRef.current) teleprompterRef.current.scrollTop = 0
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportTxt = () => {
    const blob = new Blob([script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ideaTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-script.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportMd = () => {
    const md = `# ${ideaTitle}\n\n${script}`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ideaTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-script.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {wordCount} words · {charCount} chars
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          ~{readingTime} read time
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleExportTxt}>
          <Download className="h-3.5 w-3.5" />
          .txt
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleExportMd}>
          <Download className="h-3.5 w-3.5" />
          .md
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          className="h-7 text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white"
          onClick={handleTeleprompterToggle}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Teleprompter
        </Button>
      </div>

      {/* Editor */}
      <Textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Write your script here… Use the teleprompter mode for recording."
        className="min-h-[300px] font-mono text-sm resize-y"
      />

      {/* Teleprompter overlay */}
      {teleprompterActive && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          {/* Controls */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={handleTeleprompterToggle}
            >
              {teleprompterActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {teleprompterActive ? 'Pause' : 'Play'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-slate-400 hover:text-slate-200"
              onClick={resetTeleprompter}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <span className="text-xs text-slate-400 shrink-0">Speed</span>
              <Slider
                value={[speed]}
                onValueChange={(vals) => setSpeed(vals[0])}
                min={10}
                max={120}
                step={5}
                className="flex-1"
              />
              <span className="text-xs text-slate-400 w-6 text-right">{speed}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-slate-400 hover:text-slate-200 ml-auto"
              onClick={() => setTeleprompterActive(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Teleprompter text */}
          <div
            ref={teleprompterRef}
            className="flex-1 overflow-hidden px-12 py-16 overflow-y-scroll scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="max-w-3xl mx-auto">
              <p
                className="text-white leading-relaxed text-3xl font-medium text-center"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {script || 'No script yet. Close and write your script first.'}
              </p>
            </div>
          </div>

          {/* Center guide line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-blue-500/30 pointer-events-none" />
        </div>
      )}
    </div>
  )
}
