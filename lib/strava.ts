import { createServerSupabaseClient, createServiceSupabaseClient } from './supabase-server'

interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  workout_type: number | null
  start_date: string
  start_date_local: string
  timezone: string
  utc_offset: number
  location_city: string | null
  location_state: string | null
  location_country: string
  achievement_count: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map: {
    id: string
    summary_polyline: string
    resource_state: number
  }
  trainer: boolean
  commute: boolean
  manual: boolean
  private: boolean
  visibility: string
  flagged: boolean
  gear_id: string | null
  start_latlng: [number, number]
  end_latlng: [number, number]
  average_speed: number
  max_speed: number
  has_heartrate: boolean
  heartrate_opt_out: boolean
  display_hide_heartrate_option: boolean
}

export async function getStravaActivities(userId: string, limit: number = 10): Promise<StravaActivity[]> {
  const supabase = await createServiceSupabaseClient()

  // Get user's Strava tokens
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('strava_access_token, strava_refresh_token, strava_token_expires_at')
    .eq('user_id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to get user profile')
  }

  // Check if token needs refresh
  let accessToken = profile.strava_access_token
  if (profile.strava_token_expires_at && new Date(profile.strava_token_expires_at) <= new Date()) {
    accessToken = await refreshStravaToken(userId, profile.strava_refresh_token!)
  }

  // Fetch activities from Strava
  const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Strava activities: ${response.statusText}`)
  }

  const activities: StravaActivity[] = await response.json()

  // Filter to only running activities
  return activities.filter(activity =>
    activity.type === 'Run' || activity.sport_type === 'Run'
  )
}

export async function getStravaActivity(activityId: number, userId: string): Promise<StravaActivity> {
  const supabase = await createServiceSupabaseClient()

  // Get user's Strava tokens
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('strava_access_token, strava_refresh_token, strava_token_expires_at')
    .eq('user_id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to get user profile')
  }

  // Check if token needs refresh
  let accessToken = profile.strava_access_token
  if (profile.strava_token_expires_at && new Date(profile.strava_token_expires_at) <= new Date()) {
    accessToken = await refreshStravaToken(userId, profile.strava_refresh_token!)
  }

  // Fetch activity details
  const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Strava activity: ${response.statusText}`)
  }

  return response.json()
}

export async function getActivityStream(activityId: number, userId: string) {
  const supabase = await createServiceSupabaseClient()

  // Get user's Strava tokens
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('strava_access_token, strava_refresh_token, strava_token_expires_at')
    .eq('user_id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to get user profile')
  }

  // Check if token needs refresh
  let accessToken = profile.strava_access_token
  if (profile.strava_token_expires_at && new Date(profile.strava_token_expires_at) <= new Date()) {
    accessToken = await refreshStravaToken(userId, profile.strava_refresh_token!)
  }

  // Fetch GPS stream
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,time,distance,altitude&key_by_type=true`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch activity stream: ${response.statusText}`)
  }

  return response.json()
}

async function refreshStravaToken(userId: string, refreshToken: string): Promise<string> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token')
  }

  const data = await response.json()

  // Update tokens in database
  const supabase = await createServiceSupabaseClient()
  await supabase
    .from('user_profiles')
    .update({
      strava_access_token: data.access_token,
      strava_refresh_token: data.refresh_token,
      strava_token_expires_at: new Date(data.expires_at * 1000).toISOString(),
    })
    .eq('user_id', userId)

  return data.access_token
}

export async function saveRunToDatabase(activity: StravaActivity, userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('runs')
    .insert({
      user_id: userId,
      strava_id: activity.id,
      name: activity.name,
      distance: activity.distance,
      duration: activity.moving_time,
      polyline: activity.map?.summary_polyline || null,
      start_date: activity.start_date,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}