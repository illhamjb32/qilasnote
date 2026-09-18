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

    // 2. Query data with serviceClient if available, otherwise authClient
    const serviceClient = createServiceClient()
    const client = serviceClient || authClient

    const { data, error } = await client
      .from('user_settings')
      .select('*')
      .eq('user_id', SHARED_USER_ID)
      .limit(1)
      .maybeSingle()

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

    const fields = {
      daily_target: daily_target || 1000,
      daily_target_mpasi: daily_target_mpasi || 500,
      notifications_enabled: notifications_enabled ?? true,
      reminder_interval: reminder_interval || 4,
      updated_at: new Date().toISOString()
    }

    // 3. Upsert with serviceClient if available, otherwise authClient
    //    NOTE: .upsert({ onConflict: 'user_id' }) fails with 42P10 because
    //    user_id has no unique constraint in the DB. Use update-then-insert
    //    instead — UPDATE ... WHERE user_id = ... needs no constraint.
    const serviceClient = createServiceClient()
    const client = serviceClient || authClient

    const { data: updated, error: updateError } = await client
      .from('user_settings')
      .update(fields)
      .eq('user_id', SHARED_USER_ID)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('Error updating user settings:', updateError)
      return NextResponse.json(
        { error: 'Failed to save settings', details: updateError.message },
        { status: 500 }
      )
    }

    if (updated) {
      return NextResponse.json(updated)
    }

    // 4. No existing row -> insert
    const { data: inserted, error: insertError } = await client
      .from('user_settings')
      .insert({ user_id: SHARED_USER_ID, ...fields })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting user settings:', insertError)
      return NextResponse.json(
        { error: 'Failed to save settings', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(inserted)
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
