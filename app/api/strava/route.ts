import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStravaActivities, saveRunToDatabase } from '@/lib/strava'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch activities from Strava
    const activities = await getStravaActivities(session.user.id)

    // Save to database
    const supabase = await createServerSupabaseClient()
    const savedRuns = []

    for (const activity of activities) {
      // Check if run already exists
      const { data: existingRun } = await supabase
        .from('runs')
        .select('id')
        .eq('strava_id', activity.id)
        .single()

      if (!existingRun) {
        const run = await saveRunToDatabase(activity, session.user.id)
        savedRuns.push(run)
      }
    }

    // Get all runs from database
    const { data: runs, error } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('start_date', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return NextResponse.json({ runs, newRuns: savedRuns.length })
  } catch (error) {
    console.error('Error fetching Strava activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}