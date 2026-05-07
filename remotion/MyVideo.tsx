import { interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import React from 'react'

export const MyVideo: React.FC<{
  titleText: string
  titleColor: string
}> = ({ titleText, titleColor }) => {
  const frame = useCurrentFrame()
  const { durationInFrames, fps } = useVideoConfig()

  // Fade in animation over the first 30 frames
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  })

  // Move text up slightly
  const translateY = interpolate(frame, [0, 30], [50, 0], {
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Sequence from={0} durationInFrames={durationInFrames}>
        <h1
          style={{
            fontFamily: 'sans-serif',
            fontSize: 80,
            color: titleColor,
            opacity,
            transform: `translateY(${translateY}px)`,
          }}
        >
          {titleText}
        </h1>
      </Sequence>
    </div>
  )
}
