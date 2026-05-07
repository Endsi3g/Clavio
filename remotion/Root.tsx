import React from 'react'
import { Composition } from 'remotion'
import { MyVideo } from './MyVideo'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          titleText: 'Welcome to Clavio',
          titleColor: 'black',
        }}
      />
    </>
  )
}
