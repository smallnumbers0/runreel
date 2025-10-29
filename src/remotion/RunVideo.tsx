import React from 'react'
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Img,
} from 'remotion'

export type RunVideoProps = {
  runName: string
  distance: number
  duration: number
  pace: string
  date: string
  polylinePoints: [number, number][]
}

export const RunVideo: React.FC<RunVideoProps> = ({
  runName,
  distance,
  duration,
  pace,
  date,
  polylinePoints,
}) => {
  const { fps, width, height } = useVideoConfig()
  const frame = useCurrentFrame()

  // Animation progress
  const progress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 120,
  })

  // Calculate which point of the route we're at
  const routeProgress = interpolate(
    frame,
    [30, 270], // Start animating route after intro
    [0, polylinePoints.length - 1],
    {
      extrapolateRight: 'clamp',
    }
  )

  const currentPointIndex = Math.floor(routeProgress)
  const visiblePoints = polylinePoints.slice(0, currentPointIndex + 1)

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a1a',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Background gradient */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.8,
        }}
      />

      {/* Title sequence */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              transform: `scale(${progress})`,
              marginBottom: 20,
            }}
          >
            {runName}
          </div>
          <div
            style={{
              fontSize: 40,
              color: 'rgba(255, 255, 255, 0.9)',
              opacity: interpolate(frame, [20, 40], [0, 1]),
            }}
          >
            {new Date(date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Stats display */}
      <Sequence from={60} durationInFrames={210}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: 60,
          }}
        >
          {/* Map visualization placeholder */}
          <div
            style={{
              width: '80%',
              height: '60%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              marginBottom: 60,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 1000"
              style={{ position: 'absolute' }}
            >
              <path
                d={`M ${visiblePoints.map(p => `${p[0] * 10},${p[1] * 10}`).join(' L ')}`}
                stroke="#FFD700"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {currentPointIndex > 0 && (
                <circle
                  cx={visiblePoints[currentPointIndex][0] * 10}
                  cy={visiblePoints[currentPointIndex][1] * 10}
                  r="8"
                  fill="#FF6B6B"
                />
              )}
            </svg>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 40,
              width: '100%',
              maxWidth: 800,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                transform: `translateY(${interpolate(
                  frame,
                  [90, 110],
                  [50, 0]
                )}px)`,
                opacity: interpolate(frame, [90, 110], [0, 1]),
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFD700' }}>
                {(distance / 1000).toFixed(2)} km
              </div>
              <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.8)' }}>
                Distance
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                transform: `translateY(${interpolate(
                  frame,
                  [100, 120],
                  [50, 0]
                )}px)`,
                opacity: interpolate(frame, [100, 120], [0, 1]),
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFD700' }}>
                {formatDuration(duration)}
              </div>
              <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.8)' }}>
                Duration
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                transform: `translateY(${interpolate(
                  frame,
                  [110, 130],
                  [50, 0]
                )}px)`,
                opacity: interpolate(frame, [110, 130], [0, 1]),
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#FFD700' }}>
                {pace}
              </div>
              <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.8)' }}>
                Pace
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* End screen */}
      <Sequence from={240}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 30,
              opacity: interpolate(frame, [240, 260], [0, 1]),
            }}
          >
            Great Run! 🏃‍♂️
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.9)',
              opacity: interpolate(frame, [250, 270], [0, 1]),
            }}
          >
            Created with RunReel
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}