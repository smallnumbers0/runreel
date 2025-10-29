import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()

    return NextResponse.json({
      status: 'auth module loaded',
      hasSession: !!session,
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasStravaId: !!process.env.STRAVA_CLIENT_ID,
        hasStravaSecret: !!process.env.STRAVA_CLIENT_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    })
  }
}