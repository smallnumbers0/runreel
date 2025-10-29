import { Composition } from 'remotion'
import { RunVideo } from './RunVideo'

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="RunVideo"
        component={RunVideo as any}
        durationInFrames={300} // 10 seconds at 30 fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          polylineString: '',
          runName: 'My Run',
          distance: 5000,
          duration: 1800,
        }}
      />
    </>
  )
}