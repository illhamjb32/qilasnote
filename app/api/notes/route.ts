import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isEmailAllowed } from '@/lib/auth'

async function verifyAuth(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { error: 'Unauthorized', status: 401 }
  }
  
  if (!isEmailAllowed(user.email || '')) {
    return { error: 'Forbidden', status: 403 }
  }
  
  return { user }
}

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  
  const { user } = authResult
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const supabase = await createClient()
  let query = supabase.from('milk_records').select('*').eq('user_id', user.id)

  if (date) {
    query = query.eq('date', date)
  } else if (startDate) {
    query = query.gte('date', startDate)
    if (endDate) {
      query = query.lte('date', endDate)
    }
  }

  const { data, error } = await query.order('timestamp', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  
  const { user } = authResult
  
  try {
    const body = await request.json()
    const { amount, time, date, timestamp } = body
    
    if (!amount || !time || !date || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('milk_records')
      .insert([{ amount, time, date, timestamp, user_id: user.id }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  
  const { user } = authResult
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('milk_records')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
