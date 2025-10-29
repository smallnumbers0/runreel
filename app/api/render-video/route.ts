import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/simple-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import polyline from 'polyline-encoded'

// For now, we'll generate a simple MP4 using a placeholder
// In production, this would use Remotion's renderMedia API
async function generateVideo(runData: any) {
  // Decode polyline if available
  let points: [number, number][] = []
  if (runData.polyline) {
    try {
      points = polyline.decode(runData.polyline)
    } catch (e) {
      console.error('Failed to decode polyline:', e)
    }
  }

  // Calculate pace
  const kmDistance = runData.distance / 1000
  const minutes = runData.duration / 60
  const paceMinutes = Math.floor(minutes / kmDistance)
  const paceSeconds = Math.round((minutes / kmDistance - paceMinutes) * 60)
  const pace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} /km`

  // In a real implementation, we would:
  // 1. Use Remotion's renderMedia API
  // 2. Upload to cloud storage (e.g., Supabase Storage)
  // 3. Return the video URL

  // For MVP, return a placeholder video URL
  // You can replace this with an actual sample video URL
  const videoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'

  return {
    url: videoUrl,
    thumbnail: 'https://via.placeholder.com/1080x1920',
    metadata: {
      runName: runData.name,
      distance: kmDistance,
      duration: runData.duration,
      pace,
      points,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { runId, videoId } = await request.json()

    if (!runId || !videoId) {
      return NextResponse.json({ error: 'Missing runId or videoId' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Fetch run data
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', session.user.id)
      .single()

    if (runError || !run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    // Generate video
    const video = await generateVideo(run)

    // Update video record
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        video_url: video.url,
        thumbnail_url: video.thumbnail,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId)
      .eq('user_id', session.user.id)

    if (updateError) {
      console.error('Failed to update video:', updateError)
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      video: {
        url: video.url,
        thumbnail: video.thumbnail,
      }
    })
  } catch (error: any) {
    console.error('Video render error:', error)
    return NextResponse.json({
      error: 'Failed to render video',
      details: error.message
    }, { status: 500 })
  }
}