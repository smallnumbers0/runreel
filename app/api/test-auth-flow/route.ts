import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-minimal'

export async function GET() {
  try {
    // Try to get session
    const session = await auth()

    return NextResponse.json({
      status: 'Auth working',
      session: session || null,
      hasSession: !!session,
      user: session?.user || null,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'Auth error',
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}