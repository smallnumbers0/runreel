import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/simple-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch activities from Strava
    const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=20', {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Strava API error:', await response.text())
      return NextResponse.json({ error: 'Failed to fetch from Strava' }, { status: 500 })
    }

    const activities = await response.json()
    const supabase = await createServerSupabaseClient()

    // First, ensure user profile exists
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: session.user.id,
        strava_id: parseInt(session.user.id),
        name: session.user.name,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
    }

    // Filter for runs only
    const runs = activities.filter((activity: any) => activity.type === 'Run')

    // Store runs in database
    const runsToInsert = runs.map((run: any) => ({
      id: run.id.toString(),
      user_id: session.user.id,
      strava_id: run.id,
      name: run.name,
      distance: run.distance,
      duration: run.moving_time,
      start_date: run.start_date,
      polyline: run.map?.summary_polyline || null,
      average_speed: run.average_speed,
      max_speed: run.max_speed,
      total_elevation_gain: run.total_elevation_gain,
      sport_type: run.sport_type || 'Run',
    }))

    if (runsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('runs')
        .upsert(runsToInsert, {
          onConflict: 'id',
        })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({
          error: 'Failed to save runs',
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Sync successful',
        count: runsToInsert.length
      })
    }

    return NextResponse.json({
      message: 'No runs to sync',
      count: 0
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}