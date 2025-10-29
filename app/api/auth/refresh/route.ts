import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CLIENT_ID = '104687'
const CLIENT_SECRET = '93ff8d5c0c02049c5667432fec55a47927e06fda'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('strava_refresh_token')

    if (!refreshToken) {
      return NextResponse.json({
        error: 'No refresh token',
        solution: 'Please sign in again'
      }, { status: 401 })
    }

    // Exchange refresh token for new access token
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken.value,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Token refresh failed:', error)

      // Clear invalid tokens
      cookieStore.delete('strava_access_token')
      cookieStore.delete('strava_refresh_token')

      return NextResponse.json({
        error: 'Failed to refresh token',
        details: error,
        solution: 'Please sign in again'
      }, { status: 401 })
    }

    const data = await response.json()

    // Update cookies with new tokens
    cookieStore.set('strava_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    if (data.refresh_token) {
      cookieStore.set('strava_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresAt: data.expires_at,
    })
  } catch (error: any) {
    console.error('Refresh error:', error)
    return NextResponse.json({
      error: 'Failed to refresh token',
      message: error.message,
    }, { status: 500 })
  }
}