import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Test basic Supabase connection
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try to query a simple table
    const { data, error } = await supabase
      .from('runs')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        details: error
      })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working',
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
    })
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message
    })
  }
}