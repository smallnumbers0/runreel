import React from 'react'
import { Composition } from 'remotion'
import { RunVideo, RunVideoProps } from './RunVideo'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RunVideo"
        component={RunVideo}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          runName: 'Morning Run',
          distance: 5000,
          duration: 1800,
          pace: '6:00 /km',
          date: new Date().toISOString(),
          polylinePoints: [[0, 0], [10, 10], [20, 15], [30, 20], [40, 30]],
        }}
      />
    </>
  )
}