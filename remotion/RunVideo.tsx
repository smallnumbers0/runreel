import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'
import polyline from 'polyline-encoded'

interface RunVideoProps {
  polylineString: string
  runName: string
  distance: number
  duration: number
}

export const RunVideo: React.FC<RunVideoProps> = ({
  polylineString,
  runName,
  distance,
  duration,
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Decode polyline to coordinates
  const coordinates = polyline.decode(polylineString).map(([lat, lng]) => ({ lat, lng }))

  // Calculate bounds for viewport
  const lats = coordinates.map(c => c.lat)
  const lngs = coordinates.map(c => c.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2

  // Map scale to fit route
  const latRange = maxLat - minLat
  const lngRange = maxLng - minLng
  const scale = Math.min(1080 / (lngRange * 111000), 1920 / (latRange * 111000)) * 10000

  // Convert coordinates to screen positions
  const screenCoords = coordinates.map(coord => ({
    x: ((coord.lng - centerLng) * scale) + 540,
    y: (-(coord.lat - centerLat) * scale) + 960,
  }))

  // Progress through route
  const progress = interpolate(frame, [0, durationInFrames], [0, 1])
  const currentIndex = Math.floor(progress * (screenCoords.length - 1))

  // Format time and distance
  const formattedDistance = (distance / 1000).toFixed(2) + ' km'
  const formattedTime = new Date(duration * 1000).toISOString().substr(11, 8)

  // Entrance animations
  const titleOpacity = spring({
    frame: frame - 10,
    fps,
    config: { damping: 100 },
  })

  const statsSlide = spring({
    frame: frame - 30,
    fps,
    config: { damping: 100 },
  })

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      {/* Map Background */}
      <AbsoluteFill style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        opacity: 0.3,
      }} />

      {/* Route Path */}
      <svg
        width={1080}
        height={1920}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Draw complete route */}
        <polyline
          points={screenCoords.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="6"
        />

        {/* Draw animated route progress */}
        <polyline
          points={screenCoords.slice(0, currentIndex + 1).map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#FF4500"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current position marker */}
        {currentIndex < screenCoords.length && (
          <circle
            cx={screenCoords[currentIndex].x}
            cy={screenCoords[currentIndex].y}
            r="12"
            fill="#3B82F6"
            stroke="white"
            strokeWidth="4"
          />
        )}

        {/* Start marker */}
        <circle
          cx={screenCoords[0].x}
          cy={screenCoords[0].y}
          r="10"
          fill="#22C55E"
          stroke="white"
          strokeWidth="3"
        />

        {/* End marker */}
        <circle
          cx={screenCoords[screenCoords.length - 1].x}
          cy={screenCoords[screenCoords.length - 1].y}
          r="10"
          fill="#EF4444"
          stroke="white"
          strokeWidth="3"
        />
      </svg>

      {/* Top Header */}
      <Sequence from={10}>
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            padding: '0 60px',
            opacity: titleOpacity,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              textShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
              marginBottom: 20,
            }}
          >
            {runName}
          </h1>
        </div>
      </Sequence>

      {/* Stats Panel */}
      <Sequence from={30}>
        <div
          style={{
            position: 'absolute',
            bottom: 200,
            left: 60,
            right: 60,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 24,
            padding: 40,
            transform: `translateY(${interpolate(statsSlide, [0, 1], [100, 0])}px)`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, color: '#6B7280', marginBottom: 8 }}>Distance</p>
              <p style={{ fontSize: 48, fontWeight: 'bold', color: '#111827' }}>
                {formattedDistance}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, color: '#6B7280', marginBottom: 8 }}>Duration</p>
              <p style={{ fontSize: 48, fontWeight: 'bold', color: '#111827' }}>
                {formattedTime}
              </p>
            </div>
          </div>
        </div>
      </Sequence>

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 500,
          }}
        >
          RunReel
        </p>
      </div>
    </AbsoluteFill>
  )
}