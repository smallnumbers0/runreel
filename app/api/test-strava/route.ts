import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      error: 'Missing Strava credentials',
      clientId: clientId ? 'SET' : 'MISSING',
      clientSecret: clientSecret ? 'SET' : 'MISSING',
    }, { status: 500 })
  }

  // Test Strava API with client credentials
  try {
    // Exchange a dummy code to test if credentials are valid
    // This will fail but the error message will tell us if credentials are valid
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: 'test_code',
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    // If we get "invalid code" error, credentials are valid
    // If we get "invalid client" error, credentials are invalid
    if (data.message === 'Bad Request' && data.errors) {
      const error = data.errors[0]
      if (error.field === 'code' && error.code === 'invalid') {
        return NextResponse.json({
          status: 'Credentials are valid',
          message: 'Strava client ID and secret are correct',
          clientId: clientId,
        })
      }
    }

    return NextResponse.json({
      status: 'Credentials may be invalid',
      stravaResponse: data,
      clientId: clientId,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to test Strava API',
      message: error.message,
    }, { status: 500 })
  }
}