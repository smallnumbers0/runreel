import { NextResponse } from 'next/server'

export async function GET() {
  // Check all required environment variables
  const envCheck = {
    STRAVA_CLIENT_ID: {
      exists: !!process.env.STRAVA_CLIENT_ID,
      value: process.env.STRAVA_CLIENT_ID ? '✓ Set' : '✗ Missing',
      length: process.env.STRAVA_CLIENT_ID?.length || 0,
    },
    STRAVA_CLIENT_SECRET: {
      exists: !!process.env.STRAVA_CLIENT_SECRET,
      value: process.env.STRAVA_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
      length: process.env.STRAVA_CLIENT_SECRET?.length || 0,
      preview: process.env.STRAVA_CLIENT_SECRET ?
        `${process.env.STRAVA_CLIENT_SECRET.substring(0, 4)}...${process.env.STRAVA_CLIENT_SECRET.substring(process.env.STRAVA_CLIENT_SECRET.length - 4)}` :
        'Not set',
    },
    NEXTAUTH_SECRET: {
      exists: !!process.env.NEXTAUTH_SECRET,
      value: process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing',
      length: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    NEXTAUTH_URL: {
      exists: !!process.env.NEXTAUTH_URL,
      value: process.env.NEXTAUTH_URL || 'Not set',
    },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  }

  // Check if NextAuth can be imported
  let authImportStatus = 'unknown'
  try {
    const auth = await import('@/lib/auth')
    authImportStatus = auth ? 'Success' : 'Failed'
  } catch (error: any) {
    authImportStatus = `Error: ${error.message}`
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    authImportStatus,
    nextAuthVersion: '5.0.0-beta.30',
    nodeVersion: process.version,
  })
}