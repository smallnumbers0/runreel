import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('strava_access_token')
  const athleteId = cookieStore.get('strava_athlete_id')
  const athleteName = cookieStore.get('strava_athlete_name')

  if (!accessToken || !athleteId) {
    return null
  }

  return {
    user: {
      id: athleteId.value,
      name: athleteName?.value || 'Strava User',
      accessToken: accessToken.value,
    },
  }
}

export async function signOutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('strava_access_token')
  cookieStore.delete('strava_athlete_id')
  cookieStore.delete('strava_athlete_name')
}