import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase-server'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { runId } = await request.json()

    if (!runId) {
      return NextResponse.json({ error: 'Run ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Get run details
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', session.user.id)
      .single()

    if (runError || !run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    // Create video record
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        run_id: runId,
        user_id: session.user.id,
        status: 'processing',
      } as any)
      .select()
      .single() as { data: any, error: any }

    if (videoError || !video) {
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 })
    }

    // Generate video in the background (simplified for MVP)
    // In production, this would be handled by a queue/worker system
    generateVideoAsync(video.id, run, session.user.id).catch(console.error)

    return NextResponse.json({ videoId: video.id, status: 'processing' })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}

async function generateVideoAsync(
  videoId: string,
  run: any,
  userId: string
) {
  try {
    const serviceSupabase = await createServiceSupabaseClient()

    // For MVP, we'll use a placeholder video URL
    // In production, you would:
    // 1. Bundle Remotion composition
    // 2. Render the video
    // 3. Upload to Supabase Storage
    // 4. Update the video record with the URL

    // Simulate video generation delay
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Mock video upload to Supabase Storage
    const videoFileName = `${userId}/${videoId}.mp4`

    // In production, you would upload the actual video file here
    // const { data: uploadData, error: uploadError } = await serviceSupabase.storage
    //   .from('videos')
    //   .upload(videoFileName, videoBuffer, {
    //     contentType: 'video/mp4',
    //   })

    // For now, we'll use a placeholder URL
    const videoUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${videoFileName}`

    // Update video record with URL
    await serviceSupabase
      .from('videos')
      .update({
        video_url: videoUrl,
        status: 'completed',
      } as any)
      .eq('id', videoId)

  } catch (error) {
    console.error('Error generating video:', error)

    // Update video status to failed
    const serviceSupabase = await createServiceSupabaseClient()
    await serviceSupabase
      .from('videos')
      .update({
        status: 'failed',
      } as any)
      .eq('id', videoId)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('id')

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', session.user.id)
      .single()

    if (error || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}