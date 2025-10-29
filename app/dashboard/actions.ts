'use server'

import { getSession } from '@/lib/simple-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function syncWithStrava() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/')
    return
  }

  try {
    // Fetch activities from Strava
    const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=20', {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Strava API error:', response.status, await response.text())
      throw new Error('Failed to fetch from Strava')
    }

    const activities = await response.json()
    const supabase = await createServerSupabaseClient()

    // First, ensure user profile exists
    await supabase
      .from('user_profiles')
      .upsert({
        id: session.user.id,
        strava_id: parseInt(session.user.id),
        name: session.user.name,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    // Filter for runs only
    const runs = activities.filter((activity: any) => activity.type === 'Run')

    // Store runs in database
    if (runs.length > 0) {
      const runsToInsert = []

      // Fetch detailed data for each run to get the full polyline
      for (const run of runs) {
        try {
          // Get detailed activity data
          const detailResponse = await fetch(
            `https://www.strava.com/api/v3/activities/${run.id}`,
            {
              headers: {
                'Authorization': `Bearer ${session.user.accessToken}`,
              },
            }
          )

          if (detailResponse.ok) {
            const detailedRun = await detailResponse.json()

            runsToInsert.push({
              id: detailedRun.id.toString(),
              user_id: session.user.id,
              strava_id: detailedRun.id,
              name: detailedRun.name || 'Untitled Run',
              distance: detailedRun.distance || 0,
              duration: detailedRun.moving_time || 0,
              start_date: detailedRun.start_date,
              // Use detailed polyline if available, otherwise summary
              polyline: detailedRun.map?.polyline || detailedRun.map?.summary_polyline || null,
              average_speed: detailedRun.average_speed || 0,
              max_speed: detailedRun.max_speed || 0,
              total_elevation_gain: detailedRun.total_elevation_gain || 0,
              sport_type: detailedRun.sport_type || 'Run',
            })
          } else {
            // Fallback to basic data if detail fetch fails
            runsToInsert.push({
              id: run.id.toString(),
              user_id: session.user.id,
              strava_id: run.id,
              name: run.name || 'Untitled Run',
              distance: run.distance || 0,
              duration: run.moving_time || 0,
              start_date: run.start_date,
              polyline: run.map?.summary_polyline || null,
              average_speed: run.average_speed || 0,
              max_speed: run.max_speed || 0,
              total_elevation_gain: run.total_elevation_gain || 0,
              sport_type: run.sport_type || 'Run',
            })
          }
        } catch (error) {
          console.error(`Failed to fetch details for activity ${run.id}:`, error)
          // Use basic data if fetching details fails
          runsToInsert.push({
            id: run.id.toString(),
            user_id: session.user.id,
            strava_id: run.id,
            name: run.name || 'Untitled Run',
            distance: run.distance || 0,
            duration: run.moving_time || 0,
            start_date: run.start_date,
            polyline: run.map?.summary_polyline || null,
            average_speed: run.average_speed || 0,
            max_speed: run.max_speed || 0,
            total_elevation_gain: run.total_elevation_gain || 0,
            sport_type: run.sport_type || 'Run',
          })
        }
      }

      if (runsToInsert.length > 0) {
        await supabase
          .from('runs')
          .upsert(runsToInsert, {
            onConflict: 'id',
          })
      }
    }
  } catch (error) {
    console.error('Sync error:', error)
  }

  redirect('/dashboard')
}