import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-service'
import { createClient } from '@/lib/supabase-server'
import { SHARED_USER_ID } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET user settings - dengan auth check proper
export async function GET(request: NextRequest) {
  try {
    // 1. Verify auth dari client
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please login' },
        { status: 401 }
      )
    }

    // 2. Query pakai service role (bypass RLS) - SHARED dataset (fixed owner ID)
    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('user_settings')
      .select('*')
      .eq('user_id', SHARED_USER_ID)
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: error.message },
        { status: 500 }
      )
    }

    // If no settings exist, return defaults (user_id = shared owner)
    if (!data) {
      return NextResponse.json({
        user_id: SHARED_USER_ID,
        daily_target: 1000,
        daily_target_mpasi: 500,
        notifications_enabled: true,
        reminder_interval: 4
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST/PUT user settings - create or update
export async function POST(request: NextRequest) {
  try {
    // 1. Verify auth
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please login' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { daily_target, daily_target_mpasi, notifications_enabled, reminder_interval } = body

    // 3. Upsert with service role
    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('user_settings')
      .upsert(
        {
          user_id: SHARED_USER_ID,
          daily_target: daily_target || 1000,
          daily_target_mpasi: daily_target_mpasi || 500,
          notifications_enabled: notifications_enabled ?? true,
          reminder_interval: reminder_interval || 4,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting user settings:', error)
      return NextResponse.json(
        { error: 'Failed to save settings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
