import React from 'react'
import { Composition } from 'remotion'
import { MyVideo } from './MyVideo'
import { ClavioClip, type ClavioClipProps } from './ClavioClip'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClavioClip"
        component={ClavioClip as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoUrl: '',
          caption: 'Votre caption ici',
          title: 'Clavio',
          brandColor: '#60A5FA',
          showProgressBar: true,
          showCaption: true,
        }}
      />
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: 'Welcome to Clavio',
          titleColor: '#60A5FA',
        }}
      />
    </>
  )
}
