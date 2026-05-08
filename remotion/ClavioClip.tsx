import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Video,
  staticFile,
  Audio,
} from 'remotion'
import React from 'react'

export interface ClavioClipProps {
  videoUrl: string
  caption: string
  title: string
  startFrom?: number
  brandColor?: string
  showProgressBar?: boolean
  showCaption?: boolean
}

const ProgressBar: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const progress = frame / durationInFrames

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: `${progress * 100}%`,
        height: 4,
        backgroundColor: color,
        borderRadius: '0 2px 2px 0',
      }}
    />
  )
}

const CaptionOverlay: React.FC<{ caption: string }> = ({ caption }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        padding: '0 40px',
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          borderRadius: 12,
          padding: '12px 20px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {caption}
        </p>
      </div>
    </div>
  )
}

export const ClavioClip: React.FC<ClavioClipProps> = ({
  videoUrl,
  caption,
  title,
  brandColor = '#60A5FA',
  showProgressBar = true,
  showCaption = true,
}) => {
  const { width, height } = useVideoConfig()
  const frame = useCurrentFrame()

  // Fade in on first 20 frames
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity }}>
      <Video
        src={videoUrl}
        style={{ width, height, objectFit: 'cover' }}
      />

      {showCaption && caption && <CaptionOverlay caption={caption} />}

      {/* Title badge at top */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          backgroundColor: brandColor,
          borderRadius: 8,
          padding: '6px 14px',
        }}
      >
        <p
          style={{
            fontFamily: 'sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            margin: 0,
          }}
        >
          {title}
        </p>
      </div>

      {showProgressBar && <ProgressBar color={brandColor} />}
    </AbsoluteFill>
  )
}
