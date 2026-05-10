'use client'

import { useState } from 'react'
import { Play, Pause, Volume2, Maximize } from 'lucide-react'

interface Props {
  url: string
  poster?: string
}

export function VideoPlayer({ url, poster }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  const togglePlay = () => {
    if (!videoRef) return
    if (isPlaying) {
      videoRef.pause()
    } else {
      videoRef.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
      <video
        ref={setVideoRef}
        src={url}
        poster={poster}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white fill-white" />
          ) : (
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-0" />
          </div>
          <Volume2 className="h-5 w-5 text-white" />
          <Maximize className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}
