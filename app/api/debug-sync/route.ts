import { NextResponse } from 'next/server'
import { getSession } from '@/lib/simple-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch ONE activity from Strava to debug
    const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=1', {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        error: 'Strava API error',
        status: response.status,
        statusText: response.statusText,
      }, { status: 500 })
    }

    const activities = await response.json()

    if (activities.length === 0) {
      return NextResponse.json({
        message: 'No activities found',
      })
    }

    const activity = activities[0]

    // Get detailed activity
    const detailResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${activity.id}`,
      {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      }
    )

    const detailed = await detailResponse.json()

    // Check database
    const supabase = await createServerSupabaseClient()
    const { data: dbRun } = await supabase
      .from('runs')
      .select('*')
      .eq('id', activity.id.toString())
      .single()

    return NextResponse.json({
      summary: {
        id: activity.id,
        name: activity.name,
        has_summary_polyline: !!activity.map?.summary_polyline,
        summary_polyline_length: activity.map?.summary_polyline?.length || 0,
      },
      detailed: {
        id: detailed.id,
        name: detailed.name,
        has_polyline: !!detailed.map?.polyline,
        has_summary_polyline: !!detailed.map?.summary_polyline,
        polyline_length: detailed.map?.polyline?.length || 0,
        summary_polyline_length: detailed.map?.summary_polyline?.length || 0,
        start_date: detailed.start_date,
        distance: detailed.distance,
        moving_time: detailed.moving_time,
      },
      database: {
        exists: !!dbRun,
        has_polyline: !!dbRun?.polyline,
        polyline_length: dbRun?.polyline?.length || 0,
        start_date: dbRun?.start_date,
      },
      debug: {
        access_token_exists: !!session.user.accessToken,
        user_id: session.user.id,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}