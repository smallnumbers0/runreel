import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CLIENT_ID = '104687'
const CLIENT_SECRET = '93ff8d5c0c02049c5667432fec55a47927e06fda'

export async function GET(request: NextRequest) {
  // Check if this is a callback with a code
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (code) {
    // Exchange code for access token
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Token exchange failed:', error)
        return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
      }

      const data = await response.json()

      // Set cookies for the session
      const cookieStore = await cookies()
      cookieStore.set('strava_access_token', data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      cookieStore.set('strava_athlete_id', String(data.athlete.id), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      cookieStore.set('strava_athlete_name', `${data.athlete.firstname} ${data.athlete.lastname}`, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error: any) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/?error=oauth_failed', request.url))
    }
  }

  // Initiate OAuth flow
  const redirectUri = `${request.nextUrl.origin}/api/auth/strava`
  const scope = 'read,activity:read_all'
  const stateParam = Math.random().toString(36).substring(7)

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${stateParam}&approval_prompt=auto`

  return NextResponse.redirect(authUrl)
}